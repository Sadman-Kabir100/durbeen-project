"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminUIStore } from "@/store/admin-ui.store";
import { ADMIN_NAV } from "@/lib/constants/admin-navigation";
import { cn } from "@/lib/utils/cn";

/**
 * ডিজাইন ডকুমেন্টের Admin Panel স্পেসিফিকেশন অনুযায়ী: width w-64↔w-16 কোলাপ্সিবল,
 * active NavItem primary-600 left-border + primary-50 bg, transition width transition-base
 * + লেবেল টেক্সট fade। md ব্রেকপয়েন্টে ডিফল্ট-কোলাপ্সড, lg+ এ ফুল-এক্সপ্যান্ডেড ডিফল্ট —
 * এই লজিকটা useAdminUIStore-এর ইনিশিয়াল স্টেটের বদলে CSS-ভিত্তিক রাখা সহজ, তাই
 * প্রাথমিক রেসপন্সিভ আচরণ Tailwind ব্রেকপয়েন্ট দিয়ে হ্যান্ডেল করা হচ্ছে এবং
 * useAdminUIStore শুধু ইউজারের ম্যানুয়াল টগলের জন্য override হিসেবে কাজ করে।
 */
export function SidebarNav() {
  const pathname = usePathname();
  const isCollapsed = useAdminUIStore((s) => s.isSidebarCollapsed);

  return (
    <aside
      className={cn(
        "sticky top-14 flex h-[calc(100vh-56px)] shrink-0 flex-col overflow-y-auto",
        "border-r border-neutral-200 bg-white transition-[width] duration-base",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <nav className="flex-1 space-y-6 px-2 py-4">
        {ADMIN_NAV.map((group) => (
          <div key={group.id}>
            {group.title && !isCollapsed && (
              <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "flex h-10 items-center gap-3 rounded-md border-l-2 px-3 text-sm font-medium",
                        "transition-colors duration-fast",
                        isActive
                          ? "border-primary-600 bg-primary-50 text-primary-700"
                          : "border-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                      {!isCollapsed && typeof item.badgeCount === "number" && item.badgeCount > 0 && (
                        <span className="ml-auto rounded-full bg-accent-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {item.badgeCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
