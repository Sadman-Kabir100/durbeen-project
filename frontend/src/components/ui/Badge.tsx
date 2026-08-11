import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeTone = "neutral" | "success" | "warning" | "error" | "primary" | "accent";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-neutral-100 text-neutral-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-500",
  error: "bg-error-50 text-error-600",
  primary: "bg-primary-50 text-primary-700",
  accent: "bg-accent-50 text-accent-600",
};

export function Badge({ className, tone = "neutral", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * ডিজাইন সিস্টেম ডকুমেন্টের "User Profile Page" সেকশনে সংজ্ঞায়িত OrderStatusBadge
 * কালার-ম্যাপিং — এখানে কেন্দ্রীভূত করা হলো যাতে Admin Order টেবিল ও কাস্টমার-facing
 * Order History উভয় জায়গায় একই ম্যাপিং reused হয় (ক্রস-পেজ কনসিস্টেন্সি নীতি)।
 */
export const ORDER_STATUS_TONE: Record<string, BadgeTone> = {
  placed: "neutral",
  confirmed: "primary",
  processing: "warning",
  shipped: "primary",
  delivered: "success",
  cancelled: "error",
  returned: "error",
};

export const ORDER_STATUS_LABEL_BN: Record<string, string> = {
  placed: "প্লেসড",
  confirmed: "কনফার্মড",
  processing: "প্রসেসিং",
  shipped: "শিপড",
  delivered: "ডেলিভারড",
  cancelled: "বাতিল",
  returned: "রিটার্ন",
};
