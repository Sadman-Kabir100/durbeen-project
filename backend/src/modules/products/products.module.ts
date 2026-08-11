import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { Category } from "./entities/category.entity";
import { Author } from "./entities/author.entity";
import { Publisher } from "./entities/publisher.entity";
import { ProductsService } from "./services/products.service";
import { ProductsImportService } from "./services/products-import.service";
import { ProductsController } from "./controllers/products.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Author, Publisher])],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsImportService],
  exports: [ProductsService, ProductsImportService],
})
export class ProductsModule {}
