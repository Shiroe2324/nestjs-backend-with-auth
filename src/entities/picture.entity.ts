import { IsDate, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUrl } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { I18nTranslations } from '@/generated/i18n.generated';

@Entity()
export class Picture {
  @PrimaryGeneratedColumn()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validations.INTEGER') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validations.POSITIVE') })
  public id!: number;

  @Column()
  @IsUrl({}, { message: i18nValidationMessage<I18nTranslations>('validations.URL') })
  public url!: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validations.NOT_EMPTY') })
  public publicId!: string | null;

  @CreateDateColumn()
  @IsDate({ message: i18nValidationMessage<I18nTranslations>('validations.DATE') })
  public createdAt!: Date;

  @UpdateDateColumn()
  @IsDate({ message: i18nValidationMessage<I18nTranslations>('validations.DATE') })
  public updatedAt!: Date;
}
