import "dotenv/config";
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

const dateType = process.env.DB_TYPE === "sqlite" ? "datetime" : "timestamptz";

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @CreateDateColumn({ type: dateType as any, name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: dateType as any, name: "updated_at" })
  updatedAt!: Date;
}
