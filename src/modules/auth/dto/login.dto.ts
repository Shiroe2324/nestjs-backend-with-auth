import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '@/generated/i18n.generated';

export class LoginDto {
  private static readonly _i18n = i18nValidationMessage<I18nTranslations>;

  @IsString({ message: LoginDto._i18n('validation.STRING') })
  @IsNotEmpty({ message: LoginDto._i18n('validation.NOT_EMPTY') })
  @MinLength(3, { message: LoginDto._i18n('validation.MIN_LENGTH') })
  public identifier: string;

  @IsString({ message: LoginDto._i18n('validation.STRING') })
  @IsNotEmpty({ message: LoginDto._i18n('validation.NOT_EMPTY') })
  @Length(6, 36, { message: LoginDto._i18n('validation.LENGTH') })
  public password: string;
}
