import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  /** স্ক্রিন-রিডারের জন্য বাধ্যতামূলক লেবেল, যেহেতু ভিজ্যুয়াল টেক্সট নেই */
  "aria-label": string;
  badgeCount?: number;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, badgeCount, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-full",
          "text-neutral-900 transition-colors duration-fast hover:bg-neutral-100 active:scale-95",
          className
        )}
        {...props}
      >
        {icon}
        {typeof badgeCount === "number" && badgeCount > 0 ? (
          <span
            className={cn(
              "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center",
              "rounded-full bg-accent-600 px-1 text-[10px] font-semibold leading-none text-white",
              "animate-bounce-cart"
            )}
          >
            {badgeCount > 99 ? "৯৯+" : badgeCount}
          </span>
        ) : null}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
