import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import limitsConfig from '@/config/limits.config';
import { I18nTranslations } from '@/generated/i18n.generated';

const { minUsernameLength, maxUsernameLength, minPasswordLength, maxPasswordLength } = limitsConfig();

export class RegisterDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validations.NOT_EMPTY') })
  @Matches(/^[a-z0-9]+$/, { message: i18nValidationMessage<I18nTranslations>('validations.ALPHANUMERIC') })
  @Length(minUsernameLength, maxUsernameLength, { message: i18nValidationMessage<I18nTranslations>('validations.LENGTH') })
  public username!: string;

  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validations.EMAIL') })
  public email!: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validations.NOT_EMPTY') })
  @Length(minPasswordLength, maxPasswordLength, { message: i18nValidationMessage<I18nTranslations>('validations.LENGTH') })
  public password!: string;
}
