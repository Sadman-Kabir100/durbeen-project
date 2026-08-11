import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";

/**
 * এই এনটিটিতে BaseEntity ইনহেরিট করা হয়নি কারণ order_items-এ updated_at দরকার নেই
 * (আগের ডাটাবেজ স্কিমা ডকুমেন্টে এই টেবিলে শুধু id, কোনো timestamp কলাম ছিল না) —
 * একবার তৈরি হলে একটা order_item আর পরিবর্তন হয় না (immutable snapshot)।
 */
@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index("idx_order_items_order_id")
  @Column({ name: "order_id", type: "uuid" })
  orderId!: string;

  @Index("idx_order_items_product_id")
  @Column({ name: "product_id", type: "uuid" })
  productId!: string;

  // Product মডিউল এখনো তৈরি হয়নি বলে ইচ্ছাকৃতভাবে TypeORM relation নেই —
  // শুধু snapshot ডেটা, যা আগের ডাটাবেজ স্কিমা ডকুমেন্টের ডিজাইন নীতি #৩ (Snapshot ফিল্ড) অনুযায়ী সঠিক
  @Column({ name: "product_title_snapshot", type: "varchar", length: 500 })
  productTitleSnapshot!: string;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ name: "unit_price", type: "numeric", precision: 10, scale: 2 })
  unitPrice!: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  subtotal!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order!: Order;
}
