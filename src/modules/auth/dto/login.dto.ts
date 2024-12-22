import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Length(3)
  public identifier: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 36)
  public password: string;
}
