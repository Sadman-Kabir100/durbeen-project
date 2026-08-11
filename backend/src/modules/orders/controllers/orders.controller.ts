import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { OrdersService } from "../services/orders.service";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import type { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";

/**
 * এই কন্ট্রোলারটি ন্যূনতম — শুধু "Order Tracking" ফিচার সাপোর্ট করতে (আগের
 * ডিজাইন সিস্টেম ডকুমেন্টের কাস্টমার-facing "Dashboard → ActiveOrderTrackerCard" ও
 * "User Profile → OrderHistory → বিস্তারিত দেখুন" এখান থেকেই ডেটা পাবে)। পূর্ণাঙ্গ
 * অর্ডার CRUD (list/cancel/cart→order) ভবিষ্যতের "Order Management" ধাপে আসবে।
 */
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(":id")
  async findOne(@Param("id") id: string, @CurrentUser() user: JwtPayload) {
    const order = await this.ordersService.findById(id);
    this.assertOwnership(order.userId, user);
    return order;
  }

  /** স্ট্যাটাস-পরিবর্তনের সম্পূর্ণ টাইমলাইন — ডিজাইন ডকুমেন্টের OrderProgressStepper-এর ডেটা সোর্স */
  @Get(":id/tracking")
  async getTracking(@Param("id") id: string, @CurrentUser() user: JwtPayload) {
    const order = await this.ordersService.findById(id);
    this.assertOwnership(order.userId, user);

    const timeline = await this.ordersService.getStatusTimeline(id);
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      timeline: timeline.map((event) => ({
        fromStatus: event.fromStatus,
        toStatus: event.toStatus,
        note: event.note,
        changedAt: event.changedAt,
      })),
    };
  }

  /**
   * TODO (Order Management ধাপে): এই ownership-check এখন খুবই সরল (শুধু userId মেলে
   * কিনা)। admin/staff রোলের জন্য বাইপাস (যেমন @Roles গার্ড দিয়ে) তখন যোগ হবে,
   * এখন শুধু owner নিজের অর্ডার দেখতে পারবে।
   */
  private assertOwnership(orderUserId: string, user: JwtPayload): void {
    if (orderUserId !== user.sub) {
      throw new NotFoundException("অর্ডার পাওয়া যায়নি");
    }
  }
}
