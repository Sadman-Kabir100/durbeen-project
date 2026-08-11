import { HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

interface IpWindow {
  count: number;
  windowStartedAt: number;
}

const WINDOW_MS = 60_000; // ১ মিনিট
const MAX_REQUESTS_PER_IP = 5; // একই IP থেকে বিভিন্ন ফোন নম্বরে OTP request spam ঠেকাতে

/**
 * এই মিডলওয়্যার OtpService-এর ফোন-ভিত্তিক রেট-লিমিটের **complementary** —
 * OtpService একটা নির্দিষ্ট ফোন নম্বরে spam ঠেকায়, কিন্তু কেউ যদি একই IP থেকে
 * বিভিন্ন ফোন নম্বর ট্রাই করে (enumeration/abuse আক্রমণ), সেটা phone-based
 * রেট-লিমিটে ধরা পড়বে না — তাই এই IP-ভিত্তিক স্তরটা আলাদাভাবে দরকার।
 *
 * ⚠️ প্রোডাকশন নোট: multi-instance ডিপ্লয়মেন্টে এই in-memory Map ও Redis-এ
 * সরানো উচিত (একই কারণে যেমনটা InMemoryOtpStore-এর কমেন্টে বলা হয়েছে)।
 */
@Injectable()
export class OtpRateLimitMiddleware implements NestMiddleware {
  private readonly ipWindows = new Map<string, IpWindow>();

  use(req: Request, res: Response, next: NextFunction): void {
    const ip = this.extractIp(req);
    const now = Date.now();
    const existing = this.ipWindows.get(ip);

    if (!existing || now - existing.windowStartedAt >= WINDOW_MS) {
      this.ipWindows.set(ip, { count: 1, windowStartedAt: now });
      return next();
    }

    if (existing.count >= MAX_REQUESTS_PER_IP) {
      res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: "এই নেটওয়ার্ক থেকে অনেকবার অনুরোধ করা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন",
      });
      return;
    }

    existing.count += 1;
    next();
  }

  private extractIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.length > 0) {
      return forwarded.split(",")[0]!.trim();
    }
    return req.ip ?? req.socket.remoteAddress ?? "unknown";
  }
}
