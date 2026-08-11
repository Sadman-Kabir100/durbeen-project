"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Upload, Search, BookOpen, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { getProducts, type ProductItem } from "@/lib/api/products";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getProducts(page, 20, search);
      setProducts(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const columns: DataTableColumn<ProductItem>[] = [
    {
      id: "image",
      header: "ছবি",
      width: "60px",
      render: (row) => (
        <div className="h-10 w-10 overflow-hidden rounded border border-neutral-200 bg-neutral-100 flex items-center justify-center text-neutral-400">
          {row.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={row.imageUrl} alt={row.name} className="h-full w-full object-cover" />
          ) : (
            <BookOpen className="h-5 w-5" />
          )}
        </div>
      ),
    },
    {
      id: "name",
      header: "প্রোডাক্টের নাম",
      render: (row) => (
        <div>
          <p className="font-semibold text-neutral-900 line-clamp-1">{row.name}</p>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
            {row.sourceProductId && <span>ID: {row.sourceProductId}</span>}
            {row.sourceUrl && (
              <a
                href={row.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-primary-600 hover:underline"
              >
                উৎস <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "ক্যাটাগরি",
      render: (row) => (
        <span className="text-neutral-700">{row.category?.name || "—"}</span>
      ),
    },
    {
      id: "author",
      header: "লেখক",
      render: (row) => (
        <span className="text-neutral-700">{row.author?.name || "—"}</span>
      ),
    },
    {
      id: "publisher",
      header: "প্রকাশনী",
      render: (row) => (
        <span className="text-neutral-700">{row.publisher?.name || "—"}</span>
      ),
    },
    {
      id: "prices",
      header: "মূল্য (৳)",
      render: (row) => (
        <div>
          <span className="font-semibold text-neutral-900">৳{row.salePrice}</span>
          {Number(row.regularPrice) > Number(row.salePrice) && (
            <span className="ml-2 text-xs text-neutral-400 line-through">৳{row.regularPrice}</span>
          )}
          {Number(row.discount) > 0 && (
            <span className="ml-1 text-xs text-accent-600 font-medium">({row.discount}% ছাড়)</span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "স্ট্যাটাস",
      render: (row) => (
        <Badge tone={row.status === "active" ? "success" : "warning"}>
          {row.status === "active" ? "সক্রিয়" : row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">প্রোডাক্ট ম্যানেজমেন্ট</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            ক্যাটালগের সকল প্রোডাক্টের তালিকা এবং বাল্ক CSV ইম্পোর্ট ব্যবস্থাপনা
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={fetchProducts} isLoading={isLoading}>
            <RefreshCw className="h-4 w-4" /> রিফ্রেশ
          </Button>
          <Link href="/admin/products/import">
            <Button variant="primary" size="md">
              <Upload className="h-4 w-4" /> CSV ইম্পোর্ট করুন
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-neutral-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="প্রোডাক্ট নাম, আইডি, লেখক বা ক্যাটাগরি দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        getRowId={(row) => row.id}
        emptyMessage="কোনো প্রোডাক্ট পাওয়া যায়নি। CSV ইম্পোর্ট এর মাধ্যমে নতুন প্রোডাক্ট যোগ করুন।"
        isLoading={isLoading}
      />

      {total > 0 && (
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <p>মোট প্রোডাক্ট: {total}</p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              আগের পেজ
            </Button>
            <span>পেজ {page}</span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page * 20 >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              পরের পেজ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
