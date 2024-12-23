import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '@/generated/i18n.generated';

export class VerifyEmailDto {
  private static readonly _i18n = i18nValidationMessage<I18nTranslations>;

  @IsString({ message: VerifyEmailDto._i18n('validation.STRING') })
  @IsNotEmpty({ message: VerifyEmailDto._i18n('validation.NOT_EMPTY') })
  public emailVerificationToken: string;
}
