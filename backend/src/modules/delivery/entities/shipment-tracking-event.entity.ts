import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Shipment } from "./shipment.entity";
import { ShipmentStatus } from "../enums/delivery-status.enum";

/**
 * OrderStatusHistory (orders মডিউলে) হাই-লেভেল অর্ডার-স্ট্যাটাস ট্র্যাক করে,
 * আর এই টেবিল করে কুরিয়ারের বিস্তারিত লজিস্টিক ইভেন্ট (হাব-টু-হাব মুভমেন্ট,
 * ডেলিভারি-অ্যাটেম্পট নোট ইত্যাদি) — দুটো আলাদা গ্রানুলারিটির টাইমলাইন,
 * ইচ্ছাকৃতভাবে আলাদা টেবিলে রাখা হয়েছে যাতে অর্ডার-লেভেল ট্র্যাকিং সরল থাকে।
 */
@Entity("shipment_tracking_events")
export class ShipmentTrackingEvent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index("idx_shipment_tracking_events_shipment_id")
  @Column({ name: "shipment_id", type: "uuid" })
  shipmentId!: string;

  @Column({ type: "varchar", length: 30 })
  status!: ShipmentStatus;

  @Column({ type: "varchar", length: 150, nullable: true })
  location?: string | null;

  @Column({ type: "text", nullable: true })
  note?: string | null;

  /** "courier_webhook:pathao", "admin:<userId>" — কোন সোর্স থেকে ইভেন্ট এসেছে */
  @Column({ type: "varchar", length: 100 })
  source!: string;

  @CreateDateColumn({ name: "occurred_at", type: "timestamptz" })
  occurredAt!: Date;

  @ManyToOne(() => Shipment, (shipment) => shipment.trackingEvents, { onDelete: "CASCADE" })
  @JoinColumn({ name: "shipment_id" })
  shipment!: Shipment;
}
