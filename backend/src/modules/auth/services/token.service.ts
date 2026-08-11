import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { AuthTokens, JwtPayload, JwtRefreshPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async generateTokenPair(payload: JwtPayload): Promise<AuthTokens> {
    const accessSecret = this.configService.get<string>("jwt.accessSecret")!;
    const accessExpiresIn = this.configService.get<string>("jwt.accessExpiresIn")!;
    const refreshSecret = this.configService.get<string>("jwt.refreshSecret")!;
    const refreshExpiresIn = this.configService.get<string>("jwt.refreshExpiresIn")!;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: accessSecret, expiresIn: accessExpiresIn }),
      this.jwtService.signAsync(
        { ...payload, tokenType: "refresh" } satisfies JwtRefreshPayload,
        { secret: refreshSecret, expiresIn: refreshExpiresIn }
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiresInSeconds(accessExpiresIn),
    };
  }

  async verifyRefreshToken(token: string): Promise<JwtRefreshPayload> {
    const refreshSecret = this.configService.get<string>("jwt.refreshSecret")!;
    try {
      const payload = await this.jwtService.verifyAsync<JwtRefreshPayload>(token, {
        secret: refreshSecret,
      });
      if (payload.tokenType !== "refresh") {
        throw new UnauthorizedException("অবৈধ রিফ্রেশ টোকেন");
      }
      return payload;
    } catch {
      throw new UnauthorizedException("রিফ্রেশ টোকেনের মেয়াদ শেষ হয়ে গেছে অথবা অবৈধ, আবার লগইন করুন");
    }
  }

  /** "15m" / "30d" জাতীয় স্ট্রিং থেকে সেকেন্ড বের করে — access token expiry response-এ পাঠাতে */
  private parseExpiresInSeconds(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) return 900; // fallback ১৫ মিনিট
    const [, amountStr, unit] = match;
    const amount = parseInt(amountStr!, 10);
    const unitToSeconds: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return amount * (unitToSeconds[unit!] ?? 1);
  }
}
