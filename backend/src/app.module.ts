import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import appConfig from "./config/app.config";
import databaseConfig from "./config/database.config";
import jwtConfig from "./config/jwt.config";
import otpConfig from "./config/otp.config";
import paymentConfig from "./config/payment.config";
import redisConfig from "./config/redis.config";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { DeliveryModule } from "./modules/delivery/delivery.module";
import { ProductsModule } from "./modules/products/products.module";
import { HealthModule } from "./modules/health/health.module";
import { JwtAuthGuard } from "./modules/auth/guards/jwt-auth.guard";
import { RolesGuard } from "./modules/auth/guards/roles.guard";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, otpConfig, paymentConfig, redisConfig],
      envFilePath: [".env"],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get<TypeOrmModuleOptions>("database")!,
    }),
    UsersModule,
    AuthModule,
    OrdersModule,
    PaymentsModule,
    DeliveryModule,
    ProductsModule,
    HealthModule,
    // পরবর্তী মাইলস্টোনে যোগ হবে: ProductModule, CategoryModule, InventoryModule,
    // CartModule, ReviewModule, CouponModule, NotificationModule (পূর্ণাঙ্গ), InvoiceModule, SearchModule
  ],
  providers: [
    // গ্লোবাল গার্ড — ডিফল্টভাবে প্রতিটি রুট প্রোটেক্টেড (secure-by-default),
    // @Public() দিয়ে explicit opt-out করতে হয়। JwtAuthGuard আগে, RolesGuard পরে —
    // কারণ RolesGuard-এর request.user দরকার, যা JwtAuthGuard populate করে।
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
