import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileNav";
import "../globals.css";

// ডিজাইন সিস্টেম অংশ ক.১: বাংলা কন্টেন্টের জন্য Hind Siliguri, ল্যাটিন/সংখ্যার জন্য Inter।
// CSS ভ্যারিয়েবল হিসেবে এক্সপোজ করা হচ্ছে, যা tailwind.config.ts এর fontFamily.bengali/sans এ ম্যাপ করা।
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Durbeen — বই, ইসলামি বই ও লাইফস্টাইল প্রোডাক্ট",
    template: "%s | Durbeen",
  },
  description:
    "বাংলাদেশের অনলাইন বুকশপ ও লাইফস্টাইল মার্কেটপ্লেস — সেরা মূল্যে বই, ইসলামি বই, গ্যাজেট ও আরও অনেক কিছু।",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Header />
        {/* মোবাইলে নিচের BottomNav-এর জন্য জায়গা রাখতে pb, ডেস্কটপে দরকার নেই */}
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
