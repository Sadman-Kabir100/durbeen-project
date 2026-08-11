/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Docker ডিপ্লয়মেন্টের জন্য — .next/standalone এ একটা self-contained Node সার্ভার
  // বান্ডেল তৈরি হয় (node_modules থেকে শুধু প্রয়োজনীয় ডিপেন্ডেন্সি ট্রেস করে কপি করে),
  // ফলে ফাইনাল ইমেজ অনেক ছোট হয় — পুরো node_modules কপি করার দরকার পড়ে না।
  output: "standalone",

  images: {
    // আগের সিস্টেম আর্কিটেকচার বিশ্লেষণে চিহ্নিত মিডিয়া CDN ডোমেইনসমূহ
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.durbeen.local",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.durbeen.local",
        pathname: "/**",
      },
    ],
    formats: ["image/webp"],
  },

  experimental: {
    // পরবর্তী ধাপে (User/Product/Order Management পেজ) সব রুট তৈরি হয়ে গেলে
    // এটি আবার true করা উচিত — টাইপ-সেফ লিংকের জন্য। আপাতত অ্যাডমিন সাইডবার
    // এমন কিছু রুটে লিংক করছে যেগুলো এখনো বিদ্যমান নয় (ধাপে ধাপে আসবে),
    // typedRoutes চালু থাকলে সেগুলোতে বিল্ড-টাইম টাইপ-এরর হবে।
    typedRoutes: false,
  },
};

export default nextConfig;
