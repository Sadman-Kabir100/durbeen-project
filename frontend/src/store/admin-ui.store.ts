import { create } from "zustand";

/**
 * নোট: এটি ফ্রন্টএন্ড প্রজেক্টের মূল "State Management" ধাপের (Zustand: cart, wishlist,
 * auth, ui) অগ্রিম নয় — শুধু অ্যাডমিন প্যানেলের সাইডবার UI-state-এর জন্য একটি ছোট,
 * স্বয়ংসম্পূর্ণ স্টোর, যা শীঘ্রই মূল স্টেট-ম্যানেজমেন্ট ধাপে গ্লোবাল `useUIStore`-এর
 * মধ্যে একীভূত (merge) করা হবে। আপাতত আলাদা রাখা হয়েছে যাতে অ্যাডমিন প্যানেল
 * সেই ধাপ ছাড়াই স্বাধীনভাবে কাজ করতে পারে।
 */
interface AdminUIState {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useAdminUIStore = create<AdminUIState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
}));
