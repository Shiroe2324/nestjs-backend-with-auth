import { IsDate, IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { I18nTranslations } from '@/generated/i18n.generated';

@Entity()
export class TokenBlacklist {
  private static readonly _i18n = i18nValidationMessage<I18nTranslations>;

  @PrimaryGeneratedColumn()
  @IsInt({ message: TokenBlacklist._i18n('validation.INTEGER') })
  @IsPositive({ message: TokenBlacklist._i18n('validation.POSITIVE') })
  public id: number;

  @Column()
  @IsString({ message: TokenBlacklist._i18n('validation.STRING') })
  @IsNotEmpty({ message: TokenBlacklist._i18n('validation.NOT_EMPTY') })
  public token: string;

  @CreateDateColumn()
  @IsDate({ message: TokenBlacklist._i18n('validation.DATE') })
  public createdAt: Date;

  @UpdateDateColumn()
  @IsDate({ message: TokenBlacklist._i18n('validation.DATE') })
  public updatedAt: Date;
}
