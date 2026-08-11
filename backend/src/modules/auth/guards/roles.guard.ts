import { ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../constants/auth.constants";
import type { JwtPayload } from "../interfaces/jwt-payload.interface";

/**
 * JwtAuthGuard-এর পরে চলে (request.user ইতিমধ্যে populate করা থাকতে হবে)।
 * পরের মডিউলগুলোতে ব্যবহার: @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin')
 */
@Injectable()
export class RolesGuard {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload | undefined = request.user;

    const hasRole = !!user?.roles?.some((role) => requiredRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException("এই অ্যাকশনের জন্য প্রয়োজনীয় অনুমতি নেই");
    }

    return true;
  }
}
