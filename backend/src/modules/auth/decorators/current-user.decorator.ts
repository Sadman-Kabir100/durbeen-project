import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { JwtPayload } from "../interfaces/jwt-payload.interface";

/**
 * ব্যবহার: findMyOrders(@CurrentUser() user: JwtPayload) — কন্ট্রোলারে
 * বারবার `req.user` ম্যানুয়ালি এক্সট্র্যাক্ট করার বদলে টাইপ-সেফভাবে ইনজেক্ট করতে।
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
