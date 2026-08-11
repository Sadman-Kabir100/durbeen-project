import { IsOptional, IsString } from "class-validator";

/**
 * নোট: সাধারণ ফ্লোতে refresh token httpOnly cookie থেকে আসে (body-তে লাগে না)।
 * তবে মোবাইল অ্যাপ ক্লায়েন্ট (যেখানে cookie জটিল) এর জন্য body-fallback রাখা হলো,
 * কন্ট্রোলারে cookie না পেলে body থেকে fallback নেওয়া হবে।
 */
export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
