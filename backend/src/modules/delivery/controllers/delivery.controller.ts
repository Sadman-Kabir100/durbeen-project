import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { DeliveryService } from "../services/delivery.service";
import { CreateShipmentDto } from "../dto/create-shipment.dto";
import { UpdateDeliveryStatusDto } from "../dto/update-delivery-status.dto";
import { Roles } from "@/modules/auth/decorators/roles.decorator";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import type { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";

@Controller()
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post("admin/shipments")
  @Roles("admin", "staff", "warehouse")
  async create(@Body() dto: CreateShipmentDto, @CurrentUser() user: JwtPayload) {
    return this.deliveryService.createShipment(dto, `admin:${user.sub}`);
  }

  /**
   * অ্যাডমিন প্যানেল থেকে ম্যানুয়াল স্ট্যাটাস আপডেট এবং কুরিয়ার ওয়েবহুক (যদি ভবিষ্যতে
   * Pathao/Steadfast API ইন্টিগ্রেট হয়) — উভয়ের জন্যই একই এন্ডপয়েন্ট, changedBy ফিল্ডে
   * উৎস আলাদা করা হয় (এই মুহূর্তে শুধু admin/staff/warehouse রোল-গার্ডেড, ভবিষ্যতে
   * কুরিয়ার-webhook-এর জন্য আলাদা @Public() + HMAC-ভেরিফাইড রুট যোগ হতে পারে,
   * ঠিক যেমন PaymentsController-এ callback রুট করা হয়েছে)।
   */
  @Patch("admin/orders/:orderId/delivery-status")
  @Roles("admin", "staff", "warehouse")
  async updateStatus(
    @Param("orderId") orderId: string,
    @Body() dto: UpdateDeliveryStatusDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.deliveryService.updateStatus(orderId, dto, `admin:${user.sub}`);
  }

  /** কাস্টমার-facing — নিজের অর্ডারের ডেলিভারি ট্র্যাকিং দেখতে (ownership-check এখানে যোগ করা হয়নি,
   * কারণ OrdersController.getTracking() ইতিমধ্যে একই ধরনের ownership-check করে;
   * ভবিষ্যতে এই এন্ডপয়েন্টেও একই গার্ড যোগ করা প্রয়োজন — TODO চিহ্নিত রইল */
  @Get("orders/:orderId/shipment-tracking")
  async getTracking(@Param("orderId") orderId: string) {
    const shipment = await this.deliveryService.findByOrderId(orderId);
    const timeline = await this.deliveryService.getTrackingTimeline(orderId);
    return {
      shipmentId: shipment.id,
      courierProvider: shipment.courierProvider,
      trackingNumber: shipment.trackingNumber,
      currentStatus: shipment.status,
      estimatedDeliveryAt: shipment.estimatedDeliveryAt,
      actualDeliveryAt: shipment.actualDeliveryAt,
      timeline: timeline.map((event) => ({
        status: event.status,
        location: event.location,
        note: event.note,
        occurredAt: event.occurredAt,
      })),
    };
  }
}
