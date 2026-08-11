import { Injectable, Logger } from "@nestjs/common";
import type { SmsSender } from "../interfaces/sms-sender.interface";

/**
 * এই ইমপ্লিমেন্টেশন শুধু ডেভেলপমেন্টে কনসোলে OTP লগ করে।
 * পূর্ণাঙ্গ "Notification Management" মডিউলে এটি প্রকৃত SMS গেটওয়ে
 * (যেমন SSL Wireless, Alpha SMS ইত্যাদি বাংলাদেশি প্রোভাইডার) দিয়ে replace হবে —
 * SmsSender ইন্টারফেস অপরিবর্তিত থাকবে বলে Auth মডিউলের কোনো কোড পরিবর্তন লাগবে না
 * (Dependency Inversion — এটাই এই abstraction রাখার মূল কারণ)।
 */
@Injectable()
export class ConsoleSmsService implements SmsSender {
  private readonly logger = new Logger(ConsoleSmsService.name);

  async send(phone: string, message: string): Promise<void> {
    this.logger.log(`[MOCK SMS] → ${phone}: ${message}`);
  }
}
