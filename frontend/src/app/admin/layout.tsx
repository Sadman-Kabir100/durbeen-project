import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import { TopBar, SidebarNav } from "@/components/admin/layout";
import "../globals.css";

/**
 * ⚠️ গুরুত্বপূর্ণ স্থাপত্যগত সিদ্ধান্ত: এটি নিজেই একটি সম্পূর্ণ root layout
 * (নিজস্ব html/body সহ) — src/app/(site)/layout.tsx এর সাথে কোনো সম্পর্ক নেই।
 * Next.js App Router-এ "(site)" route group ও "admin" ফোল্ডার একে অপরের sibling
 * top-level segment, এবং তাদের কোনো common root layout নেই বলে প্রতিটি নিজের মতো
 * স্বতন্ত্র root layout ডিফাইন করতে পারে। ফলে অ্যাডমিন প্যানেলে পাবলিক সাইটের
 * Header/Footer/MobileBottomNav একেবারেই রেন্ডার হয় না — ডিজাইন ডকুমেন্টে বলা
 * "সম্পূর্ণ আলাদা শেল" ঠিক এভাবেই বাস্তবায়িত হচ্ছে।
 */
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
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
    default: "Durbeen অ্যাডমিন",
    template: "%s | Durbeen অ্যাডমিন",
  },
  robots: { index: false, follow: false }, // অ্যাডমিন পেজ কখনো সার্চ ইঞ্জিনে ইনডেক্স হবে না
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} ${inter.variable}`}>
      <body className="bg-neutral-50 font-bengali text-neutral-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <TopBar />
          <div className="flex flex-1">
            <SidebarNav />
            <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
