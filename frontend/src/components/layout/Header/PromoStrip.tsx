"use client";

import { useState } from "react";
import { X, Smartphone } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * ডিজাইন ডকুমেন্টের হোমপেজ লেআউটে চিহ্নিত "টপ ইউটিলিটি বার" —
 * অ্যাপ ডাউনলোড প্রোমোশন, ডিসমিস করা গেলে সেশনে মনে রাখা হয়।
 * localStorage state যেহেতু "থিম সিস্টেম" ও "স্টেট ম্যানেজমেন্ট" ধাপে আরও
 * বিস্তৃতভাবে হ্যান্ডেল হবে, আপাতত এখানে সাধারণ useState দিয়ে dismiss-only।
 */
export function PromoStrip() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-primary-700 text-white">
      <Container className="flex h-9 items-center justify-between text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 shrink-0" aria-hidden />
          <span>Durbeen অ্যাপে অর্ডার করুন — আরও বেশি অফার!</span>
          <a href="#" className="font-semibold underline underline-offset-2">
            ডাউনলোড করুন
          </a>
        </div>
        <button
          type="button"
          aria-label="প্রোমোশন বন্ধ করুন"
          onClick={() => setDismissed(true)}
          className="rounded-full p-1 transition-colors duration-fast hover:bg-white/10"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </Container>
    </div>
  );
}
