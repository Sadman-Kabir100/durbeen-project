/**
 * প্রধান নেভিগেশন বার-এর একটি আইটেম।
 * href-এ Next.js App Router-এর typedRoutes ফিচার ব্যবহার করা হচ্ছে বলে
 * এখানে string না রেখে Route টাইপ ব্যবহার করাই ভবিষ্যতে নিরাপদ, কিন্তু
 * ডাইনামিক ক্যাটাগরি slug থাকায় আপাতত string রাখা হলো।
 */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  /** মেগা-মেনু সাব-আইটেম (lg+ ব্রেকপয়েন্টে ড্রপডাউনে দেখানো হয়) */
  children?: NavItem[];
  /** নতুন/আলাদা করে হাইলাইট করার জন্য (যেমন "আজকের অফার") */
  highlight?: boolean;
}

export interface FooterLinkGroup {
  id: string;
  title: string;
  links: { label: string; href: string }[];
}

export interface UserProfileSummary {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
}
