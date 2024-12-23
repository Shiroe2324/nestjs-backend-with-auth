import { IsEmail } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '@/generated/i18n.generated';

export class ForgotPasswordDto {
  private static readonly _i18n = i18nValidationMessage<I18nTranslations>;

  @IsEmail({}, { message: ForgotPasswordDto._i18n('validation.EMAIL') })
  public email: string;
}
