import { IsEnum, IsNumberString, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { RefundReason } from "../enums/refund.enum";

export class RefundRequestDto {
  @IsUUID()
  paymentId!: string;

  /**
   * স্ট্রিং হিসেবে রাখা হয়েছে ইচ্ছাকৃতভাবে — ফ্লোটিং পয়েন্ট precision ইস্যু এড়াতে
   * (আর্থিক মান কখনো JS number হিসেবে পার্স করা উচিত না, decimal.js/big.js দিয়ে
   * সার্ভিস-লেয়ারে হ্যান্ডেল হবে)।
   */
  @IsNumberString({}, { message: "amount একটি বৈধ সংখ্যা হতে হবে" })
  amount!: string;

  @IsEnum(RefundReason)
  reason!: RefundReason;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reasonNote?: string;
}
