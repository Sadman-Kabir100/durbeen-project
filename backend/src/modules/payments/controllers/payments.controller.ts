import { Body, Controller, HttpCode, HttpStatus, Param, Post, Query, Req } from "@nestjs/common";
import type { Request } from "express";
import { PaymentsService } from "../services/payments.service";
import { InitiatePaymentDto } from "../dto/initiate-payment.dto";
import { InitiatePaymentResponseDto } from "../dto/initiate-payment-response.dto";
import { RefundRequestDto } from "../dto/refund-request.dto";
import { Public } from "@/modules/auth/decorators/public.decorator";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { Roles } from "@/modules/auth/decorators/roles.decorator";
import type { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("initiate")
  async initiate(
    @Body() dto: InitiatePaymentDto,
    @CurrentUser() _user: JwtPayload
  ): Promise<InitiatePaymentResponseDto> {
    // নোট: এখানে dto.orderId টা @CurrentUser()-এর মালিকানার অর্ডার কিনা যাচাই করা উচিত —
    // সেই ownership-check OrdersService-এর পূর্ণাঙ্গ সংস্করণে (ভবিষ্যতের Order Management
    // ধাপে) যোগ হবে, এই মুহূর্তে ন্যূনতম ফাউন্ডেশনে নেই।
    return this.paymentsService.initiatePayment(dto.orderId, dto.method);
  }

  /**
   * ⚠️ প্রতিটা গেটওয়ে ভিন্ন ভিন্ন URL কনভেনশনে callback পাঠায় (কিছু GET query দিয়ে,
   * কিছু POST form-body দিয়ে) — তাই এখানে req থেকে query ও body উভয়ই merge করে
   * PaymentsService.handleWebhook()-এ পাঠানো হচ্ছে, যাতে যেভাবেই আসুক ধরা পড়ে।
   * @Public() কারণ গেটওয়ে সার্ভার আমাদের JWT পাঠাবে না — নিরাপত্তা আসছে
   * provider.verifySignature() থেকে, যা PaymentsService.handleWebhook()-এর ভেতরে হয়।
   */
  @Public()
  @Post("callback/:provider")
  @HttpCode(HttpStatus.OK)
  async callback(
    @Param("provider") providerName: string,
    @Body() body: Record<string, unknown>,
    @Query() query: Record<string, unknown>,
    @Req() req: Request
  ): Promise<{ received: boolean }> {
    const payload = { ...query, ...body };
    const headers = req.headers as Record<string, string>;
    return this.paymentsService.handleWebhook(providerName, payload, headers);
  }

  @Post("refund")
  @Roles("admin", "staff")
  async refund(@Body() dto: RefundRequestDto, @CurrentUser() user: JwtPayload) {
    return this.paymentsService.requestRefund(
      dto.paymentId,
      dto.amount,
      dto.reason,
      `admin:${user.sub}`,
      dto.reasonNote
    );
  }

  @Post("refund/:id/complete-manually")
  @Roles("admin", "staff")
  async completeRefundManually(@Param("id") refundId: string, @CurrentUser() user: JwtPayload) {
    return this.paymentsService.markRefundCompletedManually(refundId, user.sub);
  }
}
