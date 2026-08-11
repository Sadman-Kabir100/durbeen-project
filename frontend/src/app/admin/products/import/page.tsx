"use client";

import { useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Download,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  previewCsvImport,
  executeCsvImport,
  type ImportPreviewResponse,
  type ImportSummaryResponse,
} from "@/lib/api/products";

interface RawCsvRow {
  name?: string;
  author?: string;
  publisher?: string;
  regular_price?: string;
  sale_price?: string;
  discount?: string;
  category?: string;
  description?: string;
  image?: string;
  url?: string;
  id?: string;
  [key: string]: string | undefined;
}

export default function CsvProductImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isImportLoading, setIsImportLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewResponse | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummaryResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setErrorMessage("অনুগ্রহ করে একটি বৈধ .csv ফাইল নির্বাচন করুন");
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      generatePreview(file, text);
    };
    reader.readAsText(file, "UTF-8");
  };

  const generatePreview = async (file: File, text: string) => {
    setErrorMessage(null);

    try {
      const preview = await previewCsvImport(file);
      setPreviewData(preview);
    } catch (err: unknown) {
      console.warn("Backend preview fallback to PapaParse client preview", err);

      Papa.parse<RawCsvRow>(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data;
          const allMappedRows = rows.map((row, idx) => {
            const name = (row.name || "").trim();
            const regPrice = parseFloat(String(row.regular_price || "0").replace(/,/g, "")) || 0;
            const salePrice = parseFloat(String(row.sale_price || "0").replace(/,/g, "")) || regPrice;
            const discount = parseFloat(String(row.discount || "0").replace(/,/g, "")) || 0;
            const isValid = Boolean(name && regPrice >= 0 && salePrice >= 0);

            return {
              rowNumber: idx + 1,
              sourceProductId: (row.id || "").trim(),
              name,
              authorName: (row.author || "").trim(),
              publisherName: (row.publisher || "").trim(),
              categoryName: (row.category || "").trim(),
              regularPrice: regPrice,
              salePrice,
              discount,
              imageUrl: (row.image || "").trim(),
              sourceUrl: (row.url || "").trim(),
              isValid,
              validationError: !name ? "প্রোডাক্টের নাম খালি" : undefined,
            };
          });

          const validCount = allMappedRows.filter((r) => r.isValid).length;
          const invalidCount = allMappedRows.length - validCount;

          setPreviewData({
            totalRows: allMappedRows.length,
            validRowsCount: validCount,
            invalidRowsCount: invalidCount,
            previewRows: allMappedRows.slice(0, 10),
          });
        },
      });
    }
  };

  const handleStartImport = async () => {
    if (!selectedFile && !fileContent) return;

    setIsImportLoading(true);
    setErrorMessage(null);

    try {
      const summary = await executeCsvImport(selectedFile || fileContent);
      setImportSummary(summary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ইম্পোর্ট প্রসেস করতে সমস্যা হয়েছে";
      setErrorMessage(msg);
    } finally {
      setIsImportLoading(false);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setFileContent("");
    setPreviewData(null);
    setImportSummary(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600 mb-1"
          >
            <ArrowLeft className="h-4 w-4" /> প্রোডাক্ট তালিকায় ফিরে যান
          </Link>
          <h1 className="text-xl font-semibold text-neutral-900">বাল্ক CSV প্রোডাক্ট ইম্পোর্ট</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            CSV ফাইলের মাধ্যমে হাজার হাজার প্রোডাক্ট এক ক্লিকে দুরবীন ক্যাটালগে ইম্পোর্ট করুন
          </p>
        </div>

        <a
          href="/products-import-example.csv"
          download="products-import-example.csv"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-neutral-300 rounded-md bg-white hover:bg-neutral-50 text-neutral-700"
        >
          <Download className="h-3.5 w-3.5" /> নমুনা CSV ডাউনলোড
        </a>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-lg bg-error-50 border border-error-200 text-error-800 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-error-600" />
          <div>
            <p className="font-semibold">ত্রুটি ধরা পড়েছে</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Loading Progress State */}
      {isImportLoading && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin mx-auto" />
          <h3 className="text-base font-semibold text-primary-900">
            ইম্পোর্ট প্রক্রিয়া চলছে...
          </h3>
          <p className="text-sm text-primary-700">
            {previewData?.totalRows ? `${previewData.totalRows.toLocaleString()} টি প্রোডাক্ট ডাটাবেজে সংরক্ষণ করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন...` : "প্রসেসিং হচ্ছে..."}
          </p>
        </div>
      )}

      {/* Step 1: Upload CSV */}
      {!selectedFile && !importSummary && !isImportLoading && (
        <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 bg-white text-center hover:border-primary-500 transition-colors">
          <Upload className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900">CSV ফাইল আপলোড করুন</h3>
          <p className="text-sm text-neutral-500 max-w-md mx-auto mt-1 mb-4">
            আপনার স্ক্যাপার থেকে সংগৃহীত `.csv` ফাইল ড্র্যাগ করুন অথবা ব্রাউজ করে নির্বাচন করুন (UTF-8
            বাংলা ইউনিকোড সাপোর্টেড)
          </p>

          <label className="inline-block">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center gap-2 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 h-10 px-5 text-sm cursor-pointer shadow-sm">
              <FileText className="h-4 w-4" /> CSV ফাইল নির্বাচন করুন
            </span>
          </label>

          <div className="mt-6 pt-6 border-t border-neutral-100 text-xs text-neutral-400 max-w-2xl mx-auto text-left">
            <p className="font-semibold text-neutral-600 mb-1">প্রয়োজনীয় CSV কলামসমূহ:</p>
            <code className="bg-neutral-100 px-2 py-1 rounded text-neutral-800 block overflow-x-auto">
              name, author, publisher, regular_price, sale_price, discount, category, description, image, url, id
            </code>
          </div>
        </div>
      )}

      {/* Step 2: Preview Table */}
      {selectedFile && previewData && !importSummary && !isImportLoading && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary-600" />
              <div>
                <p className="font-semibold text-neutral-900">{selectedFile.name}</p>
                <p className="text-xs text-neutral-500">
                  মোট সারি: {previewData.totalRows.toLocaleString()} টি | বৈধ: {previewData.validRowsCount.toLocaleString()} টি
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={resetImport}>
                <RefreshCw className="h-3.5 w-3.5" /> ফাইল পরিবর্তন
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleStartImport}
                isLoading={isImportLoading}
              >
                <Upload className="h-4 w-4" /> ইম্পোর্ট শুরু করুন ({previewData.validRowsCount.toLocaleString()} টি)
              </Button>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              প্রিভিউ (প্রথম ১০ টি সারি)
            </h2>
            <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase font-semibold">
                  <tr>
                    <th className="px-3 py-2.5">#</th>
                    <th className="px-3 py-2.5">আইডি (id)</th>
                    <th className="px-3 py-2.5">প্রোডাক্টের নাম (name)</th>
                    <th className="px-3 py-2.5">লেখক (author)</th>
                    <th className="px-3 py-2.5">প্রকাশনী (publisher)</th>
                    <th className="px-3 py-2.5">ক্যাটাগরি (category)</th>
                    <th className="px-3 py-2.5">নিয়মিত মূল্য</th>
                    <th className="px-3 py-2.5">বিক্রয় মূল্য</th>
                    <th className="px-3 py-2.5">ছাড়</th>
                    <th className="px-3 py-2.5">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {previewData.previewRows.map((row) => (
                    <tr key={row.rowNumber} className="hover:bg-neutral-50">
                      <td className="px-3 py-2 font-mono text-neutral-400">{row.rowNumber}</td>
                      <td className="px-3 py-2 font-mono text-neutral-600">{row.sourceProductId || "—"}</td>
                      <td className="px-3 py-2 font-medium text-neutral-900 line-clamp-1 max-w-xs">{row.name}</td>
                      <td className="px-3 py-2 text-neutral-600">{row.authorName || "—"}</td>
                      <td className="px-3 py-2 text-neutral-600">{row.publisherName || "—"}</td>
                      <td className="px-3 py-2 text-neutral-600">{row.categoryName || "—"}</td>
                      <td className="px-3 py-2 text-neutral-600">৳{row.regularPrice}</td>
                      <td className="px-3 py-2 font-semibold text-neutral-900">৳{row.salePrice}</td>
                      <td className="px-3 py-2 text-accent-600">{row.discount}%</td>
                      <td className="px-3 py-2">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-success-700 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> সঠিক
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-error-600 font-medium" title={row.validationError}>
                            <AlertTriangle className="h-3.5 w-3.5" /> ভুল
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Summary Results */}
      {importSummary && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-success-100 flex items-center justify-center text-success-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">ইম্পোর্ট প্রক্রিয়া সম্পন্ন হয়েছে!</h2>
                  <p className="text-sm text-neutral-500">
                    সারসংক্ষেপ এবং সফলতার পরিসংখ্যান নিচে দেখানো হলো
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="secondary" size="md" onClick={resetImport}>
                  নতুন ইম্পোর্ট করুন
                </Button>
                <Link href="/admin/products">
                  <Button variant="primary" size="md">
                    প্রোডাক্ট তালিকা দেখুন
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-center">
                <p className="text-xs text-neutral-500 font-medium">মোট সারি</p>
                <p className="text-xl font-bold text-neutral-900 mt-0.5">{importSummary.totalRows.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-success-50 border border-success-200 rounded-lg text-center">
                <p className="text-xs text-success-700 font-medium">নতুন ইম্পোর্ট</p>
                <p className="text-xl font-bold text-success-800 mt-0.5">{importSummary.importedCount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg text-center">
                <p className="text-xs text-primary-700 font-medium">আপডেট হয়েছে</p>
                <p className="text-xl font-bold text-primary-800 mt-0.5">{importSummary.updatedCount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-lg text-center">
                <p className="text-xs text-neutral-600 font-medium">স্কিপড</p>
                <p className="text-xl font-bold text-neutral-700 mt-0.5">{importSummary.skippedCount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-center">
                <p className="text-xs text-error-700 font-medium">ব্যর্থ (Failed)</p>
                <p className="text-xl font-bold text-error-800 mt-0.5">{importSummary.failedCount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Row Level Error Log */}
          {importSummary.errors && importSummary.errors.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-error-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> ব্যর্থ সারিসমূহের বিস্তারিত ত্রুটি লগ ({importSummary.errors.length} টি)
              </h3>
              <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2">সারি #</th>
                      <th className="px-3 py-2">সোর্স আইডি</th>
                      <th className="px-3 py-2">প্রোডাক্টের নাম</th>
                      <th className="px-3 py-2">ত্রুটির কারণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {importSummary.errors.map((err, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50">
                        <td className="px-3 py-2 font-mono text-neutral-500">{err.row}</td>
                        <td className="px-3 py-2 font-mono text-neutral-600">{err.sourceProductId || "—"}</td>
                        <td className="px-3 py-2 font-medium text-neutral-800">{err.name || "—"}</td>
                        <td className="px-3 py-2 text-error-600 font-medium">{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
