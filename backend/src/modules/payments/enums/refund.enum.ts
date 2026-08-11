export enum RefundStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REJECTED = "rejected",
}

export enum RefundReason {
  ORDER_CANCELLED = "order_cancelled",
  PRODUCT_DEFECTIVE = "product_defective",
  WRONG_ITEM_DELIVERED = "wrong_item_delivered",
  DELIVERY_FAILED = "delivery_failed",
  CUSTOMER_REQUEST = "customer_request",
  DUPLICATE_PAYMENT = "duplicate_payment",
  OTHER = "other",
}
