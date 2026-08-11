"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MAIN_NAV } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

/**
 * ডিজাইন ডকুমেন্টের Homepage/Category পেজ স্পেসিফিকেশন অনুযায়ী:
 * (base): হরাইজন্টাল-স্ক্রলযোগ্য pill-style row
 * lg+: ফুল-উইথ static row, সাব-আইটেমযুক্ত এন্ট্রিতে হোভারে মেগা-মেনু ড্রপডাউন
 */
export function CategoryNav() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <nav aria-label="প্রধান ক্যাটাগরি" className="border-t border-neutral-200 bg-white">
      <ul
        className={cn(
          "flex items-center gap-1 overflow-x-auto scrollbar-hide px-4 py-1.5",
          "md:px-6 lg:mx-auto lg:max-w-7xl lg:justify-center lg:overflow-visible lg:px-8"
        )}
      >
        {MAIN_NAV.map((item) => {
          const hasChildren = !!item.children?.length;
          return (
            <li
              key={item.id}
              className="relative shrink-0"
              onMouseEnter={() => hasChildren && setOpenId(item.id)}
              onMouseLeave={() => hasChildren && setOpenId(null)}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium",
                  "transition-colors duration-fast hover:bg-primary-50 hover:text-primary-700",
                  item.highlight ? "text-accent-600" : "text-neutral-900"
                )}
              >
                {item.label}
                {hasChildren && <ChevronDown className="h-3.5 w-3.5" aria-hidden />}
              </Link>

              {hasChildren && openId === item.id && (
                <div
                  className={cn(
                    "absolute left-0 top-full z-20 hidden min-w-56 rounded-lg border border-neutral-200",
                    "bg-white p-2 shadow-lg lg:block",
                    "animate-fade-in-up"
                  )}
                >
                  {item.children!.map((child) => (
                    <Link
                      key={child.id}
                      href={child.href}
                      className="block rounded-md px-3 py-2 text-sm text-neutral-900 transition-colors duration-fast hover:bg-primary-50 hover:text-primary-700"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
