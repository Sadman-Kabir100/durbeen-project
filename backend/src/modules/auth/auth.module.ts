import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "@/modules/users/users.module";
import { SMS_SENDER } from "@/modules/notifications/interfaces/sms-sender.interface";
import { ConsoleSmsService } from "@/modules/notifications/services/console-sms.service";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { OtpService } from "./services/otp.service";
import { TokenService } from "./services/token.service";
import { InMemoryOtpStore } from "./services/in-memory-otp.store";
import { OTP_STORE } from "./interfaces/otp-store.interface";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { OtpRateLimitMiddleware } from "./middleware/otp-rate-limit.middleware";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("jwt.accessSecret"),
        signOptions: { expiresIn: configService.get<string>("jwt.accessExpiresIn") },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    TokenService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    // OTP store ও SMS sender ইন্টারফেসের বিপরীতে বাইন্ড করা হয়েছে (DIP) —
    // প্রোডাকশনে শুধু এই দুটো লাইন বদলে RedisOtpStore/RealSmsGatewayService বসানো যাবে।
    { provide: OTP_STORE, useClass: InMemoryOtpStore },
    { provide: SMS_SENDER, useClass: ConsoleSmsService },
  ],
  exports: [AuthService, TokenService, JwtAuthGuard, RolesGuard],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(OtpRateLimitMiddleware)
      .forRoutes({ path: "auth/otp/request", method: RequestMethod.POST });
  }
}
