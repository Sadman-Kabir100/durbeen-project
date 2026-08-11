"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { SEARCH_ROUTE } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

/**
 * নোট: এই কম্পোনেন্টে এখনো লাইভ autocomplete API কল যুক্ত হয়নি —
 * সেটা "API Integration" ধাপে useSearchSuggestions() হুক দিয়ে যুক্ত হবে
 * (আগের সিস্টেম আর্কিটেকচার ডকুমেন্টের Search Service অনুযায়ী)।
 * এই মুহূর্তে শুধু UI কাঠামো ও কীবোর্ড/ফর্ম behavior সঠিকভাবে তৈরি করা হলো।
 */
export function SearchBar() {
  const router = useRouter();
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`${SEARCH_ROUTE}?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="relative hidden w-full max-w-xl md:block"
    >
      <label htmlFor={inputId} className="sr-only">
        বই, লেখক বা প্রকাশক খুঁজুন
      </label>
      <div
        className={cn(
          "flex h-10 items-center gap-2 rounded-lg border bg-white px-3",
          "transition-colors duration-fast",
          isFocused ? "border-primary-600 ring-2 ring-primary-600/20" : "border-neutral-200"
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
        <input
          id={inputId}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="বই, লেখক বা প্রকাশক খুঁজুন..."
          className="h-full w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          autoComplete="off"
        />
      </div>

      {/* Autocomplete dropdown — API Integration ধাপে ডেটা-ড্রিভেন হবে */}
      {isFocused && query.trim().length > 0 && (
        <div
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+4px)] z-20 rounded-lg border border-neutral-200",
            "bg-white p-2 shadow-lg",
            "animate-fade-in-up"
          )}
        >
          <p className="px-2 py-1.5 text-xs text-neutral-400">সাজেশন লোড করার লজিক পরের ধাপে যুক্ত হবে</p>
        </div>
      )}
    </form>
  );
}
