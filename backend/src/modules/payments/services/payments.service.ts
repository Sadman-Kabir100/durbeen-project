import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomBytes } from "crypto";
import { OrdersService } from "@/modules/orders/services/orders.service";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@/modules/orders/enums/order-status.enum";
import { Payment } from "../entities/payment.entity";
import { Refund } from "../entities/refund.entity";
import { RefundReason, RefundStatus } from "../enums/refund.enum";
import { PaymentProviderRegistry } from "../providers/payment-provider.registry";
import type { InitiatePaymentResponseDto } from "../dto/initiate-payment-response.dto";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Refund) private readonly refundRepository: Repository<Refund>,
    private readonly ordersService: OrdersService,
    private readonly providerRegistry: PaymentProviderRegistry
  ) {}

  async initiatePayment(orderId: string, method: PaymentMethod): Promise<InitiatePaymentResponseDto> {
    const order = await this.ordersService.findById(orderId);

    if (order.paymentStatus === PaymentStatus.SUCCESS) {
      throw new BadRequestException("এই অর্ডারের পেমেন্ট ইতিমধ্যে সম্পন্ন হয়েছে");
    }

    const payment = await this.paymentRepository.save(
      this.paymentRepository.create({
        orderId,
        provider: method,
        merchantInvoiceNo: this.generateMerchantInvoiceNo(order.orderNumber),
        amount: order.totalAmount,
        currency: "BDT",
        status: PaymentStatus.PENDING,
        initiatedAt: new Date(),
      })
    );

    const provider = this.providerRegistry.get(method);
    const result = await provider.initiate(order, payment);

    payment.gatewayResponse = result.rawResponse;
    payment.providerTransactionId = result.providerSessionId;
    await this.paymentRepository.save(payment);

    if (method === PaymentMethod.COD) {
      // COD-তে কোনো গেটওয়ে-ওয়েট নেই — সরাসরি অর্ডার কনফার্ম করে দেওয়া হয়,
      // টাকা ডেলিভারির সময় সংগ্রহ হবে (Delivery মডিউলে হুক করা হবে পরের ধাপে)
      await this.ordersService.transitionStatus(orderId, OrderStatus.CONFIRMED, "system:cod-auto-confirm");
      await this.ordersService.updatePaymentStatus(orderId, PaymentStatus.PENDING);
    } else if (result.redirectUrl) {
      await this.ordersService.transitionStatus(orderId, OrderStatus.AWAITING_PAYMENT, "system:payment-initiated");
    } else {
      // provider.initiate() ব্যর্থ হয়েছে (redirectUrl null অনলাইন গেটওয়ের জন্য)
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = "গেটওয়ে সেশন তৈরি করতে ব্যর্থ";
      await this.paymentRepository.save(payment);
      throw new BadRequestException("পেমেন্ট গেটওয়ে সেশন তৈরি করা যায়নি, একটু পর আবার চেষ্টা করুন");
    }

    return {
      paymentId: payment.id,
      redirectUrl: result.redirectUrl,
      status: payment.status,
    };
  }

  /**
   * ⚠️ গুরুত্বপূর্ণ: এটাই সব গেটওয়ের webhook/IPN/callback-এর জন্য একক এন্ট্রি পয়েন্ট।
   * PaymentController raw provider name (bkash/nagad/sslcommerz/rocket) পাস করে,
   * এই মেথড সঠিক provider বেছে signature ভেরিফাই করে, তারপর verifyCallback() কল করে।
   * ব্রাউজার রিডাইরেক্টের status query param-কে কখনোই সত্যি হিসেবে ধরা হয় না —
   * verifyCallback()-এর রিটার্নই একমাত্র সত্যের উৎস (bKash execute / SSLCommerz validation API)।
   */
  async handleWebhook(
    providerName: string,
    payload: Record<string, unknown>,
    headers: Record<string, string>
  ): Promise<{ received: boolean }> {
    const provider = this.providerRegistry.getByName(providerName);

    if (!provider.verifySignature(payload, headers)) {
      this.logger.warn(`"${providerName}" webhook signature ভেরিফিকেশন ব্যর্থ — payload প্রত্যাখ্যান করা হলো`);
      throw new BadRequestException("অবৈধ webhook signature");
    }

    const verification = await provider.verifyCallback(payload);

    // merchantInvoiceNo দিয়ে payment খুঁজে বের করা — payload-এ সাধারণত tran_id/merchantInvoiceNumber থাকে
    const merchantInvoiceNo = this.extractMerchantInvoiceNo(payload);
    if (!merchantInvoiceNo) {
      throw new BadRequestException("payload-এ merchant invoice/transaction ID পাওয়া যায়নি");
    }

    const payment = await this.paymentRepository.findOne({ where: { merchantInvoiceNo } });
    if (!payment) {
      throw new NotFoundException(`merchantInvoiceNo "${merchantInvoiceNo}" এর সাথে মিলে এমন পেমেন্ট পাওয়া যায়নি`);
    }

    // amount tampering প্রতিরোধ — গেটওয়ে যে amount ভেরিফাই করেছে তা আমাদের রেকর্ডের সাথে না মিললে reject
    if (
      verification.isSuccessful &&
      verification.verifiedAmount &&
      Number(verification.verifiedAmount) !== Number(payment.amount)
    ) {
      this.logger.error(
        `Amount mismatch! payment ${payment.id}: expected ৳${payment.amount}, গেটওয়ে confirm করেছে ৳${verification.verifiedAmount}`
      );
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = "Amount mismatch — সম্ভাব্য tampering সন্দেহ";
      await this.paymentRepository.save(payment);
      throw new BadRequestException("পেমেন্ট amount মিলছে না");
    }

    payment.gatewayResponse = verification.rawResponse;
    payment.providerTransactionId = verification.providerTransactionId ?? payment.providerTransactionId;
    payment.completedAt = new Date();

    if (verification.isSuccessful) {
      payment.status = PaymentStatus.SUCCESS;
      await this.paymentRepository.save(payment);
      await this.ordersService.updatePaymentStatus(payment.orderId, PaymentStatus.SUCCESS);
      await this.ordersService.transitionStatus(
        payment.orderId,
        OrderStatus.CONFIRMED,
        `webhook:${providerName}`
      );
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = verification.failureReason ?? "অজানা কারণে পেমেন্ট ব্যর্থ";
      await this.paymentRepository.save(payment);
      await this.ordersService.updatePaymentStatus(payment.orderId, PaymentStatus.FAILED);
      await this.ordersService.transitionStatus(
        payment.orderId,
        OrderStatus.PAYMENT_FAILED,
        `webhook:${providerName}`,
        payment.failureReason
      );
    }

    return { received: true };
  }

  async requestRefund(
    paymentId: string,
    amount: string,
    reason: RefundReason,
    requestedBy: string,
    reasonNote?: string
  ): Promise<Refund> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
    if (!payment) {
      throw new NotFoundException("পেমেন্ট পাওয়া যায়নি");
    }
    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException("শুধু সফল পেমেন্টের জন্যই রিফান্ড অনুরোধ করা যায়");
    }
    if (Number(amount) > Number(payment.amount)) {
      throw new BadRequestException("রিফান্ড amount মূল পেমেন্টের চেয়ে বেশি হতে পারে না");
    }

    const refund = await this.refundRepository.save(
      this.refundRepository.create({
        paymentId,
        amount,
        reason,
        reasonNote,
        status: RefundStatus.PROCESSING,
        requestedBy,
        requestedAt: new Date(),
      })
    );

    const provider = this.providerRegistry.get(payment.provider as PaymentMethod);
    const result = await provider.refund(payment, amount, reason);

    refund.gatewayResponse = result.rawResponse;
    refund.providerRefundId = result.providerRefundId;

    if (result.isSuccessful) {
      refund.status = RefundStatus.COMPLETED;
      refund.completedAt = new Date();
      await this.updatePaymentAfterRefund(payment, amount);
    } else {
      // গেটওয়ে-লেভেল স্বয়ংক্রিয় রিফান্ড ব্যর্থ/অসমর্থিত হলে "pending" রাখা হচ্ছে যাতে
      // অ্যাডমিন প্যানেল থেকে ম্যানুয়ালি সম্পন্ন করে মার্ক করা যায় (COD/Nagad-এর ক্ষেত্রে এটাই স্বাভাবিক পথ)
      refund.status = RefundStatus.PENDING;
      refund.reasonNote = `${reasonNote ?? ""} [স্বয়ংক্রিয় রিফান্ড ব্যর্থ: ${result.failureReason}]`.trim();
    }

    return this.refundRepository.save(refund);
  }

  /** অ্যাডমিন প্যানেল থেকে ম্যানুয়াল রিফান্ড (COD/Nagad) সম্পন্ন করার এন্ডপয়েন্ট এটি ব্যবহার করবে */
  async markRefundCompletedManually(refundId: string, adminUserId: string): Promise<Refund> {
    const refund = await this.refundRepository.findOne({ where: { id: refundId } });
    if (!refund) {
      throw new NotFoundException("রিফান্ড রেকর্ড পাওয়া যায়নি");
    }
    if (refund.status === RefundStatus.COMPLETED) {
      throw new BadRequestException("এই রিফান্ড ইতিমধ্যে সম্পন্ন চিহ্নিত করা আছে");
    }

    const payment = await this.paymentRepository.findOne({ where: { id: refund.paymentId } });
    if (!payment) {
      throw new NotFoundException("সংশ্লিষ্ট পেমেন্ট পাওয়া যায়নি");
    }

    refund.status = RefundStatus.COMPLETED;
    refund.completedAt = new Date();
    refund.reasonNote = `${refund.reasonNote ?? ""} [অ্যাডমিন (${adminUserId}) কর্তৃক ম্যানুয়ালি সম্পন্ন]`.trim();

    await this.updatePaymentAfterRefund(payment, refund.amount);
    return this.refundRepository.save(refund);
  }

  private async updatePaymentAfterRefund(payment: Payment, refundedAmount: string): Promise<void> {
    const totalRefunded = await this.getTotalRefundedAmount(payment.id);
    const newTotal = Number(totalRefunded) + Number(refundedAmount);
    const isFullyRefunded = newTotal >= Number(payment.amount);

    payment.status = isFullyRefunded ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
    await this.paymentRepository.save(payment);

    if (isFullyRefunded) {
      await this.ordersService.updatePaymentStatus(payment.orderId, PaymentStatus.REFUNDED);
      await this.ordersService.transitionStatus(payment.orderId, OrderStatus.REFUNDED, "system:refund-completed");
    }
  }

  private async getTotalRefundedAmount(paymentId: string): Promise<string> {
    const result = await this.refundRepository
      .createQueryBuilder("refund")
      .select("COALESCE(SUM(refund.amount), 0)", "total")
      .where("refund.paymentId = :paymentId", { paymentId })
      .andWhere("refund.status = :status", { status: RefundStatus.COMPLETED })
      .getRawOne<{ total: string }>();
    return result?.total ?? "0";
  }

  private generateMerchantInvoiceNo(orderNumber: string): string {
    return `${orderNumber}-${randomBytes(3).toString("hex").toUpperCase()}`;
  }

  private extractMerchantInvoiceNo(payload: Record<string, unknown>): string | null {
    // ভিন্ন গেটওয়ে ভিন্ন ফিল্ড নামে পাঠায় — এখানে সবগুলোর সম্ভাব্য নাম চেক করা হচ্ছে
    return (
      (payload.tran_id as string) ??
      (payload.merchantInvoiceNumber as string) ??
      (payload.orderId as string) ??
      null
    );
  }
}
