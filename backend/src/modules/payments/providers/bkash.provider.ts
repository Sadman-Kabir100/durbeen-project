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

interface BkashConfig {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  apiBaseUrl: string;
}

interface BkashTokenCache {
  idToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
}

/**
 * bKash Tokenized Checkout (PGW v1.2.0-beta) API-এর অফিসিয়াল ৩-ধাপ ফ্লো অনুসরণ করে:
 * (১) Grant Token — app credentials দিয়ে id_token নেওয়া (প্রতি রিকোয়েস্টে না, cache করে reuse)
 * (২) Create Payment — id_token দিয়ে bkashURL (checkout) পাওয়া
 * (৩) Execute Payment — bKash ব্যবহারকারীকে redirect করে ফেরত এলে callback-এ paymentID
 *     দিয়ে "execute" কল করতে হয়, তবেই পেমেন্ট চূড়ান্তভাবে capture হয় (শুধু callback
 *     আসাই যথেষ্ট না — এটাই bKash-এর সবচেয়ে গুরুত্বপূর্ণ নিরাপত্তা ধাপ)।
 *
 * ⚠️ sandbox নেটওয়ার্ক অ্যাক্সেস না থাকায় লাইভ টেস্ট করা যায়নি — বাস্তব app key/secret
 * দিয়ে bKash sandbox-এ end-to-end যাচাই করে নিন।
 */
@Injectable()
export class BkashProvider implements PaymentProvider {
  readonly providerName = "bkash";
  private readonly logger = new Logger(BkashProvider.name);
  private readonly config: BkashConfig;
  private readonly appBaseUrl: string;
  private tokenCache: BkashTokenCache | null = null;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<BkashConfig>("payment.bkash")!;
    this.appBaseUrl = this.configService.get<string>("payment.appBaseUrl")!;
  }

  async initiate(order: Order, payment: Payment): Promise<PaymentInitiationResult> {
    const idToken = await this.getValidToken();

    const response = await fetch(`${this.config.apiBaseUrl}/tokenized/checkout/create`, {
      method: "POST",
      headers: this.authHeaders(idToken),
      body: JSON.stringify({
        mode: "0011", // "0011" = Checkout (URL-based) মোড, bKash ডকুমেন্টেশন অনুযায়ী
        payerReference: order.orderNumber,
        callbackURL: `${this.appBaseUrl}/api/v1/payments/callback/bkash`,
        amount: payment.amount,
        currency: payment.currency,
        intent: "sale",
        merchantInvoiceNumber: payment.merchantInvoiceNo,
      }),
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (data.statusCode !== "0000" || typeof data.bkashURL !== "string") {
      this.logger.error(`bKash create payment ব্যর্থ: ${JSON.stringify(data)}`);
      return { redirectUrl: null, providerSessionId: null, rawResponse: data };
    }

    return {
      redirectUrl: data.bkashURL as string,
      providerSessionId: (data.paymentID as string) ?? null,
      rawResponse: data,
    };
  }

  async verifyCallback(payload: Record<string, unknown>): Promise<PaymentVerificationResult> {
    const paymentID = payload.paymentID as string | undefined;
    const status = payload.status as string | undefined;

    if (!paymentID || status !== "success") {
      return {
        isSuccessful: false,
        providerTransactionId: null,
        verifiedAmount: null,
        failureReason: `bKash callback status: ${status ?? "অজানা"}`,
        rawResponse: payload,
      };
    }

    // চূড়ান্ত capture ধাপ — শুধু callback-এর "success" স্ট্যাটাসে বিশ্বাস না করে
    // এখানেই bKash-কে execute করতে বলা হচ্ছে, response-এই আসল নিশ্চয়তা
    const idToken = await this.getValidToken();
    const response = await fetch(`${this.config.apiBaseUrl}/tokenized/checkout/execute`, {
      method: "POST",
      headers: this.authHeaders(idToken),
      body: JSON.stringify({ paymentID }),
    });

    const data = (await response.json()) as Record<string, unknown>;
    const isSuccessful = data.transactionStatus === "Completed";

    return {
      isSuccessful,
      providerTransactionId: (data.trxID as string) ?? null,
      verifiedAmount: (data.amount as string) ?? null,
      failureReason: isSuccessful ? undefined : `bKash execute status: ${data.transactionStatus}`,
      rawResponse: data,
    };
  }

  verifySignature(payload: Record<string, unknown>): boolean {
    // bKash callback URL-এ query param হিসেবে paymentID/status পাঠায়, cryptographic
    // signature নেই — নিরাপত্তা নির্ভর করে execute API-র নিজস্ব paymentID যাচাইয়ের উপর
    // (paymentID bKash-এর সিস্টেমে না থাকলে execute কল নিজেই ব্যর্থ হবে)
    return typeof payload.paymentID === "string";
  }

  async refund(payment: Payment, amount: string, reason: string): Promise<RefundResult> {
    if (!payment.providerTransactionId) {
      return {
        isSuccessful: false,
        providerRefundId: null,
        rawResponse: {},
        failureReason: "trxID ছাড়া রিফান্ড সম্ভব না",
      };
    }

    const idToken = await this.getValidToken();
    const response = await fetch(`${this.config.apiBaseUrl}/tokenized/checkout/payment/refund`, {
      method: "POST",
      headers: this.authHeaders(idToken),
      body: JSON.stringify({
        paymentID: payment.providerTransactionId,
        amount,
        trxID: payment.providerTransactionId,
        sku: "durbeen-order",
        reason,
      }),
    });

    const data = (await response.json()) as Record<string, unknown>;
    const isSuccessful = data.transactionStatus === "Completed";

    return {
      isSuccessful,
      providerRefundId: (data.refundTrxID as string) ?? null,
      rawResponse: data,
      failureReason: isSuccessful ? undefined : `bKash refund status: ${data.transactionStatus}`,
    };
  }

  /** টোকেন cache করে রাখা — bKash-এর id_token সাধারণত ১ ঘণ্টা মেয়াদি, প্রতি রিকোয়েস্টে grant করা অপ্রয়োজনীয় ও রেট-লিমিটেড */
  private async getValidToken(): Promise<string> {
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 30_000) {
      return this.tokenCache.idToken;
    }

    const response = await fetch(`${this.config.apiBaseUrl}/tokenized/checkout/token/grant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        username: this.config.username,
        password: this.config.password,
      },
      body: JSON.stringify({ app_key: this.config.appKey, app_secret: this.config.appSecret }),
    });

    const data = (await response.json()) as Record<string, unknown>;
    if (typeof data.id_token !== "string") {
      throw new Error(`bKash token grant ব্যর্থ: ${JSON.stringify(data)}`);
    }

    this.tokenCache = {
      idToken: data.id_token,
      refreshToken: (data.refresh_token as string) ?? "",
      expiresAt: Date.now() + (Number(data.expires_in ?? 3600) - 60) * 1000,
    };

    return this.tokenCache.idToken;
  }

  private authHeaders(idToken: string): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: idToken,
      "X-App-Key": this.config.appKey,
    };
  }
}
