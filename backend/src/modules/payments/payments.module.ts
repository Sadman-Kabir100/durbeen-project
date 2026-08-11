import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersModule } from "@/modules/orders/orders.module";
import { Payment } from "./entities/payment.entity";
import { Refund } from "./entities/refund.entity";
import { PaymentsService } from "./services/payments.service";
import { PaymentsController } from "./controllers/payments.controller";
import { PaymentProviderRegistry } from "./providers/payment-provider.registry";
import { SslcommerzProvider } from "./providers/sslcommerz.provider";
import { BkashProvider } from "./providers/bkash.provider";
import { NagadProvider } from "./providers/nagad.provider";
import { RocketProvider } from "./providers/rocket.provider";
import { CashOnDeliveryProvider } from "./providers/cash-on-delivery.provider";

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Refund]), OrdersModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentProviderRegistry,
    SslcommerzProvider,
    BkashProvider,
    NagadProvider,
    RocketProvider,
    CashOnDeliveryProvider,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
