import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "../entities/product.entity";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>
  ) {}

  public async findAll(
    page = 1,
    limit = 20,
    search?: string
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const query = this.productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.author", "author")
      .leftJoinAndSelect("product.publisher", "publisher")
      .orderBy("product.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query.andWhere(
        "(product.name ILIKE :search OR author.name ILIKE :search OR publisher.name ILIKE :search OR category.name ILIKE :search OR product.sourceProductId ILIKE :search)",
        { search: searchTerm }
      );
    }

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, limit };
  }

  public async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ["category", "author", "publisher"],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  public async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
  }
}
