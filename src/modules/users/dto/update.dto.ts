import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import limitsConfig from '@/config/limits.config';
import { I18nTranslations } from '@/generated/i18n.generated';

const { minUsernameLength, maxUsernameLength, minDisplayNameLength, maxDisplayNameLength } = limitsConfig();

export class UpdateDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validations.NOT_EMPTY') })
  @Matches(/^[a-z0-9]+$/, { message: i18nValidationMessage<I18nTranslations>('validations.ALPHANUMERIC') })
  @Length(minUsernameLength, maxUsernameLength, { message: i18nValidationMessage<I18nTranslations>('validations.LENGTH') })
  public username!: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validations.NOT_EMPTY') })
  @Length(minDisplayNameLength, maxDisplayNameLength, { message: i18nValidationMessage<I18nTranslations>('validations.LENGTH') })
  public displayName!: string;
}
