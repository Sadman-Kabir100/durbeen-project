import Link from "next/link";
import { Menu } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { IconButton } from "@/components/ui/IconButton";
import { PromoStrip } from "./PromoStrip";
import { SearchBar } from "./SearchBar";
import { IconGroup } from "./IconGroup";
import { CategoryNav } from "./CategoryNav";

/**
 * Header একটি Server Component হিসেবে রাখা হয়েছে (কোনো "use client" নেই এই ফাইলে)
 * — শুধু ইন্টারঅ্যাক্টিভ অংশ (SearchBar, PromoStrip, CategoryNav dropdown) আলাদা
 * client component হিসেবে ভাঙা হয়েছে। এটা Next.js App Router-এর সেরা প্র্যাকটিস:
 * যতটা সম্ভব সার্ভারে রেন্ডার করা, ইন্টারঅ্যাক্টিভিটি দরকার এমন অংশই শুধু ক্লায়েন্টে পাঠানো।
 */
export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full">
      <PromoStrip />

      <div className="border-b border-neutral-200 bg-white">
        <Container className="flex h-16 items-center gap-4">
          {/* মোবাইল হ্যামবার্গার — MobileNav ড্রয়ার পরের ধাপে (State Management) যুক্ত হবে */}
          <IconButton
            icon={<Menu className="h-5 w-5" aria-hidden />}
            aria-label="মেনু খুলুন"
            className="md:hidden"
          />

          <Link href="/" className="shrink-0 text-xl font-bold text-primary-600">
            Durbeen
          </Link>

          <SearchBar />

          <div className="ml-auto">
            <IconGroup />
          </div>
        </Container>
      </div>

      <CategoryNav />
    </header>
  );
}
