import "dotenv/config";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

const dateType = process.env.DB_TYPE === "sqlite" ? "datetime" : "timestamptz";
const jsonType = process.env.DB_TYPE === "sqlite" ? "simple-json" : "jsonb";

@Entity("refunds")
export class Refund {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index("idx_refunds_payment_id")
  @Column({ name: "payment_id", type: "uuid" })
  paymentId!: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  amount!: string;

  @Column({ type: "varchar", length: 30 })
  reason!: string;

  @Column({ name: "reason_note", type: "text", nullable: true })
  reasonNote?: string | null;

  @Index("idx_refunds_status")
  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: string;

  @Column({ name: "provider_refund_id", type: "varchar", length: 150, nullable: true })
  providerRefundId?: string | null;

  @Column({ name: "requested_by", type: "varchar", length: 100 })
  requestedBy!: string;

  @Column({ name: "gateway_response", type: jsonType as any, nullable: true })
  gatewayResponse?: object | null;

  @Column({ name: "requested_at", type: dateType as any })
  requestedAt!: Date;

  @Column({ name: "completed_at", type: dateType as any, nullable: true })
  completedAt?: Date | null;
}
