import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Product } from "./product.entity";

@Entity("publishers")
export class Publisher extends BaseEntity {
  @Index("idx_publishers_name", { unique: true })
  @Column({ type: "varchar", length: 255, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  slug?: string;

  @OneToMany(() => Product, (product) => product.publisher)
  products!: Product[];
}
