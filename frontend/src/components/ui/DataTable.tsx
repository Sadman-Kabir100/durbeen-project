"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  /** প্রতিটি row থেকে সেল-কন্টেন্ট তৈরি করে — plain টেক্সট বা কাস্টম JSX (যেমন Badge) */
  render: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  /** সরু কলাম (আইকন-অ্যাকশন, চেকবক্স) ফুল-উইথ না নিতে */
  width?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  emptyMessage?: string;
  /** row-এ ক্লিক করলে (যেমন ডিটেইল drawer খুলতে) — ঐচ্ছিক */
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
}

/**
 * ডিজাইন ডকুমেন্টের Admin Panel স্পেসিফিকেশন অনুযায়ী: cell প্যাডিং px-4 py-3
 * (পাবলিক সাইটের তুলনায় কম্প্যাক্ট — density-first), হেডার text-xs uppercase,
 * row hover neutral-50। এই কম্পোনেন্ট এখনো sort/select/bulk-action যুক্ত করেনি —
 * সেগুলো নির্দিষ্ট মডিউল (Product/Order Management) তৈরির সময় প্রয়োজন অনুযায়ী
 * প্রপ হিসেবে এক্সটেন্ড হবে, যাতে এখনই over-engineer না হয়।
 */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  emptyMessage = "কোনো ডেটা পাওয়া যায়নি",
  onRowClick,
  isLoading = false,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {columns.map((col) => (
              <th
                key={col.id}
                style={col.width ? { width: col.width } : undefined}
                className={cn(
                  "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  (!col.align || col.align === "left") && "text-left"
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows columnCount={columns.length} />
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-neutral-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={getRowId(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-neutral-100 transition-colors duration-fast last:border-b-0 hover:bg-neutral-50",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={cn(
                      "px-4 py-3 text-neutral-900",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center"
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function SkeletonRows({ columnCount }: { columnCount: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIdx) => (
        <tr key={rowIdx} className="border-b border-neutral-100 last:border-b-0">
          {Array.from({ length: columnCount }).map((_, colIdx) => (
            <td key={colIdx} className="px-4 py-3">
              <div className="h-4 w-full max-w-32 animate-skeleton-pulse rounded bg-neutral-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
