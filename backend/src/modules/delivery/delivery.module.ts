import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersModule } from "@/modules/orders/orders.module";
import { Shipment } from "./entities/shipment.entity";
import { ShipmentTrackingEvent } from "./entities/shipment-tracking-event.entity";
import { DeliveryService } from "./services/delivery.service";
import { DeliveryController } from "./controllers/delivery.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, ShipmentTrackingEvent]), OrdersModule],
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
