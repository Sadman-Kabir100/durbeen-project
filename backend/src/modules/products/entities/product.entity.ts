import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Category } from "./category.entity";
import { Author } from "./author.entity";
import { Publisher } from "./publisher.entity";

@Entity("products")
export class Product extends BaseEntity {
  @Index("idx_products_name")
  @Column({ type: "varchar", length: 500 })
  name!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  slug?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ name: "regular_price", type: "numeric", precision: 10, scale: 2, default: 0 })
  regularPrice!: string;

  @Column({ name: "sale_price", type: "numeric", precision: 10, scale: 2, default: 0 })
  salePrice!: string;

  @Column({ type: "numeric", precision: 5, scale: 2, default: 0 })
  discount!: string;

  @Column({ name: "stock_quantity", type: "int", default: 100 })
  stockQuantity!: number;

  @Column({ name: "image_url", type: "text", nullable: true })
  imageUrl?: string;

  @Index("idx_products_source_url")
  @Column({ name: "source_url", type: "text", nullable: true })
  sourceUrl?: string;

  @Index("idx_products_source_product_id")
  @Column({ name: "source_product_id", type: "varchar", length: 255, nullable: true })
  sourceProductId?: string;

  @Column({ name: "category_id", type: "uuid", nullable: true })
  categoryId?: string;

  @Column({ name: "author_id", type: "uuid", nullable: true })
  authorId?: string;

  @Column({ name: "publisher_id", type: "uuid", nullable: true })
  publisherId?: string;

  @Column({ type: "varchar", length: 20, default: "active" })
  status!: string;

  @ManyToOne(() => Category, (category) => category.products, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "category_id" })
  category?: Category;

  @ManyToOne(() => Author, (author) => author.products, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "author_id" })
  author?: Author;

  @ManyToOne(() => Publisher, (publisher) => publisher.products, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "publisher_id" })
  publisher?: Publisher;
}
