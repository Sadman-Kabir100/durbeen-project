import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { OrderStatus } from "../enums/order-status.enum";

/**
 * প্রতিটা স্ট্যাটাস-পরিবর্তনের audit trail — Order Tracking ফিচারের মূল ডেটাসোর্স
 * (ডিজাইন সিস্টেম ডকুমেন্টের OrderProgressStepper/OrderCard "বিস্তারিত দেখুন" টাইমলাইন
 * এই টেবিল থেকেই populate হবে)। changedBy-তে "system"/"admin:<userId>"/"webhook:<provider>"
 * জাতীয় ভ্যালু থাকবে যাতে কে/কী পরিবর্তন করেছে তা অডিটযোগ্য থাকে।
 */
@Entity("order_status_history")
export class OrderStatusHistory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index("idx_order_status_history_order_id")
  @Column({ name: "order_id", type: "uuid" })
  orderId!: string;

  @Column({ name: "from_status", type: "varchar", length: 30, nullable: true })
  fromStatus?: OrderStatus | null;

  @Column({ name: "to_status", type: "varchar", length: 30 })
  toStatus!: OrderStatus;

  @Column({ name: "changed_by", type: "varchar", length: 100 })
  changedBy!: string;

  @Column({ type: "text", nullable: true })
  note?: string | null;

  @CreateDateColumn({ name: "changed_at", type: "timestamptz" })
  changedAt!: Date;

  @ManyToOne(() => Order, (order) => order.statusHistory, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order!: Order;
}
