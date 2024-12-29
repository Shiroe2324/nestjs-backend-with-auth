import { IsBoolean, IsDate, IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUrl, Length, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import limitsConfig from '@/config/limits.config';
import { I18nTranslations } from '@/generated/i18n.generated';

const { minUsernameLength, maxUsernameLength, minPasswordLength, maxPasswordLength, minDisplayNameLength, maxDisplayNameLength } = limitsConfig();

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validations.INTEGER') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validations.POSITIVE') })
  public id!: number;

  @Column({ type: 'varchar', unique: true, nullable: true, default: null })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  public googleId!: string | null;

  @Column({ unique: true, length: maxUsernameLength })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validations.NOT_EMPTY') })
  @Matches(/^[a-z0-9]+$/, { message: i18nValidationMessage<I18nTranslations>('validations.ALPHANUMERIC') })
  @Length(minUsernameLength, maxUsernameLength, { message: i18nValidationMessage<I18nTranslations>('validations.LENGTH') })
  public username!: string;

  @Column({ type: 'varchar', nullable: true, default: null, length: maxDisplayNameLength })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  @Length(minDisplayNameLength, maxDisplayNameLength, { message: i18nValidationMessage<I18nTranslations>('validations.LENGTH') })
  public displayName!: string | null;

  @Column({ unique: true })
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validations.EMAIL') })
  public email!: string;

  @Column({ type: 'text', nullable: true, default: null })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  @Length(minPasswordLength, maxPasswordLength, { message: i18nValidationMessage<I18nTranslations>('validations.LENGTH') })
  public password!: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  @IsOptional()
  @IsUrl({}, { message: i18nValidationMessage<I18nTranslations>('validations.URL') })
  public picture!: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  public picturePublicId!: string | null;

  @Column({ default: false })
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validations.BOOLEAN') })
  public isVerified!: boolean;

  @Column({ type: 'text', nullable: true, default: null })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  public emailVerificationToken!: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validations.NOT_EMPTY') })
  public resetPasswordToken!: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  @IsOptional()
  @IsDate({ message: i18nValidationMessage<I18nTranslations>('validations.DATE') })
  public resetPasswordExpires!: Date | null;

  @CreateDateColumn()
  @IsDate({ message: i18nValidationMessage<I18nTranslations>('validations.DATE') })
  public createdAt!: Date;

  @UpdateDateColumn()
  @IsDate({ message: i18nValidationMessage<I18nTranslations>('validations.DATE') })
  public updatedAt!: Date;
}
