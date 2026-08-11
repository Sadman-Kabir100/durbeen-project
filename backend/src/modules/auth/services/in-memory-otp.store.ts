import { Injectable } from "@nestjs/common";
import type { OtpRecord, OtpStore } from "../interfaces/otp-store.interface";

/**
 * ⚠️ প্রোডাকশন নোট: এই in-memory স্টোর শুধু single-instance ডেভেলপমেন্টের জন্য উপযুক্ত।
 * একাধিক সার্ভার ইনস্ট্যান্স (horizontal scaling) থাকলে OTP ভিন্ন ইনস্ট্যান্সে
 * verify হতে পারে না — তখন একটা RedisOtpStore (OtpStore ইন্টারফেস ইমপ্লিমেন্ট করে)
 * বসিয়ে auth.module.ts-এ শুধু provider bindings বদলালেই চলবে, বাকি কোড অপরিবর্তিত থাকবে।
 * এটাই আগের সিস্টেম আর্কিটেকচার ডকুমেন্টের Cache Architecture অংশে বর্ণিত Redis OTP store-এর
 * ঠিক জায়গা — এই abstraction সেই ভবিষ্যৎ migration কে zero-friction করে রাখে।
 */
@Injectable()
export class InMemoryOtpStore implements OtpStore {
  private readonly store = new Map<string, OtpRecord>();

  async get(phone: string): Promise<OtpRecord | undefined> {
    const record = this.store.get(phone);
    if (record && record.expiresAt < Date.now()) {
      this.store.delete(phone);
      return undefined;
    }
    return record;
  }

  async set(phone: string, record: OtpRecord): Promise<void> {
    this.store.set(phone, record);
  }

  async delete(phone: string): Promise<void> {
    this.store.delete(phone);
  }
}
