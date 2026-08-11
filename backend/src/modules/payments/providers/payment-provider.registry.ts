import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PaymentMethod } from "@/modules/orders/enums/order-status.enum";
import type { PaymentProvider } from "../interfaces/payment-provider.interface";
import { SslcommerzProvider } from "./sslcommerz.provider";
import { BkashProvider } from "./bkash.provider";
import { NagadProvider } from "./nagad.provider";
import { RocketProvider } from "./rocket.provider";
import { CashOnDeliveryProvider } from "./cash-on-delivery.provider";

/**
 * PaymentMethod enum → PaymentProvider ইনস্ট্যান্স ম্যাপ করার একমাত্র জায়গা।
 * PaymentService এই রেজিস্ট্রির উপর নির্ভর করে, কোনো নির্দিষ্ট provider ক্লাস সরাসরি
 * import/instantiate করে না — নতুন গেটওয়ে যোগ করতে শুধু এখানে একটা লাইন যোগ করলেই হবে।
 */
@Injectable()
export class PaymentProviderRegistry {
  private readonly providers: Map<PaymentMethod, PaymentProvider>;

  constructor(
    sslcommerz: SslcommerzProvider,
    bkash: BkashProvider,
    nagad: NagadProvider,
    rocket: RocketProvider,
    cod: CashOnDeliveryProvider
  ) {
    this.providers = new Map<PaymentMethod, PaymentProvider>([
      [PaymentMethod.SSLCOMMERZ, sslcommerz],
      [PaymentMethod.BKASH, bkash],
      [PaymentMethod.NAGAD, nagad],
      [PaymentMethod.ROCKET, rocket],
      [PaymentMethod.COD, cod],
    ]);
  }

  get(method: PaymentMethod): PaymentProvider {
    const provider = this.providers.get(method);
    if (!provider) {
      throw new InternalServerErrorException(`"${method}" এর জন্য কোনো পেমেন্ট প্রোভাইডার রেজিস্টার্ড নেই`);
    }
    return provider;
  }

  getByName(providerName: string): PaymentProvider {
    const match = Array.from(this.providers.values()).find((p) => p.providerName === providerName);
    if (!match) {
      throw new InternalServerErrorException(`"${providerName}" নামে কোনো পেমেন্ট প্রোভাইডার নেই`);
    }
    return match;
  }
}
