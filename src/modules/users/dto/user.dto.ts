import { Exclude, Expose, Transform } from 'class-transformer';

import { Picture } from '@/entities/picture.entity';
import { Role } from '@/entities/role.entity';
import { Token } from '@/entities/token.entity';

export class UserDto {
  @Expose()
  public id!: number;

  @Exclude()
  public googleId!: string | null;

  @Expose()
  public username!: string;

  @Exclude()
  public email!: string;

  @Exclude()
  public password!: string | null;

  @Expose()
  @Transform(({ value }) => value.map((role: Role) => role.name))
  public roles!: Role[];

  @Expose()
  @Transform(({ value }) => value?.url || null)
  public picture!: Picture | null;

  @Expose()
  public isVerified!: boolean;

  @Exclude()
  public emailVerificationToken!: Token | null;

  @Exclude()
  public resetPasswordToken!: Token | null;

  @Expose()
  public createdAt!: Date;

  @Expose()
  public updatedAt!: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
