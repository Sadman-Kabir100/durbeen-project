export interface RowError {
  row: number;
  sourceProductId?: string;
  name?: string;
  error: string;
}

export interface ImportSummaryDto {
  totalRows: number;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  errors: RowError[];
}

export interface ImportPreviewDto {
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
