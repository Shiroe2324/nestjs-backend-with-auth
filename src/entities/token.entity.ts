import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { I18nTranslations } from '@/generated/i18n.generated';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validations.INTEGER') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validations.POSITIVE') })
  public id!: number;

  @Column({ unique: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validations.NOT_EMPTY') })
  public content!: string;

  @Column({ type: 'timestamp' })
  @IsOptional()
  @IsDate({ message: i18nValidationMessage<I18nTranslations>('validations.DATE') })
  public expirationDate!: Date;

  @Column({ default: false })
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validations.BOOLEAN') })
  public isBlacklisted!: boolean;

  @CreateDateColumn()
  @IsDate({ message: i18nValidationMessage<I18nTranslations>('validations.DATE') })
  public createdAt!: Date;

  @UpdateDateColumn()
  @IsDate({ message: i18nValidationMessage<I18nTranslations>('validations.DATE') })
  public updatedAt!: Date;
}
