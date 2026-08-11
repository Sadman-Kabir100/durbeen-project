const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"
).replace(/\/+$/, "");

export interface ProductItem {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  regularPrice: string | number;
  salePrice: string | number;
  discount: string | number;
  stockQuantity: number;
  imageUrl?: string;
  sourceUrl?: string;
  sourceProductId?: string;
  status: string;
  createdAt: string;
  category?: { id: string; name: string };
  author?: { id: string; name: string };
  publisher?: { id: string; name: string };
}

export interface ProductsResponse {
  data: ProductItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ImportPreviewResponse {
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  previewRows: {
    rowNumber: number;
    sourceProductId?: string;
    name: string;
    authorName?: string;
    publisherName?: string;
    categoryName?: string;
    regularPrice: number;
    salePrice: number;
    discount: number;
    imageUrl?: string;
    sourceUrl?: string;
    isValid: boolean;
    validationError?: string;
  }[];
}

export interface ImportSummaryResponse {
  totalRows: number;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  errors: {
    row: number;
    sourceProductId?: string;
    name?: string;
    error: string;
  }[];
}

/**
 * Fetch list of products for admin panel
 */
export async function getProducts(page = 1, limit = 20, search = ""): Promise<ProductsResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
  });

  try {
    const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend API not reachable, returning fallback empty list", err);
    return { data: [], total: 0, page: 1, limit };
  }
}

/**
 * Preview CSV import
 */
export async function previewCsvImport(file: File | string): Promise<ImportPreviewResponse> {
  const formData = new FormData();
  if (typeof file === "string") {
    formData.append("csvContent", file);
  } else {
    formData.append("file", file);
  }

  const res = await fetch(`${API_BASE_URL}/products/import/preview`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Preview failed: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Execute full CSV product import
 */
export async function executeCsvImport(file: File | string): Promise<ImportSummaryResponse> {
  const formData = new FormData();
  if (typeof file === "string") {
    formData.append("csvContent", file);
  } else {
    formData.append("file", file);
  }

  const res = await fetch(`${API_BASE_URL}/products/import`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Import failed: ${res.statusText}`);
  }

  return await res.json();
}
