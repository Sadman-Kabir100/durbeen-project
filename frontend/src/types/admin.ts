import type { LucideIcon } from "lucide-react";

export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** ভবিষ্যতে RBAC গার্ড করতে — শুধু এই role slug-গুলোর ইউজার এই আইটেম দেখবে */
  allowedRoles?: string[];
  badgeCount?: number;
}

export interface AdminNavGroup {
  id: string;
  title?: string;
  items: AdminNavItem[];
}

export type KpiTrend = "up" | "down" | "flat";

export interface KpiCardData {
  id: string;
  label: string;
  value: string;
  deltaLabel?: string;
  trend?: KpiTrend;
  icon: LucideIcon;
  sparkline?: number[];
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export interface RecentOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  itemsCount: number;
  total: string;
  status: OrderStatus;
  placedAt: string;
}

export interface LowStockRow {
  id: string;
  title: string;
  sku: string;
  stockQty: number;
  reorderLevel: number;
}
