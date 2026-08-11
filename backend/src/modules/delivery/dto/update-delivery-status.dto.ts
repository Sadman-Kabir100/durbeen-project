import { IsEnum, IsOptional, IsString } from "class-validator";
import { ShipmentStatus } from "../enums/delivery-status.enum";

export class UpdateDeliveryStatusDto {
  @IsEnum(ShipmentStatus)
  status!: ShipmentStatus;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
