export interface CsvProductRow {
  name?: string;
  author?: string;
  publisher?: string;
  regular_price?: string | number;
  sale_price?: string | number;
  discount?: string | number;
  category?: string;
  description?: string;
  image?: string;
  url?: string;
  id?: string;
  [key: string]: any;
}

export interface MappedProductRow {
  sourceProductId?: string;
  sourceUrl?: string;
  name: string;
  authorName?: string;
  publisherName?: string;
  categoryName?: string;
  regularPrice: number;
  salePrice: number;
  discount: number;
  description?: string;
  imageUrl?: string;
  rowNumber: number;
  isValid: boolean;
  validationError?: string;
}
