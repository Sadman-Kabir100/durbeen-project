export enum OrderStatus {
  PLACED = "placed",
  AWAITING_PAYMENT = "awaiting_payment",
  PAYMENT_FAILED = "payment_failed",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPMENT_CREATED = "shipment_created",
  IN_TRANSIT = "in_transit",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
  DELIVERY_FAILED = "delivery_failed",
  CANCELLED = "cancelled",
  REFUND_INITIATED = "refund_initiated",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  SSLCOMMERZ = "sslcommerz",
  BKASH = "bkash",
  NAGAD = "nagad",
  ROCKET = "rocket",
  COD = "cod",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SUCCESS = "success",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
}

/**
 * কোন স্ট্যাটাস থেকে কোন স্ট্যাটাসে যাওয়া বৈধ — আগের stateDiagram-এর কোডিফাইড সংস্করণ।
 * OrdersService.transitionStatus() এই ম্যাপ যাচাই করে অবৈধ ট্রানজিশন প্রতিরোধ করবে
 * (যেমন "delivered" থেকে সরাসরি "processing"-এ ফিরে যাওয়া আটকাতে)।
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PLACED]: [OrderStatus.AWAITING_PAYMENT, OrderStatus.CONFIRMED],
  [OrderStatus.AWAITING_PAYMENT]: [OrderStatus.CONFIRMED, OrderStatus.PAYMENT_FAILED],
  [OrderStatus.PAYMENT_FAILED]: [OrderStatus.AWAITING_PAYMENT, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPMENT_CREATED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPMENT_CREATED]: [OrderStatus.IN_TRANSIT],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.OUT_FOR_DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.DELIVERY_FAILED],
  [OrderStatus.DELIVERY_FAILED]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [OrderStatus.REFUND_INITIATED],
  [OrderStatus.REFUND_INITIATED]: [OrderStatus.REFUNDED],
  [OrderStatus.REFUNDED]: [],
};
