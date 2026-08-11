import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../constants/auth.constants";

/**
 * app.module.ts-এ APP_GUARD হিসেবে গ্লোবালি রেজিস্টার করা হবে, অর্থাৎ
 * ডিফল্টভাবে প্রতিটি এন্ডপয়েন্ট প্রোটেক্টেড — @Public() দিয়ে explicitly opt-out
 * করতে হয় (secure-by-default, বরং প্রতিটি রুটে আলাদা @UseGuards ভুলে যাওয়ার ঝুঁকি এড়ানো)।
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
