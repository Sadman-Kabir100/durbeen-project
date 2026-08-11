import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "@/common/entities/base.entity";
import { Payment } from "./payment.entity";
import { RefundReason, RefundStatus } from "../enums/refund.enum";

@Entity("refunds")
export class Refund extends BaseEntity {
  @Index("idx_refunds_payment_id")
  @Column({ name: "payment_id", type: "uuid" })
  paymentId!: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  amount!: string;

  @Column({ type: "varchar", length: 30 })
  reason!: RefundReason;

  @Column({ name: "reason_note", type: "text", nullable: true })
  reasonNote?: string | null;

  @Index("idx_refunds_status")
  @Column({ type: "varchar", length: 20, default: RefundStatus.PENDING })
  status!: RefundStatus;

  @Column({ name: "provider_refund_id", type: "varchar", length: 150, nullable: true })
  providerRefundId?: string | null;

  @Column({ name: "requested_by", type: "varchar", length: 100 })
  requestedBy!: string; // "customer:<userId>" | "admin:<userId>" | "system:auto"

  @Column({ name: "gateway_response", type: "jsonb", nullable: true })
  gatewayResponse?: Record<string, unknown> | null;

  @Column({ name: "requested_at", type: "timestamptz" })
  requestedAt!: Date;

  @Column({ name: "completed_at", type: "timestamptz", nullable: true })
  completedAt?: Date | null;

  @ManyToOne(() => Payment, (payment) => payment.refunds, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "payment_id" })
  payment!: Payment;
}
