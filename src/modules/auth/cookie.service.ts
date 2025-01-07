import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import ms from 'ms';

@Injectable()
export class CookieService {
  private readonly jwtAccessExpiration = this.configService.getOrThrow<string>('jwt.accessExpiration');
  private readonly jwtRefreshExpiration = this.configService.getOrThrow<string>('jwt.refreshExpiration');
  private readonly isProduction = this.configService.getOrThrow<boolean>('main.isProduction');

  constructor(private readonly configService: ConfigService) {}

  public setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, this.getAccessTokenCookieOptions);
    res.cookie('refreshToken', refreshToken, this.getRefreshTokenCookieOptions);
  }

  public clearCookies(res: Response) {
    res.clearCookie('accessToken', this.getClearCookieOptions);
    res.clearCookie('refreshToken', this.getClearCookieOptions);
  }

  private getCookieOptions(maxAge?: number): CookieOptions {
    return { httpOnly: true, secure: this.isProduction, sameSite: 'strict', path: '/', ...(maxAge && { maxAge }) };
  }

  private get getAccessTokenCookieOptions() {
    return this.getCookieOptions(ms(this.jwtAccessExpiration));
  }

  private get getRefreshTokenCookieOptions() {
    return this.getCookieOptions(ms(this.jwtRefreshExpiration));
  }

  private get getClearCookieOptions() {
    return this.getCookieOptions();
  }
}
