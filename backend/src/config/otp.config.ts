import { registerAs } from "@nestjs/config";

export default registerAs("otp", () => ({
  length: parseInt(process.env.OTP_LENGTH ?? "6", 10),
  ttlSeconds: parseInt(process.env.OTP_TTL_SECONDS ?? "300", 10),
  maxRequestsPerMinute: parseInt(process.env.OTP_MAX_REQUESTS_PER_MINUTE ?? "1", 10),
}));
