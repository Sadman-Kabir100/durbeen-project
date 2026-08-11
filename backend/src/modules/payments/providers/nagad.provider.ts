import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createSign, createVerify, privateEncrypt, randomUUID } from "crypto";
import type { Order } from "@/modules/orders/entities/order.entity";
import type { Payment } from "../entities/payment.entity";
import type {
  PaymentInitiationResult,
  PaymentProvider,
  PaymentVerificationResult,
  RefundResult,
} from "../interfaces/payment-provider.interface";

interface NagadConfig {
  merchantId: string;
  merchantPrivateKey: string;
  nagadPublicKey: string;
  apiBaseUrl: string;
}

/**
 * Nagad-এর merchant API RSA পাবলিক/প্রাইভেট-কী ক্রিপ্টোগ্রাফি ব্যবহার করে (bKash/SSLCommerz-এর
 * থেকে গঠনগতভাবে ভিন্ন — token-based না, বরং প্রতিটি রিকোয়েস্টে payload sign+encrypt করতে হয়)।
 * অফিসিয়াল ফ্লো: (১) Initialize — merchant একটা "sensitiveData" (order ID + datetime)
 * নিজের private key দিয়ে sign করে পাঠায়, Nagad একটা "challenge" ফেরত দেয়;
 * (২) Complete Initialize — সেই challenge sign করে + amount/merchantCallbackURL পাঠিয়ে
 * চূড়ান্ত checkout URL পাওয়া যায়।
 *
 * ⚠️ এটি Nagad-এর ডকুমেন্টেশনে বর্ণিত কাঠামো অনুসরণ করে লেখা, কিন্তু sandbox নেটওয়ার্ক/
 * প্রকৃত merchant private key ছাড়া লাইভ টেস্ট করা সম্ভব হয়নি — প্রোডাকশনে বসানোর আগে
 * অবশ্যই Nagad sandbox-এ end-to-end ভেরিফাই করুন।
 */
