"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Badge, ORDER_STATUS_LABEL_BN, ORDER_STATUS_TONE } from "@/components/ui/Badge";
import type { RecentOrderRow } from "@/types/admin";

// TODO (API Integration ধাপে): GET /admin/orders?limit=6&sort=-placed_at দিয়ে রিপ্লেস
const MOCK_RECENT_ORDERS: RecentOrderRow[] = [
  { id: "1", orderNumber: "WFL-20260808-0231", customerName: "রাফসান জামান", itemsCount: 3, total: "৳ ১,২৮০", status: "processing", placedAt: "১০ মিনিট আগে" },
  { id: "2", orderNumber: "WFL-20260808-0230", customerName: "সুমাইয়া আক্তার", itemsCount: 1, total: "৳ ৪৫০", status: "confirmed", placedAt: "৩২ মিনিট আগে" },
  { id: "3", orderNumber: "WFL-20260808-0229", customerName: "তানভীর হাসান", itemsCount: 5, total: "৳ ৩,১০০", status: "shipped", placedAt: "১ ঘণ্টা আগে" },
  { id: "4", orderNumber: "WFL-20260807-0228", customerName: "নুসরাত জাহান", itemsCount: 2, total: "৳ ৮২০", status: "delivered", placedAt: "গতকাল" },
  { id: "5", orderNumber: "WFL-20260807-0227", customerName: "ইমরান খান", itemsCount: 1, total: "৳ ৩৯০", status: "cancelled", placedAt: "গতকাল" },
];

const columns: DataTableColumn<RecentOrderRow>[] = [
  {
    id: "orderNumber",
    header: "অর্ডার নং",
    render: (row) => <span className="font-mono text-xs text-neutral-600">{row.orderNumber}</span>,
  },
  { id: "customerName", header: "কাস্টমার", render: (row) => row.customerName },
  {
    id: "itemsCount",
    header: "আইটেম",
    align: "center",
    render: (row) => row.itemsCount,
  },
  {
    id: "total",
    header: "মোট",
    align: "right",
    render: (row) => <span className="font-medium tabular-nums">{row.total}</span>,
  },
  {
    id: "status",
    header: "স্ট্যাটাস",
    render: (row) => (
      <Badge tone={ORDER_STATUS_TONE[row.status] ?? "neutral"}>
        {ORDER_STATUS_LABEL_BN[row.status] ?? row.status}
      </Badge>
    ),
  },
  {
    id: "placedAt",
    header: "সময়",
    render: (row) => <span className="text-xs text-neutral-500">{row.placedAt}</span>,
  },
];

export function RecentOrdersTable() {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900">সাম্প্রতিক অর্ডার</h2>
        <Link
          href="/admin/orders"
          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
        >
          সব দেখুন <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <DataTable columns={columns} data={MOCK_RECENT_ORDERS} getRowId={(row) => row.id} />
    </div>
  );
}
