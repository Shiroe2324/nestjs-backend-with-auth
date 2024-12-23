import { IsBoolean, IsDate, IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUrl, Length, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { I18nTranslations } from '@/generated/i18n.generated';

@Entity()
export class User {
  private static readonly _i18n = i18nValidationMessage<I18nTranslations>;

  @PrimaryGeneratedColumn()
  @IsInt({ message: User._i18n('validation.INTEGER') })
  @IsPositive({ message: User._i18n('validation.POSITIVE') })
  public id: number;

  @Column({ unique: true, nullable: true, default: null })
  @IsOptional()
  @IsString({ message: User._i18n('validation.STRING') })
  public googleId: string | null;

  @Column({ unique: true, length: 36 })
  @IsString({ message: User._i18n('validation.STRING') })
  @IsNotEmpty({ message: User._i18n('validation.NOT_EMPTY') })
  @Matches(/^[a-z0-9]+$/, { message: User._i18n('validation.ALPHANUMERIC') })
  @Length(3, 36, { message: User._i18n('validation.LENGTH') })
  public username: string;

  @Column({ length: 36, nullable: true, default: null })
  @IsOptional()
  @IsString({ message: User._i18n('validation.STRING') })
  @Length(3, 36, { message: User._i18n('validation.LENGTH') })
  public displayName: string | null;

  @Column({ unique: true })
  @IsEmail({}, { message: User._i18n('validation.EMAIL') })
  public email: string;

  @Column({ nullable: true, default: null })
  @IsOptional()
  @IsString({ message: User._i18n('validation.STRING') })
  @Length(6, 36, { message: User._i18n('validation.LENGTH') })
  public password: string | null;

  @Column({ nullable: true, default: null })
  @IsOptional()
  @IsUrl({}, { message: User._i18n('validation.URL') })
  public picture: string | null;

  @Column({ default: false })
  @IsBoolean({ message: User._i18n('validation.BOOLEAN') })
  public isVerified: boolean;

  @Column({ nullable: true, default: null })
  @IsOptional()
  @IsString({ message: User._i18n('validation.STRING') })
  public emailVerificationToken: string | null;

  @Column({ nullable: true, default: null })
  @IsOptional()
  @IsString({ message: User._i18n('validation.STRING') })
  @IsNotEmpty({ message: User._i18n('validation.NOT_EMPTY') })
  public resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  @IsOptional()
  @IsDate({ message: User._i18n('validation.DATE') })
  public resetPasswordExpires: Date | null;

  @CreateDateColumn()
  @IsDate({ message: User._i18n('validation.DATE') })
  public createdAt: Date;

  @UpdateDateColumn()
  @IsDate({ message: User._i18n('validation.DATE') })
  public updatedAt: Date;
}
