import { IsBoolean, IsDate, IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Length, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import limitsConfig from '@/config/limits.config';
import { Picture } from '@/entities/picture.entity';
import { Role } from '@/entities/role.entity';
import { Token } from '@/entities/token.entity';
import { I18nTranslations } from '@/generated/i18n.generated';

const { minUsernameLength, maxUsernameLength, minPasswordLength, maxPasswordLength, minDisplayNameLength, maxDisplayNameLength } = limitsConfig();

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validations.INTEGER') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validations.POSITIVE') })
  public id!: number;

  @Column({ type: 'varchar', unique: true, nullable: true })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  public googleId!: string | null;

  @Column({ unique: true, length: maxUsernameLength })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validations.NOT_EMPTY') })
  @Matches(/^[a-z0-9]+$/, { message: i18nValidationMessage<I18nTranslations>('validations.ALPHANUMERIC') })
  @Length(minUsernameLength, maxUsernameLength, { message: i18nValidationMessage<I18nTranslations>('validations.LENGTH') })
  public username!: string;

  @Column({ type: 'varchar', nullable: true, length: maxDisplayNameLength })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  @Length(minDisplayNameLength, maxDisplayNameLength, { message: i18nValidationMessage<I18nTranslations>('validations.LENGTH') })
  public displayName!: string | null;

  @Column({ unique: true })
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validations.EMAIL') })
  public email!: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validations.STRING') })
  @Length(minPasswordLength, maxPasswordLength, { message: i18nValidationMessage<I18nTranslations>('validations.LENGTH') })
  public password!: string | null;

  @Column({ default: false })
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validations.BOOLEAN') })
  public isVerified!: boolean;

  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable()
  public roles!: Role[];

  @OneToOne(() => Picture, { cascade: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  public picture!: Picture | null;

  @OneToOne(() => Token, { cascade: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  public emailVerificationToken!: Token | null;

  @OneToOne(() => Token, { cascade: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  public resetPasswordToken!: Token | null;

  @CreateDateColumn()
  @IsDate({ message: i18nValidationMessage<I18nTranslations>('validations.DATE') })
  public createdAt!: Date;

  @UpdateDateColumn()
  @IsDate({ message: i18nValidationMessage<I18nTranslations>('validations.DATE') })
  public updatedAt!: Date;

  @BeforeInsert()
  public generateUsername() {
    if (this.username) {
      this.username = this.username.toLowerCase();
    } else {
      this.username = `user${uuidv4().slice(0, 8)}`;
    }
  }
}
