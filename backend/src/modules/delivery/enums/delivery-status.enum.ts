import { OrderStatus } from "@/modules/orders/enums/order-status.enum";

export enum ShipmentStatus {
  PENDING = "pending",
  PICKED_UP = "picked_up",
  IN_TRANSIT = "in_transit",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
  FAILED_ATTEMPT = "failed_attempt",
  RETURNED_TO_SENDER = "returned_to_sender",
}

export const SHIPMENT_STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  [ShipmentStatus.PENDING]: [ShipmentStatus.PICKED_UP],
  [ShipmentStatus.PICKED_UP]: [ShipmentStatus.IN_TRANSIT],
  [ShipmentStatus.IN_TRANSIT]: [ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.RETURNED_TO_SENDER],
  [ShipmentStatus.OUT_FOR_DELIVERY]: [ShipmentStatus.DELIVERED, ShipmentStatus.FAILED_ATTEMPT],
  [ShipmentStatus.FAILED_ATTEMPT]: [ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.RETURNED_TO_SENDER],
  [ShipmentStatus.DELIVERED]: [],
  [ShipmentStatus.RETURNED_TO_SENDER]: [],
};

/** ShipmentStatus পরিবর্তন হলে সংশ্লিষ্ট Order.status কোথায় যাবে — দুই স্টেট মেশিন সিঙ্ক রাখতে */
export const SHIPMENT_TO_ORDER_STATUS: Partial<Record<ShipmentStatus, OrderStatus>> = {
  [ShipmentStatus.PICKED_UP]: OrderStatus.SHIPMENT_CREATED,
  [ShipmentStatus.IN_TRANSIT]: OrderStatus.IN_TRANSIT,
  [ShipmentStatus.OUT_FOR_DELIVERY]: OrderStatus.OUT_FOR_DELIVERY,
  [ShipmentStatus.DELIVERED]: OrderStatus.DELIVERED,
  [ShipmentStatus.FAILED_ATTEMPT]: OrderStatus.DELIVERY_FAILED,
};

export enum CourierProvider {
  PATHAO = "pathao",
  STEADFAST = "steadfast",
  REDX = "redx",
  ECOURIER = "ecourier",
  IN_HOUSE = "in_house",
}
