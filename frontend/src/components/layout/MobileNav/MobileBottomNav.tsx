"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, User, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ACCOUNT_ROUTE, CART_ROUTE, SEARCH_ROUTE } from "@/lib/constants/navigation";

const ITEMS = [
  { id: "home", label: "হোম", href: "/", icon: Home },
  { id: "category", label: "ক্যাটাগরি", href: "/cat/books/subject", icon: LayoutGrid },
  { id: "search", label: "সার্চ", href: SEARCH_ROUTE, icon: Search },
  { id: "cart", label: "কার্ট", href: CART_ROUTE, icon: ShoppingCart },
  { id: "account", label: "অ্যাকাউন্ট", href: ACCOUNT_ROUTE, icon: User },
] as const;

/**
 * শুধু মোবাইল ব্রেকপয়েন্টে visible (md থেকে hidden)। z-index স্কেলে এটা
 * ডিজাইন ডকুমেন্টের "sticky bottom bar" লেভেলের সাথে সামঞ্জস্যপূর্ণ (z-20)।
 * প্রোডাক্ট/চেকআউট পেজের StickyMobileBuyBar-এর সাথে conflict এড়াতে
 * ঐ পেজগুলোতে এই কম্পোনেন্ট কন্ডিশনালি hide করা হবে (layout-লেভেল লজিক, পরের ধাপে)।
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="মোবাইল নেভিগেশন"
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around",
        "border-t border-neutral-200 bg-white shadow-sticky-bottom md:hidden"
      )}
    >
      {ITEMS.map(({ id, label, href, icon: Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={id}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px]",
              isActive ? "text-primary-600" : "text-neutral-500"
            )}
          >
            <Icon className="h-5 w-5" aria-hidden strokeWidth={isActive ? 2.5 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
