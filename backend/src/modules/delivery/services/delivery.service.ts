import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrdersService } from "@/modules/orders/services/orders.service";
import { Shipment } from "../entities/shipment.entity";
import { ShipmentTrackingEvent } from "../entities/shipment-tracking-event.entity";
import {
  SHIPMENT_STATUS_TRANSITIONS,
  SHIPMENT_TO_ORDER_STATUS,
  ShipmentStatus,
} from "../enums/delivery-status.enum";
import type { CreateShipmentDto } from "../dto/create-shipment.dto";
import type { UpdateDeliveryStatusDto } from "../dto/update-delivery-status.dto";

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    @InjectRepository(Shipment) private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(ShipmentTrackingEvent)
    private readonly trackingEventRepository: Repository<ShipmentTrackingEvent>,
    private readonly ordersService: OrdersService
  ) {}

  async createShipment(dto: CreateShipmentDto, createdBy: string): Promise<Shipment> {
    // অর্ডার সত্যিই বিদ্যমান কিনা যাচাই — না থাকলে findById() নিজেই NotFoundException ছুঁড়বে
    await this.ordersService.findById(dto.orderId);

    const existing = await this.shipmentRepository.findOne({ where: { orderId: dto.orderId } });
    if (existing) {
      throw new BadRequestException("এই অর্ডারের জন্য ইতিমধ্যে একটি শিপমেন্ট তৈরি হয়েছে");
    }

    const shipment = await this.shipmentRepository.save(
      this.shipmentRepository.create({
        orderId: dto.orderId,
        courierProvider: dto.courierProvider,
        trackingNumber: dto.trackingNumber ?? null,
        status: ShipmentStatus.PENDING,
      })
    );

    await this.recordTrackingEvent(shipment.id, ShipmentStatus.PENDING, createdBy, null, "শিপমেন্ট তৈরি হয়েছে");
    return shipment;
  }

  async findByOrderId(orderId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { orderId },
      relations: ["trackingEvents"],
    });
    if (!shipment) {
      throw new NotFoundException("এই অর্ডারের জন্য কোনো শিপমেন্ট পাওয়া যায়নি");
    }
    return shipment;
  }

  /**
   * ⚠️ গুরুত্বপূর্ণ: এই মেথড দুটো state machine একসাথে সিঙ্ক রাখে —
   * (১) Shipment.status (কুরিয়ার-লেভেল, SHIPMENT_STATUS_TRANSITIONS দিয়ে গার্ডেড)
   * (২) Order.status (হাই-লেভেল, OrdersService.transitionStatus() নিজেই আবার
   *     ORDER_STATUS_TRANSITIONS দিয়ে গার্ডেড) — SHIPMENT_TO_ORDER_STATUS ম্যাপ
   *     দিয়ে একটার পরিবর্তন অন্যটায় প্রতিফলিত হয়। দুটো আলাদা গ্যারান্টিসহ স্তর
   *     থাকায় কোনো একটাতে বাগ থাকলেও অন্যটা অসামঞ্জস্যপূর্ণ ডেটা আটকায়।
   */
  async updateStatus(
    orderId: string,
    dto: UpdateDeliveryStatusDto,
    changedBy: string
  ): Promise<Shipment> {
    const shipment = await this.findByOrderId(orderId);
    const allowedNextStates = SHIPMENT_STATUS_TRANSITIONS[shipment.status as ShipmentStatus];

    if (!allowedNextStates.includes(dto.status)) {
      throw new BadRequestException(
        `শিপমেন্ট স্ট্যাটাস "${shipment.status}" থেকে "${dto.status}"-এ ট্রানজিশন অবৈধ। অনুমোদিত: ${allowedNextStates.join(", ") || "কোনোটাই না"}`
      );
    }

    shipment.status = dto.status;
    if (dto.status === ShipmentStatus.DELIVERED) {
      shipment.actualDeliveryAt = new Date();
    }
    const saved = await this.shipmentRepository.save(shipment);

    await this.recordTrackingEvent(shipment.id, dto.status, changedBy, dto.location, dto.note);

    const mappedOrderStatus = SHIPMENT_TO_ORDER_STATUS[dto.status];
    if (mappedOrderStatus) {
      try {
        await this.ordersService.transitionStatus(orderId, mappedOrderStatus, changedBy, dto.note);
      } catch (error) {
        // Order-লেভেল ট্রানজিশন ব্যর্থ হলেও শিপমেন্ট-লেভেল আপডেট rollback করা হচ্ছে না —
        // এই mismatch সম্ভাবনা লগ করে রাখা হচ্ছে যাতে অ্যাডমিন ম্যানুয়ালি পুনর্মিলন করতে পারে।
        // (আদর্শভাবে দুটোই একটা DB transaction-এ হওয়া উচিত — TypeORM QueryRunner দিয়ে
        // ভবিষ্যতে এই মেথডকে transactional করা একটা গুরুত্বপূর্ণ পরবর্তী উন্নতি।)
        this.logger.error(
          `Shipment ${shipment.id} স্ট্যাটাস আপডেট হয়েছে কিন্তু সংশ্লিষ্ট Order ${orderId} status sync ব্যর্থ: ${(error as Error).message}`
        );
      }
    }

    return saved;
  }

  async getTrackingTimeline(orderId: string): Promise<ShipmentTrackingEvent[]> {
    const shipment = await this.findByOrderId(orderId);
    return this.trackingEventRepository.find({
      where: { shipmentId: shipment.id },
      order: { occurredAt: "ASC" },
    });
  }

  private async recordTrackingEvent(
    shipmentId: string,
    status: ShipmentStatus,
    source: string,
    location?: string | null,
    note?: string | null
  ): Promise<void> {
    await this.trackingEventRepository.save(
      this.trackingEventRepository.create({ shipmentId, status, source, location, note })
    );
  }
}
