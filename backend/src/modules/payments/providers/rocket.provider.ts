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

interface RocketConfig {
  merchantId: string;
  apiKey: string;
  apiBaseUrl: string;
}

/**
 * ⚠️ গুরুত্বপূর্ণ স্বচ্ছতার নোট: bKash/Nagad/SSLCommerz-এর মতো Rocket (DBBL Mobile Banking)-এর
 * কোনো পাবলিকলি ডকুমেন্টেড, স্ট্যান্ডার্ড merchant checkout API নেই। বাস্তবে বাংলাদেশে Rocket
 * পেমেন্ট সাধারণত দুইভাবে ইন্টিগ্রেট করা হয়:
 *
 *   (ক) অ্যাগ্রিগেটরের মাধ্যমে — SSLCommerz বা ShurjoPay-এর মতো পেমেন্ট অ্যাগ্রিগেটরের
 *       hosted checkout পেজে Rocket ইতিমধ্যে একটা পেমেন্ট অপশন হিসেবে থাকে (যেহেতু আমাদের
 *       SslcommerzProvider ইতিমধ্যে আছে, ব্যবহারিকভাবে Rocket সিলেক্ট করা মানে হতে পারে
 *       SSLCommerz-এর গেটওয়ে পেজে গিয়ে Rocket বেছে নেওয়া)।
 *   (খ) DBBL-এর সাথে সরাসরি merchant চুক্তি — এক্ষেত্রে DBBL নিজস্ব API ডকুমেন্টেশন ও
 *       ক্রেডেনশিয়াল সরবরাহ করে, যা merchant-নির্দিষ্ট এবং পাবলিকলি প্রকাশিত না।
 *
 * এই ক্লাসটি তাই দুটো জিনিস করছে: (১) PaymentProvider ইন্টারফেসের সাথে সামঞ্জস্যপূর্ণ একটা
 * কাঠামো দিচ্ছে যাতে ভবিষ্যতে (খ)-এর ক্রেডেনশিয়াল পেলে সহজে বসানো যায়, (২) কনফিগ না থাকলে
 * স্পষ্ট ওয়ার্নিং দিয়ে aggregator-ভিত্তিক পথ (ক) বিবেচনা করার পরামর্শ দেয়।
 */
@Injectable()
export class RocketProvider implements PaymentProvider {
  readonly providerName = "rocket";
  private readonly logger = new Logger(RocketProvider.name);
  private readonly config: RocketConfig;
  private readonly appBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<RocketConfig>("payment.rocket")!;
    this.appBaseUrl = this.configService.get<string>("payment.appBaseUrl")!;
  }

  async initiate(_order: Order, payment: Payment): Promise<PaymentInitiationResult> {
    if (!this.config.apiBaseUrl) {
      this.logger.warn(
        "ROCKET_API_BASE_URL সেট করা নেই — DBBL-এর সাথে সরাসরি merchant চুক্তি না থাকলে " +
          "SSLCommerz অ্যাগ্রিগেটরের মাধ্যমে Rocket পেমেন্ট প্রসেস করার কথা বিবেচনা করুন " +
          "(এই ফাইলের উপরের কমেন্ট দেখুন)।"
      );
      return {
        redirectUrl: null,
        providerSessionId: null,
        rawResponse: { error: "Rocket সরাসরি API কনফিগার করা নেই" },
      };
    }

    // নিচের কল-শেপটি একটা reasonable placeholder — DBBL-এর প্রকৃত ডকুমেন্টেশন পাওয়ার পর
    // ফিল্ড নাম/এন্ডপয়েন্ট মিলিয়ে আপডেট করতে হবে।
    const response = await fetch(`${this.config.apiBaseUrl}/checkout/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Merchant-Id": this.config.merchantId,
        "X-Api-Key": this.config.apiKey,
      },
      body: JSON.stringify({
        orderId: payment.merchantInvoiceNo,
        amount: payment.amount,
        currency: payment.currency,
        callbackUrl: `${this.appBaseUrl}/api/v1/payments/callback/rocket`,
      }),
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (typeof data.checkoutUrl !== "string") {
      this.logger.error(`Rocket checkout তৈরি ব্যর্থ: ${JSON.stringify(data)}`);
      return { redirectUrl: null, providerSessionId: null, rawResponse: data };
    }

    return {
      redirectUrl: data.checkoutUrl as string,
      providerSessionId: (data.transactionId as string) ?? null,
      rawResponse: data,
    };
  }

  async verifyCallback(payload: Record<string, unknown>): Promise<PaymentVerificationResult> {
    const isSuccessful = payload.status === "SUCCESS";
    return {
      isSuccessful,
      providerTransactionId: (payload.transactionId as string) ?? null,
      verifiedAmount: (payload.amount as string) ?? null,
      failureReason: isSuccessful ? undefined : `Rocket callback status: ${payload.status}`,
      rawResponse: payload,
    };
  }

  verifySignature(payload: Record<string, unknown>): boolean {
    return typeof payload.transactionId === "string";
  }

  async refund(): Promise<RefundResult> {
    return {
      isSuccessful: false,
      providerRefundId: null,
      rawResponse: {},
      failureReason: "Rocket রিফান্ড DBBL-এর merchant সাপোর্টের মাধ্যমে ম্যানুয়ালি প্রসেস করতে হবে",
    };
  }
}
