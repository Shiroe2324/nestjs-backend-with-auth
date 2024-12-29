import { IsDate, IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { I18nTranslations } from '@/generated/i18n.generated';

@Entity()
export class TokenBlacklist {
  @PrimaryGeneratedColumn()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validations.INTEGER') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validations.POSITIVE') })
  public id!: number;

  @Column()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validations.NOT_EMPTY') })
  public token!: string;

  @CreateDateColumn()
  @IsDate({ message: i18nValidationMessage<I18nTranslations>('validations.DATE') })
  public createdAt!: Date;

  @UpdateDateColumn()
  @IsDate({ message: i18nValidationMessage<I18nTranslations>('validations.DATE') })
  public updatedAt!: Date;
}
