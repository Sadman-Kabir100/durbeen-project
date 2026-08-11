import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * ডিজাইন সিস্টেম অংশ ক.৩ অনুযায়ী: max-w-7xl (1280px) সেন্টারড কনটেইনার,
 * সাইড প্যাডিং মোবাইলে px-4, ট্যাবলেটে px-6, ডেস্কটপে px-8।
 */
export function Container({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8", className)} {...props}>
      {children}
    </div>
  );
}
