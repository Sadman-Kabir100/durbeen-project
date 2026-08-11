import { registerAs } from "@nestjs/config";

export default registerAs("payment", () => ({
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:4000",
  frontendBaseUrl: process.env.FRONTEND_BASE_URL ?? "http://localhost:3000",

  sslcommerz: {
    storeId: process.env.SSLCOMMERZ_STORE_ID ?? "",
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD ?? "",
    isSandbox: process.env.SSLCOMMERZ_SANDBOX !== "false",
    apiBaseUrl:
      process.env.SSLCOMMERZ_SANDBOX !== "false"
        ? "https://sandbox.sslcommerz.com"
        : "https://securepay.sslcommerz.com",
  },
  bkash: {
    appKey: process.env.BKASH_APP_KEY ?? "",
    appSecret: process.env.BKASH_APP_SECRET ?? "",
    username: process.env.BKASH_USERNAME ?? "",
    password: process.env.BKASH_PASSWORD ?? "",
    isSandbox: process.env.BKASH_SANDBOX !== "false",
    apiBaseUrl:
      process.env.BKASH_SANDBOX !== "false"
        ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
        : "https://tokenized.pay.bka.sh/v1.2.0-beta",
  },
  nagad: {
    merchantId: process.env.NAGAD_MERCHANT_ID ?? "",
    merchantPrivateKey: process.env.NAGAD_MERCHANT_PRIVATE_KEY ?? "",
    nagadPublicKey: process.env.NAGAD_PUBLIC_KEY ?? "",
    isSandbox: process.env.NAGAD_SANDBOX !== "false",
    apiBaseUrl:
      process.env.NAGAD_SANDBOX !== "false"
        ? "http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0"
        : "https://api.mynagad.com/remote-payment-gateway-1.0",
  },
  rocket: {
    // Rocket (DBBL Mobile Banking)-এর কোনো পাবলিক স্ট্যান্ডার্ড merchant-checkout API নেই —
    // সাধারণত aggregator (SSLCommerz/ShurjoPay ইত্যাদি) এর মাধ্যমে বা ব্যাংকের সাথে সরাসরি
    // চুক্তির ভিত্তিতে কাস্টম ইন্টিগ্রেশন হয়। এই কনফিগ placeholder — নিচে RocketProvider-এর
    // কমেন্টে বিস্তারিত ব্যাখ্যা দেওয়া আছে।
    merchantId: process.env.ROCKET_MERCHANT_ID ?? "",
    apiKey: process.env.ROCKET_API_KEY ?? "",
    apiBaseUrl: process.env.ROCKET_API_BASE_URL ?? "",
  },
}));
