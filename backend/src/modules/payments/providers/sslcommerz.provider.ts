import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Order } from "@/modules/orders/entities/order.entity";
import type { Payment } from "../entities/payment.entity";
import type {
  PaymentInitiationResult,
  PaymentProvider,
  PaymentVerificationResult,
  RefundResult,
} from "../interfaces/payment-provider.interface";

interface SslcommerzConfig {
  storeId: string;
  storePassword: string;
  isSandbox: boolean;
  apiBaseUrl: string;
}

/**
 * SSLCommerz-এর অফিসিয়াল "Session API" (POST /gwprocess/v4/api.php) ও
 * "Validation API" (GET /validator/api/validationserverAPI.php) এর কাঠামো অনুসরণ করে
 * লেখা হয়েছে (আনুষ্ঠানিক ডকুমেন্টেশনের request/response ফিল্ড অনুযায়ী)। যেহেতু এই sandbox
 * পরিবেশে আসল merchant credentials ও নেটওয়ার্ক অ্যাক্সেস নেই, এটি লাইভ টেস্ট করা যায়নি —
 * প্রোডাকশনে বসানোর আগে সবসময় SSLCommerz sandbox ক্রেডেনশিয়াল দিয়ে end-to-end টেস্ট করুন।
 */
@Injectable()
export class SslcommerzProvider implements PaymentProvider {
  readonly providerName = "sslcommerz";
  private readonly logger = new Logger(SslcommerzProvider.name);
  private readonly config: SslcommerzConfig;
  private readonly appBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<SslcommerzConfig>("payment.sslcommerz")!;
    this.appBaseUrl = this.configService.get<string>("payment.appBaseUrl")!;
  }

  async initiate(order: Order, payment: Payment): Promise<PaymentInitiationResult> {
    const params = new URLSearchParams({
      store_id: this.config.storeId,
      store_passwd: this.config.storePassword,
      total_amount: payment.amount,
      currency: payment.currency,
      tran_id: payment.merchantInvoiceNo,
      success_url: `${this.appBaseUrl}/api/v1/payments/callback/sslcommerz?status=success`,
      fail_url: `${this.appBaseUrl}/api/v1/payments/callback/sslcommerz?status=fail`,
      cancel_url: `${this.appBaseUrl}/api/v1/payments/callback/sslcommerz?status=cancel`,
      ipn_url: `${this.appBaseUrl}/api/v1/payments/callback/sslcommerz?status=ipn`,
      // SSLCommerz এই কাস্টমার/প্রোডাক্ট ফিল্ডগুলো বাধ্যতামূলক করে (ফরম ভ্যালিডেশন)
      cus_name: "Durbeen Customer",
      cus_email: "customer@durbeen.com",
      cus_add1: "Dhaka",
      cus_phone: "01700000000",
      shipping_method: "Courier",
      product_name: `Order ${order.orderNumber}`,
      product_category: "Books & Lifestyle",
      product_profile: "general",
    });

    const response = await fetch(`${this.config.apiBaseUrl}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (data.status !== "SUCCESS" || typeof data.GatewayPageURL !== "string") {
      this.logger.error(`SSLCommerz session তৈরি ব্যর্থ: ${JSON.stringify(data)}`);
      return { redirectUrl: null, providerSessionId: null, rawResponse: data };
    }

    return {
      redirectUrl: data.GatewayPageURL as string,
      providerSessionId: (data.sessionkey as string) ?? null,
      rawResponse: data,
    };
  }

  async verifyCallback(payload: Record<string, unknown>): Promise<PaymentVerificationResult> {
    const valId = payload.val_id as string | undefined;

    if (!valId) {
      return {
        isSuccessful: false,
        providerTransactionId: null,
        verifiedAmount: null,
        failureReason: "val_id পাওয়া যায়নি — সম্ভবত fail/cancel callback",
        rawResponse: payload,
      };
    }

    // SSLCommerz-এর নিয়ম: শুধু callback payload বিশ্বাস না করে, val_id দিয়ে
    // Validation API-তে আলাদা server-to-server কল করে amount/status নিশ্চিত করতে হয় —
    // এটাই তাদের ডকুমেন্টেশনে বর্ণিত বাধ্যতামূলক নিরাপত্তা ধাপ।
    const verifyParams = new URLSearchParams({
      val_id: valId,
      store_id: this.config.storeId,
      store_passwd: this.config.storePassword,
      format: "json",
    });

    const response = await fetch(
      `${this.config.apiBaseUrl}/validator/api/validationserverAPI.php?${verifyParams.toString()}`
    );
    const data = (await response.json()) as Record<string, unknown>;

    const isSuccessful = data.status === "VALID" || data.status === "VALIDATED";

    return {
      isSuccessful,
      providerTransactionId: (data.bank_tran_id as string) ?? (data.tran_id as string) ?? null,
      verifiedAmount: (data.amount as string) ?? null,
      failureReason: isSuccessful ? undefined : `SSLCommerz validation status: ${data.status}`,
      rawResponse: data,
    };
  }

  verifySignature(payload: Record<string, unknown>): boolean {
    // SSLCommerz callback-এ HMAC signature পাঠায় না — নিরাপত্তা নির্ভর করে val_id দিয়ে
    // Validation API কলের উপর (verifyCallback-এ হচ্ছে), তাই এখানে শুধু tran_id উপস্থিতি চেক
    return typeof payload.tran_id === "string" || typeof payload.val_id === "string";
  }

  async refund(payment: Payment, amount: string, reason: string): Promise<RefundResult> {
    if (!payment.providerTransactionId) {
      return {
        isSuccessful: false,
        providerRefundId: null,
        rawResponse: {},
        failureReason: "providerTransactionId (bank_tran_id) ছাড়া রিফান্ড সম্ভব না",
      };
    }

    const params = new URLSearchParams({
      bank_tran_id: payment.providerTransactionId,
      refund_amount: amount,
      refund_remarks: reason,
      store_id: this.config.storeId,
      store_passwd: this.config.storePassword,
      format: "json",
    });

    const response = await fetch(
      `${this.config.apiBaseUrl}/validator/api/merchantTransIDvalidationAPI.php?${params.toString()}`
    );
    const data = (await response.json()) as Record<string, unknown>;
    const isSuccessful = data.status === "success";

    return {
      isSuccessful,
      providerRefundId: (data.refund_ref_id as string) ?? null,
      rawResponse: data,
      failureReason: isSuccessful ? undefined : `SSLCommerz refund status: ${data.status}`,
    };
  }
}
