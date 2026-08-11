import { DollarSign, ShoppingBag, UserPlus, AlertTriangle } from "lucide-react";
import type { KpiCardData } from "@/types/admin";
import { KPICard } from "./KPICard";

/**
 * TODO (API Integration ধাপে): এই মক ডেটা GET /admin/analytics/overview
 * এন্ডপয়েন্ট দিয়ে রিপ্লেস হবে (আগের System Architecture ডকুমেন্টের
 * Analytics/Reporting Worker থেকে precomputed)। আপাতত UI/লেআউট
 * ভ্যালিডেট করতে static ডেটা।
 */
const MOCK_KPI_DATA: KpiCardData[] = [
  {
    id: "total-sales",
    label: "মোট বিক্রয় (এই মাসে)",
    value: "৳ ৪,৮২,৫০০",
    deltaLabel: "গত মাসের তুলনায় ১২.৪% বেশি",
    trend: "up",
    icon: DollarSign,
    sparkline: [12, 18, 14, 22, 19, 26, 24, 30, 28, 34, 31, 38],
  },
  {
    id: "total-orders",
    label: "মোট অর্ডার (এই মাসে)",
    value: "১,২৪৭",
    deltaLabel: "গত মাসের তুলনায় ৮.১% বেশি",
    trend: "up",
    icon: ShoppingBag,
    sparkline: [8, 10, 9, 14, 12, 15, 13, 17, 16, 19, 18, 21],
  },
  {
    id: "new-users",
    label: "নতুন ইউজার (এই মাসে)",
    value: "৩৮৯",
    deltaLabel: "গত মাসের তুলনায় ৩.২% কম",
    trend: "down",
    icon: UserPlus,
    sparkline: [20, 22, 19, 21, 18, 20, 17, 19, 16, 18, 15, 14],
  },
  {
    id: "low-stock",
    label: "লো-স্টক প্রোডাক্ট",
    value: "১৮",
    deltaLabel: "মনোযোগ প্রয়োজন",
    trend: "flat",
    icon: AlertTriangle,
  },
];

export function KPICardGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {MOCK_KPI_DATA.map((kpi) => (
        <KPICard key={kpi.id} data={kpi} />
      ))}
    </div>
  );
}
