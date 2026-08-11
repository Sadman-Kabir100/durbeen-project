import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProductsImportService } from "../services/products-import.service";
import { ProductsService } from "../services/products.service";
import { Roles } from "../../auth/decorators/roles.decorator";
import { Public } from "../../auth/decorators/public.decorator";

@Controller("products")
export class ProductsController {
  constructor(
    private readonly productsImportService: ProductsImportService,
    private readonly productsService: ProductsService
  ) {}

  @Public() // Allow public access to view products
  @Get()
  async findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string
  ) {
    const pageNum = parseInt(page || "1", 10);
    const limitNum = parseInt(limit || "20", 10);
    return this.productsService.findAll(pageNum, limitNum, search);
  }

  @Public()
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  @Roles("admin", "staff")
  @Post("import/preview")
  @UseInterceptors(FileInterceptor("file"))
  async previewImport(
    @UploadedFile() file?: Express.Multer.File,
    @Body("csvContent") bodyCsvContent?: string
  ) {
    let content: string | Buffer = "";
    if (file && file.buffer) {
      content = file.buffer;
    } else if (bodyCsvContent) {
      content = bodyCsvContent;
    } else {
      throw new BadRequestException("CSV file or csvContent string is required");
    }

    return this.productsImportService.previewCsvImport(content, 10);
  }

  @Roles("admin", "staff")
  @Post("import")
  @UseInterceptors(FileInterceptor("file"))
  async importProducts(
    @UploadedFile() file?: Express.Multer.File,
    @Body("csvContent") bodyCsvContent?: string
  ) {
    let content: string | Buffer = "";
    if (file && file.buffer) {
      content = file.buffer;
    } else if (bodyCsvContent) {
      content = bodyCsvContent;
    } else {
      throw new BadRequestException("CSV file or csvContent string is required");
    }

    return this.productsImportService.executeImport(content);
  }

  @Roles("admin")
  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.productsService.remove(id);
    return { success: true, message: "Product deleted successfully" };
  }
}
