/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Docker ডিপ্লয়মেন্টের জন্য standalone মোড — Vercel-এ বিল্ডের সময় Vercel ডিফল্ট আউটপুট ব্যবহার করবে
  output: process.env.VERCEL ? undefined : "standalone",

  images: {
    // যেকোনো রিমোট ইউআরএল (S3, Cloudinary, Unsplash, Backend CDN) থেকে প্রোডাক্ট ইমেজ লোড করার জন্য
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    formats: ["image/webp"],
  },

  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
