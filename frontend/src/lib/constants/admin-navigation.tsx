import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  BookOpen,
  FolderTree,
  Boxes,
  ShoppingCart,
  CreditCard,
  Ticket,
  BarChart3,
} from "lucide-react";
import type { AdminNavGroup } from "@/types/admin";

/**
 * ডিজাইন সিস্টেম ডকুমেন্টের "Admin Panel" সেকশনের SidebarNav কম্পোনেন্ট হায়ারার্কি অনুযায়ী —
 * NavGroup × N (ড্যাশবোর্ড, প্রোডাক্ট, অর্ডার, ইউজার, ...)। এই ধাপে শুধু Dashboard-এর
 * রুট আছে; বাকি রুটগুলো (users, roles, products...) পরের ধাপে ধাপে তৈরি হবে —
 * এখন লিংক থাকলেও সেই পেজগুলো এখনো বিদ্যমান নয়, তাই ক্লিক করলে 404 আসবে।
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    id: "overview",
    items: [{ id: "dashboard", label: "ড্যাশবোর্ড", href: "/admin", icon: LayoutDashboard }],
  },
  {
    id: "catalog",
    title: "ক্যাটালগ",
    items: [
      { id: "products", label: "প্রোডাক্ট ম্যানেজমেন্ট", href: "/admin/products", icon: BookOpen },
      { id: "categories", label: "ক্যাটাগরি ম্যানেজমেন্ট", href: "/admin/categories", icon: FolderTree },
      { id: "inventory", label: "ইনভেন্টরি ম্যানেজমেন্ট", href: "/admin/inventory", icon: Boxes },
    ],
  },
  {
    id: "sales",
    title: "বিক্রয়",
    items: [
      { id: "orders", label: "অর্ডার ম্যানেজমেন্ট", href: "/admin/orders", icon: ShoppingCart },
      { id: "payments", label: "পেমেন্ট ম্যানেজমেন্ট", href: "/admin/payments", icon: CreditCard },
      { id: "coupons", label: "কুপন ম্যানেজমেন্ট", href: "/admin/coupons", icon: Ticket },
    ],
  },
  {
    id: "people",
    title: "অ্যাক্সেস",
    items: [
      { id: "users", label: "ইউজার ম্যানেজমেন্ট", href: "/admin/users", icon: Users },
      { id: "roles", label: "রোল ম্যানেজমেন্ট", href: "/admin/roles", icon: ShieldCheck, allowedRoles: ["admin"] },
    ],
  },
  {
    id: "insights",
    title: "ইনসাইট",
    items: [{ id: "analytics", label: "অ্যানালিটিক্স", href: "/admin/analytics", icon: BarChart3 }],
  },
];
