import Link from "next/link";
import { PackageX } from "lucide-react";
import type { LowStockRow } from "@/types/admin";
import { cn } from "@/lib/utils/cn";

// TODO (API Integration ধাপে): GET /admin/inventory?filter=low-stock দিয়ে রিপ্লেস
const MOCK_LOW_STOCK: LowStockRow[] = [
  { id: "1", title: "ভাত আইন ও বিধান সহজ পাঠ", sku: "WFL-BK-11239", stockQty: 2, reorderLevel: 5 },
  { id: "2", title: "আল-মুকাদ্দিমাতুল জাযারিয়্যাহ", sku: "WFL-BK-08821", stockQty: 0, reorderLevel: 5 },
  { id: "3", title: "মেডিটেশন কুশন — লাইফস্টাইল", sku: "WFL-LS-00456", stockQty: 3, reorderLevel: 8 },
  { id: "4", title: "প্রিমিয়াম নোটবুক সেট", sku: "WFL-ST-00219", stockQty: 4, reorderLevel: 10 },
];

export function LowStockAlert() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-900">
          <PackageX className="h-5 w-5 text-warning-500" aria-hidden />
          লো-স্টক অ্যালার্ট
        </h2>
        <Link href="/admin/inventory" className="text-sm font-medium text-primary-600 hover:underline">
          সব দেখুন
        </Link>
      </div>

      <ul className="space-y-3">
        {MOCK_LOW_STOCK.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">{item.title}</p>
              <p className="text-xs text-neutral-500">{item.sku}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                item.stockQty === 0 ? "bg-error-50 text-error-600" : "bg-warning-50 text-warning-500"
              )}
            >
              {item.stockQty === 0 ? "স্টক নেই" : `${item.stockQty} বাকি`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
