import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Conditional className যুক্ত করা এবং conflicting Tailwind ক্লাস
 * (যেমন px-2 ও px-4 একসাথে থাকলে শেষটা জেতে) নিরাপদে merge করার জন্য।
 * এই প্রজেক্টের প্রতিটি reusable কম্পোনেন্টে className prop হ্যান্ডল করতে এটাই ব্যবহৃত হবে।
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
