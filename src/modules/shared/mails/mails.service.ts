import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';

import { I18nTranslations } from '@/generated/i18n.generated';

@Injectable()
export class MailsService {
  private readonly logger = new Logger(MailsService.name);
  private readonly emailVerificationUrl = this.configService.getOrThrow<string>('main.emailVerificationUrl');
  private readonly resetPasswordUrl = this.configService.getOrThrow<string>('main.resetPasswordUrl');

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public async sendEmailVerificationEmail(email: string, emailVerificationToken: string) {
    const emailVerificationLink = `${this.emailVerificationUrl}?emailVerificationToken=${emailVerificationToken}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: this.i18n.t('mails.emailVerification.subject'),
        template: 'email-verification',
        context: { emailVerificationLink },
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error instanceof Error ? error.stack : error);
    }
  }

  public async sendResetPasswordEmail(email: string, resetPasswordToken: string) {
    const resetPasswordLink = `${this.resetPasswordUrl}?resetPasswordToken=${resetPasswordToken}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: this.i18n.t('mails.resetPassword.subject'),
        template: 'reset-password',
        context: { resetPasswordLink },
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error instanceof Error ? error.stack : error);
    }
  }
}
