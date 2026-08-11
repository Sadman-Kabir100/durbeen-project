import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { parse } from "csv-parse/sync";
import { Product } from "../entities/product.entity";
import { Category } from "../entities/category.entity";
import { Author } from "../entities/author.entity";
import { Publisher } from "../entities/publisher.entity";
import { CsvProductRow, MappedProductRow } from "../dto/import-product.dto";
import { ImportPreviewDto, ImportSummaryDto, RowError } from "../dto/import-result.dto";

function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0980-\u09FF\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

@Injectable()
export class ProductsImportService {
  private readonly logger = new Logger(ProductsImportService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Parse CSV Buffer/String into structured row objects
   */
  public parseCsvContent(csvContent: string | Buffer): CsvProductRow[] {
    let contentStr = typeof csvContent === "string" ? csvContent : csvContent.toString("utf-8");
    // Strip BOM if present
    if (contentStr.charCodeAt(0) === 0xfeff) {
      contentStr = contentStr.slice(1);
    }

    const records: CsvProductRow[] = parse(contentStr, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });

    return records;
  }

  /**
   * Validate and map a raw CSV row into MappedProductRow
   */
  public mapAndValidateRow(row: CsvProductRow, rowIndex: number): MappedProductRow {
    const rowNumber = rowIndex + 1; // 1-based index (header is row 0 conceptually)

    const name = (row.name || "").trim();
    const sourceProductId = (row.id || "").trim();
    const sourceUrl = (row.url || "").trim();
    const authorName = (row.author || "").trim();
    const publisherName = (row.publisher || "").trim();
    const categoryName = (row.category || "").trim();
    const description = (row.description || "").trim();
    const imageUrl = (row.image || "").trim();

    if (!name) {
      return {
        rowNumber,
        sourceProductId,
        sourceUrl,
        name: row.name || "",
        regularPrice: 0,
        salePrice: 0,
        discount: 0,
        isValid: false,
        validationError: "Product name is required",
      };
    }

    // Parse prices
    const regPriceNum = parseFloat(String(row.regular_price || "0").replace(/,/g, ""));
    const salePriceNum = parseFloat(String(row.sale_price || "0").replace(/,/g, ""));
    let discountNum = parseFloat(String(row.discount || "0").replace(/,/g, ""));

    if (isNaN(regPriceNum) || regPriceNum < 0) {
      return {
        rowNumber,
        sourceProductId,
        sourceUrl,
        name,
        regularPrice: regPriceNum || 0,
        salePrice: salePriceNum || 0,
        discount: discountNum || 0,
        isValid: false,
        validationError: `Invalid regular_price: "${row.regular_price}"`,
      };
    }

    let finalSalePrice = isNaN(salePriceNum) || salePriceNum <= 0 ? regPriceNum : salePriceNum;
    if (finalSalePrice < 0) {
      return {
        rowNumber,
        sourceProductId,
        sourceUrl,
        name,
        regularPrice: regPriceNum,
        salePrice: finalSalePrice,
        discount: discountNum || 0,
        isValid: false,
        validationError: `Invalid sale_price: "${row.sale_price}"`,
      };
    }

    // Discount validation & calculation
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      // If regular_price and sale_price are valid, auto-calculate discount
      if (regPriceNum > 0 && finalSalePrice <= regPriceNum) {
        discountNum = Math.round(((regPriceNum - finalSalePrice) / regPriceNum) * 100);
      } else {
        discountNum = 0;
      }
    } else if (discountNum > 0 && finalSalePrice === regPriceNum && regPriceNum > 0) {
      // If discount is given but sale_price equals regular_price, compute sale_price from discount
      finalSalePrice = Math.round(regPriceNum * (1 - discountNum / 100));
    }

