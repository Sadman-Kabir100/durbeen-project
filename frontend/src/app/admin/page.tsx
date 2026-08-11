import { KPICardGrid, RecentOrdersTable, LowStockAlert } from "@/components/admin/dashboard";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">ড্যাশবোর্ড</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          আজকের একনজর সারসংক্ষেপ — বিক্রয়, অর্ডার, ইউজার ও ইনভেন্টরি
        </p>
      </div>

      <KPICardGrid />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrdersTable />
        </div>
        <div>
          <LowStockAlert />
        </div>
      </div>
    </div>
  );
}
