export class InitiatePaymentResponseDto {
  paymentId!: string;
  /** null মানে redirect লাগবে না (COD) */
  redirectUrl!: string | null;
  status!: string;
}
