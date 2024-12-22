import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  @Matches(/^[a-z0-9]+$/)
  @IsNotEmpty()
  @Length(3, 36)
  public username: string;

  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 36)
  public password: string;
}
