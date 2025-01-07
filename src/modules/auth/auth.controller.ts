import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { Cookies } from '@/decorators/cookies.decorator';
import { User } from '@/decorators/user.decorator';
import { User as UserEntity } from '@/entities/user.entity';
import { GoogleAuthGuard } from '@/guards/google-auth.guard';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { AuthService } from '@/modules/auth/auth.service';
import { CookieService } from '@/modules/auth/cookie.service';
import { ForgotPasswordDto } from '@/modules/auth/dto/forgot-password.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { ResetPasswordDto } from '@/modules/auth/dto/reset-password.dto';
import { VerifyEmailDto } from '@/modules/auth/dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { identifier, password } = loginDto;
    const { accessToken, refreshToken, message } = await this.authService.login(identifier, password);
    this.cookieService.setCookies(res, accessToken, refreshToken);
    return { message };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async logout(@Cookies() cookies: Record<string, string>, @Res({ passthrough: true }) res: Response) {
    const { message } = await this.authService.logout(cookies['accessToken'], cookies['refreshToken']);
    this.cookieService.clearCookies(res);
    return { message };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(@Cookies('refreshToken') refreshToken: string, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken: newRefreshToken, message } = await this.authService.refreshTokens(refreshToken);
    this.cookieService.setCookies(res, accessToken, newRefreshToken);
    return { message };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(@Body() registerDto: RegisterDto) {
    const { email, password } = registerDto;
    return await this.authService.register(email, password);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  public async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const { emailVerificationToken } = verifyEmailDto;
    return await this.authService.verifyEmail(emailVerificationToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  public async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    return await this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  public async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { resetPasswordToken, newPassword } = resetPasswordDto;
    return await this.authService.resetPassword(resetPasswordToken, newPassword);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  public async googleAuth() {
    // Initiates the Google OAuth2 flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  public async googleAuthRedirect(@User() user: UserEntity, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, redirectUrl } = await this.authService.googleLogin(user);
    this.cookieService.setCookies(res, accessToken, refreshToken);
    return res.redirect(redirectUrl);
  }
}