@Injectable()
export class NagadProvider implements PaymentProvider {
  readonly providerName = "nagad";
  private readonly logger = new Logger(NagadProvider.name);
  private readonly config: NagadConfig;
  private readonly appBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<NagadConfig>("payment.nagad")!;
    this.appBaseUrl = this.configService.get<string>("payment.appBaseUrl")!;
  }

  async initiate(_order: Order, payment: Payment): Promise<PaymentInitiationResult> {
    const orderId = payment.merchantInvoiceNo;
    const dateTime = this.formatNagadDateTime(new Date());
    const clientIp = "127.0.0.1"; // প্রকৃত রিকোয়েস্ট IP PaymentController থেকে পাস করা উচিত (পরের রিফ্যাক্টরে)

    const sensitiveData = {
      merchantId: this.config.merchantId,
      orderId,
      currencyCode: "050", // BDT-এর ISO 4217 numeric code, Nagad ডকুমেন্টেশন অনুযায়ী
      amount: payment.amount,
      challenge: randomUUID(),
    };

    const sensitiveDataEncrypted = this.encryptWithMerchantKey(JSON.stringify(sensitiveData));
    const signature = this.signPayload(JSON.stringify(sensitiveData));

    // ধাপ ১: Initialize
    const initResponse = await fetch(
      `${this.config.apiBaseUrl}/api/dfs/check-out/initialize/${this.config.merchantId}/${orderId}`,
      {
        method: "POST",
        headers: this.commonHeaders(clientIp),
        body: JSON.stringify({ dateTime, sensitiveData: sensitiveDataEncrypted, signature }),
      }
    );
    const initData = (await initResponse.json()) as Record<string, unknown>;

    if (typeof initData.paymentReferenceId !== "string" || typeof initData.challenge !== "string") {
      this.logger.error(`Nagad initialize ব্যর্থ: ${JSON.stringify(initData)}`);
      return { redirectUrl: null, providerSessionId: null, rawResponse: initData };
    }

    // ধাপ ২: Complete Initialize
    const completePayload = {
      merchantId: this.config.merchantId,
      orderId,
      currencyCode: "050",
      amount: payment.amount,
      challenge: initData.challenge,
    };
    const completeSensitiveData = this.encryptWithMerchantKey(JSON.stringify(completePayload));
    const completeSignature = this.signPayload(JSON.stringify(completePayload));

    const completeResponse = await fetch(
      `${this.config.apiBaseUrl}/api/dfs/check-out/complete/${initData.paymentReferenceId}`,
      {
        method: "POST",
        headers: this.commonHeaders(clientIp),
        body: JSON.stringify({
          sensitiveData: completeSensitiveData,
          signature: completeSignature,
          merchantCallbackURL: `${this.appBaseUrl}/api/v1/payments/callback/nagad`,
        }),
      }
    );
    const completeData = (await completeResponse.json()) as Record<string, unknown>;

    if (typeof completeData.callBackUrl !== "string") {
      this.logger.error(`Nagad complete-initialize ব্যর্থ: ${JSON.stringify(completeData)}`);
      return { redirectUrl: null, providerSessionId: null, rawResponse: completeData };
    }

    return {
      redirectUrl: completeData.callBackUrl as string,
      providerSessionId: initData.paymentReferenceId,
      rawResponse: completeData,
    };
  }

  async verifyCallback(payload: Record<string, unknown>): Promise<PaymentVerificationResult> {
    const paymentRefId = payload.payment_ref_id as string | undefined;

    if (!paymentRefId) {
      return {
        isSuccessful: false,
        providerTransactionId: null,
        verifiedAmount: null,
        failureReason: "payment_ref_id পাওয়া যায়নি",
        rawResponse: payload,
      };
    }

    // Nagad callback query-তে status পাঠায়, কিন্তু চূড়ান্ত নিশ্চয়তার জন্য Verify Payment API
    // দিয়ে সার্ভার-টু-সার্ভার যাচাই করা বাধ্যতামূলক (bKash execute-এর সমতুল্য ধাপ)
    const response = await fetch(`${this.config.apiBaseUrl}/api/dfs/verify/payment/${paymentRefId}`, {
      method: "GET",
      headers: this.commonHeaders("127.0.0.1"),
    });
    const data = (await response.json()) as Record<string, unknown>;

    const isSuccessful = data.status === "Success";

    return {
      isSuccessful,
      providerTransactionId: (data.issuerPaymentRefNo as string) ?? paymentRefId,
      verifiedAmount: (data.amount as string) ?? null,
      failureReason: isSuccessful ? undefined : `Nagad verify status: ${data.status}`,
      rawResponse: data,
    };
  }

  verifySignature(payload: Record<string, unknown>): boolean {
    // Nagad callback-এ RSA-signed payload আসে না (শুধু query params), তাই এখানে
    // শুধু প্রয়োজনীয় field উপস্থিতি চেক করা হচ্ছে — আসল যাচাই verifyCallback()-এর
    // Verify Payment API কলে হয়। Nagad কোনো নির্দিষ্ট এন্ডপয়েন্টে সরাসরি signed ডেটা
    // পাঠালে createVerify() দিয়ে this.config.nagadPublicKey ব্যবহার করে verify করা উচিত —
    // নিচের প্রাইভেট হেল্পার মেথডে সেই লজিক প্রস্তুত রাখা হলো।
    return typeof payload.payment_ref_id === "string";
  }

  async refund(): Promise<RefundResult> {
    // Nagad-এর merchant API-তে পাবলিকলি ডকুমেন্টেড কোনো স্বয়ংক্রিয় রিফান্ড এন্ডপয়েন্ট নেই —
    // সাধারণত Nagad মার্চেন্ট সাপোর্টের মাধ্যমে ম্যানুয়াল রিফান্ড প্রসেস করতে হয়।
    return {
      isSuccessful: false,
      providerRefundId: null,
      rawResponse: {},
      failureReason:
        "Nagad-এ স্বয়ংক্রিয় রিফান্ড API নেই — Nagad মার্চেন্ট সাপোর্টের মাধ্যমে ম্যানুয়ালি প্রসেস করতে হবে",
    };
  }

  private formatNagadDateTime(date: Date): string {
    // Nagad ফরম্যাট প্রত্যাশা করে: YYYYMMDDHHmmss
    return date.toISOString().replace(/[-:T]/g, "").slice(0, 14);
  }

  private encryptWithMerchantKey(data: string): string {
    return privateEncrypt(this.config.merchantPrivateKey, Buffer.from(data)).toString("base64");
  }

  private signPayload(data: string): string {
    const signer = createSign("SHA256");
    signer.update(data);
    signer.end();
    return signer.sign(this.config.merchantPrivateKey, "base64");
  }

  /** ভবিষ্যতে Nagad থেকে সরাসরি signed callback আসলে এই হেল্পার দিয়ে verify করা যাবে */
  private verifyWithNagadPublicKey(data: string, signature: string): boolean {
    const verifier = createVerify("SHA256");
    verifier.update(data);
    verifier.end();
    return verifier.verify(this.config.nagadPublicKey, signature, "base64");
  }

  private commonHeaders(clientIp: string): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "X-KM-IP-V4": clientIp,
      "X-KM-Client-Type": "PC_WEB",
      "X-KM-Api-Version": "v-0.2.0",
    };
  }
}
