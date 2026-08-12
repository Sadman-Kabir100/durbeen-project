import "dotenv/config";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

const dateType = process.env.DB_TYPE === "sqlite" ? "datetime" : "timestamptz";

@Entity("shipment_tracking_events")
export class ShipmentTrackingEvent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index("idx_shipment_tracking_events_shipment_id")
  @Column({ name: "shipment_id", type: "uuid" })
  shipmentId!: string;

  @Column({ type: "varchar", length: 30 })
  status!: string;

  @Column({ type: "varchar", length: 150, nullable: true })
  location?: string | null;

  @Column({ type: "text", nullable: true })
  note?: string | null;

  @Column({ type: "varchar", length: 100 })
  source!: string;

  @Column({ name: "occurred_at", type: dateType as any })
  occurredAt!: Date;
}
