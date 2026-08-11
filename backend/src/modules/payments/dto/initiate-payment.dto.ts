import { IsEnum, IsUUID } from "class-validator";
import { PaymentMethod } from "@/modules/orders/enums/order-status.enum";

export class InitiatePaymentDto {
  @IsUUID()
  orderId!: string;

  @IsEnum(PaymentMethod, { message: "সাপোর্টেড পেমেন্ট মেথড: sslcommerz, bkash, nagad, rocket, cod" })
  method!: PaymentMethod;
}
