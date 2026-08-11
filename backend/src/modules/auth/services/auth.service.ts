import { BadRequestException, Injectable } from "@nestjs/common";
import { UsersService } from "@/modules/users/services/users.service";
import { OtpService } from "./otp.service";
import { TokenService } from "./token.service";
import type { AuthTokens, JwtPayload } from "../interfaces/jwt-payload.interface";
import { AuthResponseDto, OtpRequestResponseDto, UserSummaryDto } from "../dto/auth-response.dto";
import type { VerifyOtpDto } from "../dto/verify-otp.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService
  ) {}

  async requestOtp(phone: string): Promise<OtpRequestResponseDto> {
    const { expiresInSeconds } = await this.otpService.generateAndSend(phone);
    return {
      message: "OTP পাঠানো হয়েছে, SMS চেক করুন",
      expiresInSeconds,
    };
  }

  async verifyOtpAndLogin(dto: VerifyOtpDto): Promise<{ tokens: AuthTokens; response: AuthResponseDto }> {
    await this.otpService.verify(dto.phone, dto.otp);

    let user = await this.usersService.findByPhone(dto.phone);

    if (!user) {
      // প্রথমবার লগইন — গেস্ট থেকে রেজিস্টার্ড ইউজারে রূপান্তর (guest cart merge
      // ভবিষ্যতে Cart Management মডিউলে এই একই পয়েন্টে হুক করা হবে)
      if (!dto.name) {
        throw new BadRequestException("নতুন অ্যাকাউন্টের জন্য নাম আবশ্যক");
      }
      user = await this.usersService.createFromPhone(dto.phone, dto.name);
    } else {
      await this.usersService.updateLastLogin(user.id);
    }

    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      roles: user.userRoles?.map((ur) => ur.role.slug) ?? [],
    };

    const tokens = await this.tokenService.generateTokenPair(payload);

    const response = new AuthResponseDto();
    response.accessToken = tokens.accessToken;
    response.expiresIn = tokens.expiresIn;
    response.user = UserSummaryDto.fromEntity(user);

    return { tokens, response };
  }

  async refreshTokens(refreshToken: string): Promise<{ tokens: AuthTokens; response: AuthResponseDto }> {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new BadRequestException("ইউজার পাওয়া যায়নি");
    }

    const newPayload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      roles: user.userRoles?.map((ur) => ur.role.slug) ?? [],
    };

    const tokens = await this.tokenService.generateTokenPair(newPayload);

    const response = new AuthResponseDto();
    response.accessToken = tokens.accessToken;
    response.expiresIn = tokens.expiresIn;
    response.user = UserSummaryDto.fromEntity(user);

    return { tokens, response };
  }
}
