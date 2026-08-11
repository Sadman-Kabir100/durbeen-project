import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { OrderStatusHistory } from "./entities/order-status-history.entity";
import { OrdersService } from "./services/orders.service";
import { OrdersController } from "./controllers/orders.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, OrderStatusHistory])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
