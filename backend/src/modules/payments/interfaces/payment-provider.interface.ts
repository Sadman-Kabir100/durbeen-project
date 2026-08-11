import type { Order } from "@/modules/orders/entities/order.entity";
import type { Payment } from "../entities/payment.entity";

export const PAYMENT_PROVIDERS = Symbol("PAYMENT_PROVIDERS");

export interface PaymentInitiationResult {
  /** ইউজারকে redirect করতে হবে এই URL-এ (COD-এর ক্ষেত্রে null — redirect লাগে না) */
  redirectUrl: string | null;
  /** গেটওয়ে-সাইড সেশন/পেমেন্ট আইডি, পরে callback ম্যাচ করতে ব্যবহৃত হয় */
  providerSessionId: string | null;
  rawResponse: Record<string, unknown>;
}

export interface PaymentVerificationResult {
  isSuccessful: boolean;
  providerTransactionId: string | null;
  /** গেটওয়ে যে amount কনফার্ম করেছে — Payment.amount-এর সাথে মিলিয়ে amount-tampering ঠেকাতে */
  verifiedAmount: string | null;
  failureReason?: string;
  rawResponse: Record<string, unknown>;
}

export interface RefundResult {
  isSuccessful: boolean;
  providerRefundId: string | null;
  rawResponse: Record<string, unknown>;
  failureReason?: string;
}

/**
 * সব পেমেন্ট গেটওয়ে অ্যাডাপ্টার এই ইন্টারফেস ইমপ্লিমেন্ট করে। PaymentService শুধু এই
 * অ্যাবস্ট্রাকশনের সাথে কথা বলে — কোনো নির্দিষ্ট গেটওয়ের API জানার দরকার নেই তার।
 * নতুন গেটওয়ে (যেমন ভবিষ্যতে "Upay" বা "Tap") যোগ করতে শুধু এই ইন্টারফেস
 * ইমপ্লিমেন্ট করা একটা নতুন ক্লাস লিখে PaymentModule-এর provider ম্যাপে রেজিস্টার করলেই হবে।
 */
export interface PaymentProvider {
  readonly providerName: string;

  initiate(order: Order, payment: Payment): Promise<PaymentInitiationResult>;

  /** callback/IPN payload থেকে ভেরিফাই করে — কিছু গেটওয়ে (bKash) এখানে অতিরিক্ত "query" API কলও করে */
  verifyCallback(payload: Record<string, unknown>): Promise<PaymentVerificationResult>;

  /** raw request থেকে signature/hash ভেরিফাই করে — spoofed webhook প্রতিরোধ */
  verifySignature(payload: Record<string, unknown>, headers: Record<string, string>): boolean;

  refund(payment: Payment, amount: string, reason: string): Promise<RefundResult>;
}
