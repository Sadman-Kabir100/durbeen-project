import { TrendingDown, TrendingUp } from "lucide-react";
import type { KpiCardData } from "@/types/admin";
import { cn } from "@/lib/utils/cn";
import { MiniBarChart } from "./MiniBarChart";

export function KPICard({ data }: { data: KpiCardData }) {
  const Icon = data.icon;
  const TrendIcon = data.trend === "down" ? TrendingDown : TrendingUp;
  const trendColor =
    data.trend === "down" ? "text-error-600" : data.trend === "up" ? "text-success-600" : "text-neutral-500";

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-500">{data.label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-neutral-900">{data.value}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>

      {data.deltaLabel && (
        <div className={cn("mt-2 flex items-center gap-1 text-xs font-medium", trendColor)}>
          {data.trend !== "flat" && <TrendIcon className="h-3.5 w-3.5" aria-hidden />}
          <span>{data.deltaLabel}</span>
        </div>
      )}

      {data.sparkline && (
        <div className="mt-3">
          <MiniBarChart data={data.sparkline} />
        </div>
      )}
    </div>
  );
}
