/**
 * Refresh token যে কুকিতে বসবে — httpOnly, secure (production) —
 * আগের "Authentication Flow" সিকোয়েন্স ডায়াগ্রামের সিকিউরিটি সিদ্ধান্ত অনুযায়ী:
 * refresh_token httpOnly cookie-তে, access_token শুধু response body-তে (ক্লায়েন্ট মেমরিতে রাখবে)।
 */
export const REFRESH_TOKEN_COOKIE_NAME = "wafi_refresh_token";

export const OTP_PURPOSE = {
  LOGIN: "login",
} as const;

export const IS_PUBLIC_KEY = "isPublic";
export const ROLES_KEY = "roles";
