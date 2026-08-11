import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "@/common/entities/base.entity";
import { Order } from "@/modules/orders/entities/order.entity";
import { PaymentMethod, PaymentStatus } from "@/modules/orders/enums/order-status.enum";
import { Refund } from "./refund.entity";

@Entity("payments")
export class Payment extends BaseEntity {
  @Index("idx_payments_order_id")
  @Column({ name: "order_id", type: "uuid" })
  orderId!: string;

  @Column({ type: "varchar", length: 20 })
  provider!: PaymentMethod;

  @Index("idx_payments_provider_transaction_id")
  @Column({ name: "provider_transaction_id", type: "varchar", length: 150, nullable: true })
  providerTransactionId?: string | null;

  /** আমাদের নিজস্ব সিস্টেম-জেনারেটেড রেফারেন্স, গেটওয়েতে merchant invoice number হিসেবে পাঠানো হয় */
  @Index("idx_payments_merchant_invoice_no", { unique: true })
  @Column({ name: "merchant_invoice_no", type: "varchar", length: 50, unique: true })
  merchantInvoiceNo!: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  amount!: string;

  @Column({ type: "varchar", length: 3, default: "BDT" })
  currency!: string;

  @Index("idx_payments_status")
  @Column({ type: "varchar", length: 20, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  /** গেটওয়ে থেকে পাওয়া raw response — ডিবাগিং/অডিটের জন্য, ডাটাবেজ স্কিমা ডকুমেন্টের নীতি অনুযায়ী শুধু এখানেই JSONB */
  @Column({ name: "gateway_response", type: "jsonb", nullable: true })
  gatewayResponse?: Record<string, unknown> | null;

  @Column({ name: "failure_reason", type: "text", nullable: true })
  failureReason?: string | null;

  @Column({ name: "initiated_at", type: "timestamptz" })
  initiatedAt!: Date;

  @Column({ name: "completed_at", type: "timestamptz", nullable: true })
  completedAt?: Date | null;

  @ManyToOne(() => Order, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "order_id" })
  order!: Order;

  @OneToMany(() => Refund, (refund) => refund.payment)
  refunds?: Refund[];
}
