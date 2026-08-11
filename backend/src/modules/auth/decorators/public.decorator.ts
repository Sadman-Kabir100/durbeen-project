import { SetMetadata } from "@nestjs/common";
import { IS_PUBLIC_KEY } from "../constants/auth.constants";

/**
 * গ্লোবাল JwtAuthGuard বাইপাস করতে — OTP request/verify, refresh-এর মতো
 * পাবলিক এন্ডপয়েন্টে ব্যবহার হবে: @Public() @Post('otp/request') ...
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
