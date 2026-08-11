import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Product } from "./product.entity";

@Entity("authors")
export class Author extends BaseEntity {
  @Index("idx_authors_name", { unique: true })
  @Column({ type: "varchar", length: 255, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  slug?: string;

  @Column({ type: "text", nullable: true })
  bio?: string;

  @OneToMany(() => Product, (product) => product.author)
  products!: Product[];
}
