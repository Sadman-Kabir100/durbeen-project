import { Injectable, Logger } from "@nestjs/common";
import type { Order } from "@/modules/orders/entities/order.entity";
import type { Payment } from "../entities/payment.entity";
import type {
  PaymentInitiationResult,
  PaymentProvider,
  PaymentVerificationResult,
  RefundResult,
} from "../interfaces/payment-provider.interface";

/**
 * COD-এর কোনো external গেটওয়ে নেই — টাকা ডেলিভারির সময় হাতে-হাতে সংগ্রহ হয়।
 * তবু PaymentProvider ইন্টারফেস ইমপ্লিমেন্ট করা হচ্ছে যাতে PaymentService-কে
 * "if (method === COD) { special-case } else { provider... }" জাতীয় শাখা-প্রশাখা
 * লিখতে না হয় — polymorphism দিয়ে uniform থাকে (Liskov substitution)।
 *
 * initiate() কোনো redirect দেয় না; PaymentService COD-এর ক্ষেত্রে সরাসরি অর্ডার
 * CONFIRMED-এ নিয়ে যাবে (অনলাইন গেটওয়ের মতো webhook-এর অপেক্ষা করার দরকার নেই)।
 * refund() ম্যানুয়াল প্রক্রিয়া (bank transfer/আবার ক্যাশ) — এখানে শুধু রেকর্ড রাখা হয়,
 * প্রকৃত টাকা ফেরত অ্যাডমিন ম্যানুয়ালি করে "completed" মার্ক করবে।
 */
@Injectable()
export class CashOnDeliveryProvider implements PaymentProvider {
  readonly providerName = "cod";
  private readonly logger = new Logger(CashOnDeliveryProvider.name);

  async initiate(order: Order, payment: Payment): Promise<PaymentInitiationResult> {
    this.logger.log(`COD পেমেন্ট রেকর্ড তৈরি — অর্ডার ${order.orderNumber}, পেমেন্ট ${payment.id}`);
    return {
      redirectUrl: null,
      providerSessionId: null,
      rawResponse: { note: "Cash on delivery — গেটওয়ে ইন্টিগ্রেশন প্রযোজ্য নয়" },
    };
  }

  async verifyCallback(): Promise<PaymentVerificationResult> {
    // COD-এ কোনো webhook/IPN আসে না — ডেলিভারি সম্পন্ন হলে DeliveryService আলাদাভাবে
    // payment.status আপডেট করবে (নিচে PaymentService.markCodCollected() দেখুন, পরের ধাপে)
    return {
      isSuccessful: false,
      providerTransactionId: null,
      verifiedAmount: null,
      failureReason: "COD পেমেন্টে callback প্রযোজ্য নয়",
      rawResponse: {},
    };
  }

  verifySignature(): boolean {
    return true; // কোনো external webhook নেই বলে signature ভেরিফিকেশনের প্রশ্ন আসে না
  }

  async refund(payment: Payment, amount: string): Promise<RefundResult> {
    this.logger.warn(
      `COD রিফান্ড (পেমেন্ট ${payment.id}, ৳${amount}) স্বয়ংক্রিয় নয় — অ্যাডমিনকে ম্যানুয়ালি bKash/ব্যাংক ট্রান্সফারে ফেরত দিতে হবে`
    );
    return {
      isSuccessful: false,
      providerRefundId: null,
      rawResponse: {},
      failureReason: "COD রিফান্ড ম্যানুয়াল প্রক্রিয়া — অ্যাডমিন প্যানেল থেকে সম্পন্ন করে status আপডেট করতে হবে",
    };
  }
}
