import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "../entities/order.entity";
import { OrderStatusHistory } from "../entities/order-status-history.entity";
import { ORDER_STATUS_TRANSITIONS, OrderStatus } from "../enums/order-status.enum";

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderStatusHistory)
    private readonly statusHistoryRepository: Repository<OrderStatusHistory>
  ) {}

  async findById(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ["items"] });
    if (!order) {
      throw new NotFoundException("অর্ডার পাওয়া যায়নি");
    }
    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { orderNumber }, relations: ["items"] });
    if (!order) {
      throw new NotFoundException("অর্ডার পাওয়া যায়নি");
    }
    return order;
  }

  /**
   * ⚠️ গুরুত্বপূর্ণ: এটাই একমাত্র জায়গা যেখান থেকে অর্ডারের status পরিবর্তন করা উচিত —
   * Payment/Delivery মডিউল সরাসরি `order.status = X; save()` না করে সবসময় এই মেথড কল করবে।
   * এটা দুটো জিনিস নিশ্চিত করে: (১) ORDER_STATUS_TRANSITIONS ম্যাপ অনুযায়ী শুধু বৈধ
   * ট্রানজিশন হয়, (২) প্রতিটা পরিবর্তন order_status_history-তে audit হয় (Order Tracking-এর
   * ভিত্তি)। এই দুই গ্যারান্টি bypass হয়ে গেলে ট্র্যাকিং টাইমলাইন ও স্ট্যাটাস উভয়ই অসামঞ্জস্যপূর্ণ হয়ে যাবে।
   */
  async transitionStatus(
    orderId: string,
    toStatus: OrderStatus,
    changedBy: string,
    note?: string
  ): Promise<Order> {
    const order = await this.findById(orderId);
    const allowedNextStates = ORDER_STATUS_TRANSITIONS[order.status];

    if (!allowedNextStates.includes(toStatus)) {
      throw new BadRequestException(
        `"${order.status}" থেকে "${toStatus}"-এ ট্রানজিশন অবৈধ। অনুমোদিত: ${allowedNextStates.join(", ") || "কোনোটাই না (ফাইনাল স্টেট)"}`
      );
    }

    const fromStatus = order.status;
    order.status = toStatus;
    const saved = await this.orderRepository.save(order);

    await this.statusHistoryRepository.save(
      this.statusHistoryRepository.create({
        orderId,
        fromStatus,
        toStatus,
        changedBy,
        note,
      })
    );

    this.logger.log(`অর্ডার ${order.orderNumber}: ${fromStatus} → ${toStatus} (${changedBy})`);
    return saved;
  }

  async getStatusTimeline(orderId: string): Promise<OrderStatusHistory[]> {
    return this.statusHistoryRepository.find({
      where: { orderId },
      order: { changedAt: "ASC" },
    });
  }

  async updatePaymentStatus(orderId: string, paymentStatus: Order["paymentStatus"]): Promise<void> {
    await this.orderRepository.update({ id: orderId }, { paymentStatus });
  }
}
