import { Exclude, Expose } from 'class-transformer';

export class MeDto {
  @Expose()
  public id: number;

  @Exclude()
  public googleId: string | null;

  @Expose()
  public username: string;

  @Expose()
  public email: string;

  @Exclude()
  public password: string | null;

  @Expose()
  public picture: string | null;

  @Expose()
  public isVerified: boolean;

  @Exclude()
  public emailVerificationToken: string | null;

  @Exclude()
  public resetPasswordToken: string | null;

  @Exclude()
  public resetPasswordExpires: Date | null;

  @Expose()
  public createdAt: Date;

  @Expose()
  public updatedAt: Date;

  constructor(partial: Partial<MeDto>) {
    Object.assign(this, partial);
  }
}
