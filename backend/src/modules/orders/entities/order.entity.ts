import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "@/common/entities/base.entity";
import { OrderStatus, PaymentMethod, PaymentStatus } from "../enums/order-status.enum";
import { OrderItem } from "./order-item.entity";
import { OrderStatusHistory } from "./order-status-history.entity";

/**
 * নোট: এটি "Order Management" মডিউলের পূর্ণাঙ্গ সংস্করণ নয় — শুধু Payment/Delivery/
 * Invoice মডিউলের জন্য প্রয়োজনীয় ন্যূনতম ফাউন্ডেশন (FK টার্গেট + স্ট্যাটাস ট্রানজিশন)।
 * cart→order রূপান্তর, কাস্টমার-facing অর্ডার লিস্টিং/বাতিলকরণ ইত্যাদি ভবিষ্যতের
 * "Order Management" ধাপে এই একই এনটিটির উপর তৈরি হবে।
 */
@Entity("orders")
export class Order extends BaseEntity {
  @Index("idx_orders_order_number", { unique: true })
  @Column({ name: "order_number", type: "varchar", length: 30, unique: true })
  orderNumber!: string;

  @Index("idx_orders_user_id")
  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "address_id", type: "uuid" })
  addressId!: string;

  @Index("idx_orders_status")
  @Column({ type: "varchar", length: 30, default: OrderStatus.PLACED })
  status!: OrderStatus;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  subtotal!: string;

  @Column({ name: "discount_amount", type: "numeric", precision: 10, scale: 2, default: 0 })
  discountAmount!: string;

  @Column({ name: "shipping_fee", type: "numeric", precision: 10, scale: 2, default: 0 })
  shippingFee!: string;

  @Column({ name: "total_amount", type: "numeric", precision: 10, scale: 2 })
  totalAmount!: string;

  @Column({ name: "payment_method", type: "varchar", length: 20 })
  paymentMethod!: PaymentMethod;

  @Column({ name: "payment_status", type: "varchar", length: 20, default: PaymentStatus.PENDING })
  paymentStatus!: PaymentStatus;

  @Column({ type: "text", nullable: true })
  note?: string | null;

  @Column({ name: "placed_at", type: "timestamptz" })
  placedAt!: Date;

  @OneToMany(() => OrderItem, (item) => item.order)
  items?: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order)
  statusHistory?: OrderStatusHistory[];
}
