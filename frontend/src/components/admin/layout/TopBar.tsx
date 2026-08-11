"use client";

import Link from "next/link";
import { Bell, Menu, Search, ChevronDown } from "lucide-react";
import { useAdminUIStore } from "@/store/admin-ui.store";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils/cn";

/**
 * ডিজাইন ডকুমেন্টের Admin Panel TopBar স্পেসিফিকেশন: height h-14, fixed,
 * SidebarToggleButton + GlobalSearchInput + NotificationBell + AdminProfileDropdown।
 */
export function TopBar() {
  const toggleSidebar = useAdminUIStore((s) => s.toggleSidebar);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-neutral-200 bg-white px-4">
      <IconButton
        icon={<Menu className="h-5 w-5" aria-hidden />}
        aria-label="সাইডবার টগল করুন"
        onClick={toggleSidebar}
      />

      <Link href="/admin" className="shrink-0 text-lg font-bold text-primary-600">
        Durbeen <span className="text-neutral-400">অ্যাডমিন</span>
      </Link>

      <div className="ml-2 hidden max-w-md flex-1 items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 md:flex">
        <Search className="h-4 w-4 text-neutral-400" aria-hidden />
        <input
          type="text"
          placeholder="প্রোডাক্ট, অর্ডার, ইউজার খুঁজুন..."
          className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <IconButton
          icon={<Bell className="h-5 w-5" aria-hidden />}
          aria-label="নোটিফিকেশন"
          badgeCount={3}
        />

        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-sm",
            "transition-colors duration-fast hover:bg-neutral-100"
          )}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
            আ
          </span>
          <span className="hidden font-medium text-neutral-900 sm:inline">অ্যাডমিন</span>
          <ChevronDown className="h-4 w-4 text-neutral-400" aria-hidden />
        </button>
      </div>
    </header>
  );
}