    return {
      rowNumber,
      sourceProductId,
      sourceUrl,
      name,
      authorName,
      publisherName,
      categoryName,
      regularPrice: regPriceNum,
      salePrice: finalSalePrice,
      discount: discountNum,
      description,
      imageUrl,
      isValid: true,
    };
  }

  /**
   * Preview first N rows of CSV import
   */
  public previewCsvImport(csvContent: string | Buffer, previewLimit = 10): ImportPreviewDto {
    const rawRows = this.parseCsvContent(csvContent);
    const mappedRows = rawRows.map((row, idx) => this.mapAndValidateRow(row, idx));

    const validCount = mappedRows.filter((r) => r.isValid).length;
    const invalidCount = mappedRows.length - validCount;

    return {
      totalRows: mappedRows.length,
      validRowsCount: validCount,
      invalidRowsCount: invalidCount,
      previewRows: mappedRows.slice(0, previewLimit).map((r) => ({
        rowNumber: r.rowNumber,
        sourceProductId: r.sourceProductId,
        name: r.name,
        authorName: r.authorName,
        publisherName: r.publisherName,
        categoryName: r.categoryName,
        regularPrice: r.regularPrice,
        salePrice: r.salePrice,
        discount: r.discount,
        imageUrl: r.imageUrl,
        sourceUrl: r.sourceUrl,
        isValid: r.isValid,
        validationError: r.validationError,
      })),
    };
  }

  /**
   * Execute full bulk CSV import with transaction batching & deduplication
   */
  public async executeImport(csvContent: string | Buffer): Promise<ImportSummaryDto> {
    const rawRows = this.parseCsvContent(csvContent);
    const mappedRows = rawRows.map((row, idx) => this.mapAndValidateRow(row, idx));

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const errors: RowError[] = [];

    // Pre-cache Category, Author, Publisher maps
    const categoryCache = new Map<string, Category>();
    const authorCache = new Map<string, Author>();
    const publisherCache = new Map<string, Publisher>();

    // Load existing categories, authors, publishers from DB
    const categoryRepo = this.dataSource.getRepository(Category);
    const authorRepo = this.dataSource.getRepository(Author);
    const publisherRepo = this.dataSource.getRepository(Publisher);

    const existingCategories = await categoryRepo.find();
    existingCategories.forEach((c) => categoryCache.set(c.name.trim().toLowerCase(), c));

    const existingAuthors = await authorRepo.find();
    existingAuthors.forEach((a) => authorCache.set(a.name.trim().toLowerCase(), a));

    const existingPublishers = await publisherRepo.find();
    existingPublishers.forEach((p) => publisherCache.set(p.name.trim().toLowerCase(), p));

    // Process valid rows in batches of 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < mappedRows.length; i += BATCH_SIZE) {
      const batch = mappedRows.slice(i, i + BATCH_SIZE);

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        for (const row of batch) {
          if (!row.isValid) {
            failedCount++;
            errors.push({
              row: row.rowNumber,
              sourceProductId: row.sourceProductId,
              name: row.name,
              error: row.validationError || "Validation error",
            });
            continue;
          }

          // 1. Resolve Category
          let category: Category | undefined;
          if (row.categoryName) {
            const catKey = row.categoryName.toLowerCase();
            category = categoryCache.get(catKey);
            if (!category) {
              category = queryRunner.manager.create(Category, {
                name: row.categoryName,
                slug: slugify(row.categoryName) || `cat-${Date.now()}`,
              });
              category = await queryRunner.manager.save(category);
              categoryCache.set(catKey, category);
            }
          }

          // 2. Resolve Author
          let author: Author | undefined;
          if (row.authorName) {
            const authorKey = row.authorName.toLowerCase();
            author = authorCache.get(authorKey);
            if (!author) {
              author = queryRunner.manager.create(Author, {
                name: row.authorName,
                slug: slugify(row.authorName) || `author-${Date.now()}`,
              });
              author = await queryRunner.manager.save(author);
              authorCache.set(authorKey, author);
            }
          }

          // 3. Resolve Publisher
          let publisher: Publisher | undefined;
          if (row.publisherName) {
            const pubKey = row.publisherName.toLowerCase();
            publisher = publisherCache.get(pubKey);
            if (!publisher) {
              publisher = queryRunner.manager.create(Publisher, {
                name: row.publisherName,
                slug: slugify(row.publisherName) || `pub-${Date.now()}`,
              });
              publisher = await queryRunner.manager.save(publisher);
              publisherCache.set(pubKey, publisher);
            }
          }

          // 4. Deduplication Check: Check by sourceProductId or sourceUrl
          let existingProduct: Product | null = null;

          if (row.sourceProductId) {
            existingProduct = await queryRunner.manager.findOne(Product, {
              where: { sourceProductId: row.sourceProductId },
            });
          }

          if (!existingProduct && row.sourceUrl) {
            existingProduct = await queryRunner.manager.findOne(Product, {
              where: { sourceUrl: row.sourceUrl },
            });
          }

          if (existingProduct) {
            // Update existing product
            existingProduct.name = row.name;
            existingProduct.regularPrice = row.regularPrice.toFixed(2);
            existingProduct.salePrice = row.salePrice.toFixed(2);
            existingProduct.discount = row.discount.toFixed(2);
            existingProduct.description = row.description || existingProduct.description;
            existingProduct.imageUrl = row.imageUrl || existingProduct.imageUrl;
            if (category) existingProduct.category = category;
            if (author) existingProduct.author = author;
            if (publisher) existingProduct.publisher = publisher;

            await queryRunner.manager.save(existingProduct);
            updatedCount++;
          } else {
            // Create new product
            const newProduct = queryRunner.manager.create(Product, {
              name: row.name,
              slug: slugify(row.name) || `prod-${Date.now()}`,
              sourceProductId: row.sourceProductId || undefined,
              sourceUrl: row.sourceUrl || undefined,
              regularPrice: row.regularPrice.toFixed(2),
              salePrice: row.salePrice.toFixed(2),
              discount: row.discount.toFixed(2),
              description: row.description,
              imageUrl: row.imageUrl,
              category,
              author,
              publisher,
              stockQuantity: 100,
              status: "active",
            });

            await queryRunner.manager.save(newProduct);
            importedCount++;
          }
        }

        await queryRunner.commitTransaction();
      } catch (err: any) {
        await queryRunner.rollbackTransaction();
        this.logger.error(`Error processing batch: ${err?.message}`, err?.stack);

        // Mark all batch items as failed if transaction fails
        for (const row of batch) {
          if (row.isValid) {
            failedCount++;
            errors.push({
              row: row.rowNumber,
              sourceProductId: row.sourceProductId,
              name: row.name,
              error: `Transaction failed: ${err?.message || "Unknown error"}`,
            });
          }
        }
      } finally {
        await queryRunner.release();
      }
    }

    return {
      totalRows: mappedRows.length,
      importedCount,
      updatedCount,
      skippedCount,
      failedCount,
      errors,
    };
  }
}
