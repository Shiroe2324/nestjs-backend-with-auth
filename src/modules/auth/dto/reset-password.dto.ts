import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  public resetPasswordToken: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 36)
  public newPassword: string;
}
