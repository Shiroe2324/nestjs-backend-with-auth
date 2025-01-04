import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import limitsConfig from '@/config/limits.config';
import { I18nTranslations } from '@/generated/i18n.generated';

const { minPasswordLength, maxPasswordLength } = limitsConfig();

export class RegisterDto {
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validations.EMAIL') })
  public email!: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validations.NOT_EMPTY') })
  @Length(minPasswordLength, maxPasswordLength, { message: i18nValidationMessage<I18nTranslations>('validations.LENGTH') })
  public password!: string;
}
