import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomInt } from "crypto";
import { OTP_STORE, type OtpStore } from "../interfaces/otp-store.interface";
import type { SmsSender } from "@/modules/notifications/interfaces/sms-sender.interface";
import { SMS_SENDER } from "@/modules/notifications/interfaces/sms-sender.interface";

@Injectable()
export class OtpService {
  private readonly length: number;
  private readonly ttlSeconds: number;
  private readonly maxRequestsPerMinute: number;

  constructor(
    @Inject(OTP_STORE) private readonly otpStore: OtpStore,
    @Inject(SMS_SENDER) private readonly smsSender: SmsSender,
    private readonly configService: ConfigService
  ) {
    this.length = this.configService.get<number>("otp.length", 6);
    this.ttlSeconds = this.configService.get<number>("otp.ttlSeconds", 300);
    this.maxRequestsPerMinute = this.configService.get<number>("otp.maxRequestsPerMinute", 1);
  }

  /**
   * নোট: রেট-লিমিটের মূল প্রয়োগ OtpRateLimitMiddleware-এ (HTTP-লেভেল, দ্রুত প্রত্যাখ্যান)।
   * এখানে সার্ভিস-লেভেলে একটা দ্বিতীয় স্তরের রক্ষাকবচ রাখা হলো (defense-in-depth) —
   * মিডলওয়্যার বাইপাস হলেও (যেমন ভবিষ্যতে অন্য কোনো এন্ট্রিপয়েন্ট থেকে কল হলে) এই সার্ভিস একাই সুরক্ষিত থাকে।
   */
  async generateAndSend(phone: string): Promise<{ expiresInSeconds: number }> {
    const now = Date.now();
    const existing = await this.otpStore.get(phone);

    if (existing && now - existing.windowStartedAt < 60_000) {
      if (existing.requestCount >= this.maxRequestsPerMinute) {
        throw new HttpException(
          "খুব দ্রুত একাধিকবার OTP অনুরোধ করা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন",
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
    }

    const code = this.generateCode();
    const windowStartedAt = existing && now - existing.windowStartedAt < 60_000
      ? existing.windowStartedAt
      : now;

    await this.otpStore.set(phone, {
      code,
      expiresAt: now + this.ttlSeconds * 1000,
      requestCount: (existing && now - existing.windowStartedAt < 60_000 ? existing.requestCount : 0) + 1,
      windowStartedAt,
    });

    await this.smsSender.send(phone, `আপনার Durbeen ভেরিফিকেশন কোড: ${code} (মেয়াদ ${Math.floor(this.ttlSeconds / 60)} মিনিট)`);

    return { expiresInSeconds: this.ttlSeconds };
  }

  async verify(phone: string, code: string): Promise<void> {
    const record = await this.otpStore.get(phone);

    if (!record) {
      throw new BadRequestException("OTP-এর মেয়াদ শেষ হয়ে গেছে অথবা কোনো অনুরোধ পাওয়া যায়নি, পুনরায় অনুরোধ করুন");
    }

    if (record.code !== code) {
      throw new BadRequestException("ভুল OTP কোড");
    }

    // সফল ভেরিফিকেশনের পর OTP একবারই ব্যবহারযোগ্য — সাথে সাথে invalidate
    await this.otpStore.delete(phone);
  }

  private generateCode(): string {
    const min = Math.pow(10, this.length - 1);
    const max = Math.pow(10, this.length) - 1;
    return randomInt(min, max).toString();
  }
}
