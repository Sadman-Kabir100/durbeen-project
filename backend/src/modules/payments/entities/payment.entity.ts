import "dotenv/config";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

const dateType = process.env.DB_TYPE === "sqlite" ? "datetime" : "timestamptz";
const jsonType = process.env.DB_TYPE === "sqlite" ? "simple-json" : "jsonb";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index("idx_payments_order_id")
  @Column({ name: "order_id", type: "uuid" })
  orderId!: string;

  @Column({ type: "varchar", length: 20 })
  provider!: string;

  @Index("idx_payments_provider_transaction_id")
  @Column({ name: "provider_transaction_id", type: "varchar", length: 150, nullable: true })
  providerTransactionId?: string | null;

  @Column({ name: "merchant_invoice_no", type: "varchar", length: 50, unique: true })
  merchantInvoiceNo!: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  amount!: string;

  @Column({ type: "varchar", length: 3, default: "BDT" })
  currency!: string;

  @Index("idx_payments_status")
  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: string;

  @Column({ name: "gateway_response", type: jsonType as any, nullable: true })
  gatewayResponse?: object | null;

  @Column({ name: "failure_reason", type: "text", nullable: true })
  failureReason?: string | null;

  @Column({ name: "initiated_at", type: dateType as any })
  initiatedAt!: Date;

  @Column({ name: "completed_at", type: dateType as any, nullable: true })
  completedAt?: Date | null;
}
