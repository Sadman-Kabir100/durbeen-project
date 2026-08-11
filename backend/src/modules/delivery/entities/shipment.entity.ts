import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "@/common/entities/base.entity";
import { ShipmentStatus, CourierProvider } from "../enums/delivery-status.enum";
import { ShipmentTrackingEvent } from "./shipment-tracking-event.entity";

@Entity("shipments")
export class Shipment extends BaseEntity {
  @Index("idx_shipments_order_id", { unique: true })
  @Column({ name: "order_id", type: "uuid", unique: true })
  orderId!: string;

  @Column({ name: "courier_provider", type: "varchar", length: 30 })
  courierProvider!: CourierProvider;

  @Column({ name: "courier_name", type: "varchar", length: 100, nullable: true })
  courierName?: string | null;

  @Index("idx_shipments_tracking_number")
  @Column({ name: "tracking_number", type: "varchar", length: 100, nullable: true })
  trackingNumber?: string | null;

  @Column({ type: "varchar", length: 30, default: ShipmentStatus.PENDING })
  status!: ShipmentStatus;

  @Column({ name: "estimated_delivery_at", type: "timestamptz", nullable: true })
  estimatedDeliveryAt?: Date | null;

  @Column({ name: "actual_delivery_at", type: "timestamptz", nullable: true })
  actualDeliveryAt?: Date | null;

  /** কুরিয়ার প্রোভাইডারের রেসপন্স/মেটাডেটা (label URL, cod amount confirmation ইত্যাদি) */
  @Column({ name: "courier_metadata", type: "jsonb", nullable: true })
  courierMetadata?: Record<string, unknown> | null;

  @OneToMany(() => ShipmentTrackingEvent, (event) => event.shipment)
  trackingEvents?: ShipmentTrackingEvent[];
}
