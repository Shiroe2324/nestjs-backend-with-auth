import { IsDate, IsEnum, IsInt, IsPositive } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { User } from '@/entities/user.entity';
import { Roles } from '@/enums/roles.enum';
import { I18nTranslations } from '@/generated/i18n.generated';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validations.INTEGER') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validations.POSITIVE') })
  public id!: number;

  @Column({ unique: true })
  @IsEnum(Roles, { message: i18nValidationMessage<I18nTranslations>('validations.ENUM') })
  public name!: Roles;

  @ManyToMany(() => User, (user) => user.roles)
  public users!: User[];

  @CreateDateColumn()
  @IsDate({ message: i18nValidationMessage<I18nTranslations>('validations.DATE') })
  public createdAt!: Date;

  @UpdateDateColumn()
  @IsDate({ message: i18nValidationMessage<I18nTranslations>('validations.DATE') })
  public updatedAt!: Date;
}
