import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Product } from "./product.entity";

@Entity("categories")
export class Category extends BaseEntity {
  @Index("idx_categories_name", { unique: true })
  @Column({ type: "varchar", length: 255, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  slug!: string;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}
