import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '@/generated/i18n.generated';

export class RegisterDto {
  private static readonly _i18n = i18nValidationMessage<I18nTranslations>;

  @IsString({ message: RegisterDto._i18n('validation.STRING') })
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsNotEmpty({ message: RegisterDto._i18n('validation.NOT_EMPTY') })
  @Matches(/^[a-z0-9]+$/, { message: RegisterDto._i18n('validation.ALPHANUMERIC') })
  @Length(3, 36, { message: RegisterDto._i18n('validation.LENGTH') })
  public username: string;

  @IsEmail({}, { message: RegisterDto._i18n('validation.EMAIL') })
  public email: string;

  @IsString({ message: RegisterDto._i18n('validation.STRING') })
  @IsNotEmpty({ message: RegisterDto._i18n('validation.NOT_EMPTY') })
  @Length(6, 36, { message: RegisterDto._i18n('validation.LENGTH') })
  public password: string;
}
