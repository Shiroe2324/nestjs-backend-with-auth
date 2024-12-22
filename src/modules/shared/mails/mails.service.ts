import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailsService {
  private readonly logger = new Logger(MailsService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  public async sendEmailVerificationEmail(email: string, emailVerificationToken: string) {
    const emailVerificationUrl = this.configService.get<string>('server.emailVerificationUrl');
    const emailVerificationLink = `${emailVerificationUrl}?emailVerificationToken=${emailVerificationToken}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verificación de cuenta',
        template: 'email-verification',
        context: { emailVerificationLink },
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error instanceof Error ? error.stack : error);
    }
  }

  public async sendResetPasswordEmail(email: string, resetPasswordToken: string) {
    const resetPasswordUrl = this.configService.get<string>('server.resetPasswordUrl');
    const resetPasswordLink = `${resetPasswordUrl}?resetPasswordToken=${resetPasswordToken}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Restablecimiento de contraseña',
        template: 'reset-password',
        context: { resetPasswordLink: resetPasswordLink },
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error instanceof Error ? error.stack : error);
    }
  }
}
