import { IsNotEmpty, IsString, Length } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '@/generated/i18n.generated';

export class ResetPasswordDto {
  private static readonly _i18n = i18nValidationMessage<I18nTranslations>;

  @IsString({ message: ResetPasswordDto._i18n('validation.STRING') })
  @IsNotEmpty({ message: ResetPasswordDto._i18n('validation.NOT_EMPTY') })
  public resetPasswordToken: string;

  @IsString({ message: ResetPasswordDto._i18n('validation.STRING') })
  @IsNotEmpty({ message: ResetPasswordDto._i18n('validation.NOT_EMPTY') })
  @Length(6, 36, { message: ResetPasswordDto._i18n('validation.LENGTH') })
  public newPassword: string;
}
