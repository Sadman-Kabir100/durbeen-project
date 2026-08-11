import { registerAs } from "@nestjs/config";

/**
 * ⚠️ স্বচ্ছতার নোট: এই কনফিগ Redis কানেকশনের জন্য প্রস্তুত (docker-compose-এ Redis
 * কন্টেইনার প্রোভিশন করা হচ্ছে), কিন্তু এই মুহূর্তে ব্যাকএন্ডের কোনো সার্ভিস এখনো Redis-এর
 * সাথে সত্যিকারের কানেকশন তৈরি করে না — OtpService এখনো InMemoryOtpStore ব্যবহার করে
 * (দেখুন src/modules/auth/services/in-memory-otp.store.ts এর কমেন্ট)। এই ফাইলটা রাখা
 * হয়েছে যাতে Redis client (ioredis) যোগ করার সময় শুধু একটা RedisOtpStore ক্লাস লিখে
 * auth.module.ts-এ provider বাইন্ডিং বদলালেই যথেষ্ট হয় — কনফিগ ইতিমধ্যে প্রস্তুত।
 * এটাকে "সম্পূর্ণ ফিচার" হিসেবে দাবি করা হচ্ছে না — শুধু forward-compatible ওয়্যারিং।
 */
export default registerAs("redis", () => ({
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB ?? "0", 10),
}));
