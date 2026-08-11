import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("jwt.accessSecret")!,
    });
  }

  /**
   * এই মেথডের রিটার্ন ভ্যালু Nest স্বয়ংক্রিয়ভাবে `request.user`-এ বসিয়ে দেয়,
   * যা পরে @CurrentUser() decorator বা RolesGuard-এ ব্যবহৃত হয়।
   * এখানে ইচ্ছাকৃতভাবে DB কল করা হয়নি (শুধু JWT payload ভ্যালিডেট) — প্রতি
   * রিকোয়েস্টে DB hit এড়াতে, যেহেতু roles ইতিমধ্যে টোকেনে এমবেড করা আছে।
   */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
