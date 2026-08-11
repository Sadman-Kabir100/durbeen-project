export const OTP_STORE = Symbol("OTP_STORE");

export interface OtpRecord {
  code: string;
  expiresAt: number; // epoch ms
  requestCount: number;
  windowStartedAt: number; // rate-limit window শুরুর টাইমস্ট্যাম্প
}

export interface OtpStore {
  get(phone: string): Promise<OtpRecord | undefined>;
  set(phone: string, record: OtpRecord): Promise<void>;
  delete(phone: string): Promise<void>;
}
