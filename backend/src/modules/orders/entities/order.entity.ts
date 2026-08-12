import "dotenv/config";
import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { OrderItem } from "./order-item.entity";
import { OrderStatusHistory } from "./order-status-history.entity";

const dateType = process.env.DB_TYPE === "sqlite" ? "datetime" : "timestamptz";

@Entity("orders")
export class Order extends BaseEntity {
  @Column({ name: "order_number", type: "varchar", length: 30, unique: true })
  orderNumber!: string;

  @Index("idx_orders_user_id")
  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "address_id", type: "uuid" })
  addressId!: string;

  @Index("idx_orders_status")
  @Column({ type: "varchar", length: 30, default: "placed" })
  status!: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  subtotal!: string;

  @Column({ name: "discount_amount", type: "numeric", precision: 10, scale: 2, default: 0 })
  discountAmount!: string;

  @Column({ name: "shipping_fee", type: "numeric", precision: 10, scale: 2, default: 0 })
  shippingFee!: string;

  @Column({ name: "total_amount", type: "numeric", precision: 10, scale: 2 })
  totalAmount!: string;

  @Column({ name: "payment_method", type: "varchar", length: 20 })
  paymentMethod!: string;

  @Column({ name: "payment_status", type: "varchar", length: 20, default: "pending" })
  paymentStatus!: string;

  @Column({ type: "text", nullable: true })
  note?: string;

  @Column({ name: "placed_at", type: dateType as any })
  placedAt!: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order, { cascade: true })
  statusHistory!: OrderStatusHistory[];
}
