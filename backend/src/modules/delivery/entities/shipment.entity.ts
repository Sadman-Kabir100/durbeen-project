import "dotenv/config";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

const dateType = process.env.DB_TYPE === "sqlite" ? "datetime" : "timestamptz";
const jsonType = process.env.DB_TYPE === "sqlite" ? "simple-json" : "jsonb";

@Entity("shipments")
export class Shipment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index("idx_shipments_order_id")
  @Column({ name: "order_id", type: "uuid", unique: true })
  orderId!: string;

  @Column({ name: "courier_provider", type: "varchar", length: 30 })
  courierProvider!: string;

  @Column({ name: "courier_name", type: "varchar", length: 100, nullable: true })
  courierName?: string | null;

  @Index("idx_shipments_tracking_number")
  @Column({ name: "tracking_number", type: "varchar", length: 100, nullable: true })
  trackingNumber?: string | null;

  @Column({ type: "varchar", length: 30, default: "pending" })
  status!: string;

  @Column({ name: "estimated_delivery_at", type: dateType as any, nullable: true })
  estimatedDeliveryAt?: Date | null;

  @Column({ name: "actual_delivery_at", type: dateType as any, nullable: true })
  actualDeliveryAt?: Date | null;

  @Column({ name: "courier_metadata", type: jsonType as any, nullable: true })
  courierMetadata?: object | null;
}
