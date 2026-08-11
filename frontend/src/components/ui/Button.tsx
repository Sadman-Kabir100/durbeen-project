import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

// ডিজাইন সিস্টেম অংশ গ (ক্রস-পেজ কনসিস্টেন্সি): Button variants — primary/secondary/ghost,
// সব পেজে টাইপোগ্রাফি ও প্যাডিং অভিন্ন রাখতে এই একটাই কম্পোনেন্ট পুরো অ্যাপে ব্যবহৃত হবে।
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-700",
  secondary:
    "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100",
  ghost: "bg-transparent text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading = false, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
          "transition-colors duration-fast",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "active:scale-95",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
