import type { Config } from "tailwindcss";

// এই কনফিগ ফাইলের সব টোকেন আগের "Wafilife UI/UX ডিজাইন সিস্টেম" ডকুমেন্টের
// "অংশ ক — গ্লোবাল ডিজাইন ফাউন্ডেশন" থেকে সরাসরি নেওয়া, যাতে ডিজাইন ও কোড
// কখনো একে অপরের থেকে ড্রিফট না করে (single source of truth)।

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    // ব্রেকপয়েন্ট Tailwind ডিফল্টের সাথে মিলে যায় (ডিজাইন ডকুমেন্ট অংশ ক.৪),
    // তাই এখানে override করার দরকার নেই — শুধু স্পষ্টতার জন্য কমেন্ট রাখা হলো:
    // sm:640px  md:768px  lg:1024px  xl:1280px  2xl:1536px
    extend: {
      colors: {
        primary: {
          50: "#EAF7F0",
          100: "#D3EFE1",
          500: "#149A5E",
          600: "#0F7A4C",
          700: "#0B5C3A",
          900: "#063B25",
        },
        accent: {
          50: "#FDECEF",
          500: "#EB3358",
          600: "#E11D48",
        },
        warning: {
          50: "#FEF3E2",
          500: "#F59E0B",
        },
        success: {
          50: "#EAFBF0",
          600: "#16A34A",
        },
        error: {
          50: "#FDECEC",
          600: "#DC2626",
        },
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          900: "#111827",
        },
      },
      fontFamily: {
        // globals.css এ next/font দিয়ে লোড হওয়া CSS ভ্যারিয়েবলের সাথে যুক্ত
        bengali: ["var(--font-bengali)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // ডিজাইন ডকুমেন্ট অংশ ক.১ টাইপোগ্রাফি স্কেল
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "36px" }],
        "4xl": ["36px", { lineHeight: "40px" }],
      },
      spacing: {
        // Tailwind এর ডিফল্ট 4px-বেস স্কেল (space-1=4px ... ) ইতিমধ্যে অংশ ক.৩ এর
        // সাথে মিলে যায়, তাই override দরকার নেই। শুধু কাস্টম প্রয়োজন যোগ করা হলো:
        18: "4.5rem",
      },
      maxWidth: {
        "7xl": "1280px",
      },
      transitionDuration: {
        // ডিজাইন ডকুমেন্ট অংশ ক.৫ — অ্যানিমেশন সিস্টেম
        fast: "120ms",
        base: "200ms",
        slow: "320ms",
      },
      transitionTimingFunction: {
        "ease-out-soft": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "skeleton-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "bounce-cart": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
        },
      },
      animation: {
        "skeleton-pulse": "skeleton-pulse 1.5s ease-in-out infinite",
        "fade-in-up": "fade-in-up 320ms ease-out-soft",
        "bounce-cart": "bounce-cart 300ms ease-in-out",
      },
      boxShadow: {
        "sticky-bottom": "0 -2px 8px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
