import "dotenv/config";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";

const dateType = process.env.DB_TYPE === "sqlite" ? "datetime" : "timestamptz";

@Entity("order_status_history")
export class OrderStatusHistory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index("idx_order_status_history_order_id")
  @Column({ name: "order_id", type: "uuid" })
  orderId!: string;

  @Column({ name: "from_status", type: "varchar", length: 30, nullable: true })
  fromStatus?: string;

  @Column({ name: "to_status", type: "varchar", length: 30 })
  toStatus!: string;

  @Column({ name: "changed_by", type: "varchar", length: 100 })
  changedBy!: string;

  @Column({ type: "text", nullable: true })
  note?: string;

  @Column({ name: "changed_at", type: dateType as any })
  changedAt!: Date;

  @ManyToOne(() => Order, (order) => order.statusHistory, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order!: Order;
}
