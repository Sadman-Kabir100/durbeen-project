import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { CourierProvider } from "../enums/delivery-status.enum";

export class CreateShipmentDto {
  @IsUUID()
  orderId!: string;

  @IsEnum(CourierProvider)
  courierProvider!: CourierProvider;

  @IsOptional()
  @IsString()
  trackingNumber?: string;
}
