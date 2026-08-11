import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { RequestOtpDto } from "../dto/request-otp.dto";
import { VerifyOtpDto } from "../dto/verify-otp.dto";
import { RefreshTokenDto } from "../dto/refresh-token.dto";
import { AuthResponseDto, OtpRequestResponseDto } from "../dto/auth-response.dto";
import { Public } from "../decorators/public.decorator";
import { CurrentUser } from "../decorators/current-user.decorator";
import type { JwtPayload } from "../interfaces/jwt-payload.interface";
import { REFRESH_TOKEN_COOKIE_NAME } from "../constants/auth.constants";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Public()
  @Post("otp/request")
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() dto: RequestOtpDto): Promise<OtpRequestResponseDto> {
    return this.authService.requestOtp(dto.phone);
  }

  @Public()
  @Post("otp/verify")
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    const { tokens, response } = await this.authService.verifyOtpAndLogin(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return response;
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] ?? dto.refreshToken;

    if (!token) {
      throw new UnauthorizedException("রিফ্রেশ টোকেন পাওয়া যায়নি");
    }

    const { tokens, response } = await this.authService.refreshTokens(token);
    this.setRefreshCookie(res, tokens.refreshToken);
    return response;
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
    return { message: "সফলভাবে লগআউট হয়েছে" };
  }

  /** টোকেন ভ্যালিডিটি ও বর্তমান লগইন করা ইউজার যাচাই করতে (ফ্রন্টএন্ড bootstrap-এ ব্যবহৃত হবে) */
  @Get("me")
  async me(@CurrentUser() user: JwtPayload): Promise<JwtPayload> {
    return user;
  }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    const isProduction = this.configService.get<string>("app.nodeEnv") === "production";
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge: 30 * 24 * 60 * 60 * 1000, // ৩০ দিন — jwt.refreshExpiresIn এর সাথে সামঞ্জস্যপূর্ণ
    });
  }
}
