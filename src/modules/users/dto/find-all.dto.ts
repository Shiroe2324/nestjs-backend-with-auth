import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { Order, OrderBy } from '@/enums/find-all-users.enum';
import { I18nTranslations } from '@/generated/i18n.generated';

export class FindAllDto {
  @IsOptional()
  @IsEnum(Order, { message: i18nValidationMessage<I18nTranslations>('validations.ENUM') })
  public order: Order = Order.ASC;

  @IsOptional()
  @IsEnum(OrderBy, { message: i18nValidationMessage<I18nTranslations>('validations.ENUM') })
  public orderBy: OrderBy = OrderBy.ID;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validations.INTEGER') })
  @Min(1, { message: i18nValidationMessage<I18nTranslations>('validations.MIN_NUMBER') })
  public page: number = 1;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validations.INTEGER') })
  @Min(1, { message: i18nValidationMessage<I18nTranslations>('validations.MIN_NUMBER') })
  @Max(1000, { message: i18nValidationMessage<I18nTranslations>('validations.MAX_NUMBER') })
  public limit: number = 10;
}
