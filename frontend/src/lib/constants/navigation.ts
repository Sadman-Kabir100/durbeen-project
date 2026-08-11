import type { FooterLinkGroup, NavItem } from "@/types/navigation";

/**
 * প্রধান ক্যাটাগরি নেভিগেশন — আগের "wafilife.com সম্পূর্ণ বিশ্লেষণ" ধাপে
 * পর্যবেক্ষিত হেডার নেভিগেশন কাঠামো অনুসরণ করা হয়েছে:
 * বই-কেন্দ্রিক প্রথম কয়েকটি লিংক, তারপর non-book ভার্টিক্যাল।
 */
export const MAIN_NAV: NavItem[] = [
  { id: "home", label: "হোম", href: "/" },
  {
    id: "subject",
    label: "বিষয়",
    href: "/cat/books/subject",
    children: [
      { id: "academic", label: "একাডেমিক", href: "/cat/books/subject/academic" },
      { id: "islamic", label: "ইসলামি বই", href: "/cat/books/subject/islamic" },
      { id: "kids", label: "শিশু-কিশোর", href: "/cat/books/subject/kids" },
      { id: "aliya", label: "আলিয়া মাদ্রাসা", href: "/cat/books/subject/aliya-madrasah" },
      { id: "qawmi", label: "কওমি মাদ্রাসা", href: "/cat/books/subject/qawmi-madrasah" },
    ],
  },
  { id: "author", label: "লেখক", href: "/cat/books/author" },
  { id: "publisher", label: "প্রকাশক", href: "/cat/books/publisher" },
  { id: "today-offer", label: "আজকের অফার", href: "/offers/today", highlight: true },
  { id: "pre-order", label: "প্রি-অর্ডার", href: "/cat/books/pre-order" },
  { id: "food", label: "ফুড", href: "/cat/products/food" },
  { id: "lifestyle", label: "লাইফস্টাইল", href: "/cat/products/lifestyle" },
  { id: "gadget", label: "গ্যাজেট", href: "/cat/products/gadget" },
  { id: "stationery", label: "স্টেশনারি", href: "/cat/products/stationery" },
];

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    id: "company",
    title: "কোম্পানি",
    links: [
      { label: "আমাদের সম্পর্কে", href: "/about" },
      { label: "ক্যারিয়ার", href: "/careers" },
      { label: "ব্লগ", href: "/blog" },
      { label: "যোগাযোগ", href: "/contact" },
    ],
  },
  {
    id: "help",
    title: "সহায়তা",
    links: [
      { label: "অর্ডার ট্র্যাক করুন", href: "/track-order" },
      { label: "রিটার্ন ও রিফান্ড নীতি", href: "/policy/return-refund" },
      { label: "ডেলিভারি তথ্য", href: "/policy/delivery" },
      { label: "প্রায়শই জিজ্ঞাসিত প্রশ্ন", href: "/faq" },
    ],
  },
  {
    id: "legal",
    title: "নীতিমালা",
    links: [
      { label: "গোপনীয়তা নীতি", href: "/policy/privacy" },
      { label: "ব্যবহারের শর্তাবলী", href: "/policy/terms" },
    ],
  },
];

export const CART_ROUTE = "/cart" as const;
export const WISHLIST_ROUTE = "/my-account/wishlist" as const;
export const ACCOUNT_ROUTE = "/my-account" as const;
export const SEARCH_ROUTE = "/search" as const;
