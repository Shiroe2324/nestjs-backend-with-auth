import { IsBoolean, IsDate, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Length, Matches, Min } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @IsInt()
  @Min(1)
  public id: number;

  @Column({ unique: true, nullable: true, default: null })
  @IsString()
  @IsOptional()
  public googleId: string | null;

  @Column({ unique: true, length: 36 })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+$/)
  @Length(3, 36)
  public username: string;

  @Column({ length: 36, nullable: true, default: null })
  @IsString()
  @Length(3, 36)
  @IsOptional()
  public displayName: string | null;

  @Column({ unique: true })
  @IsEmail()
  public email: string;

  @Column({ nullable: true, default: null })
  @Length(6, 36)
  @IsOptional()
  public password: string | null;

  @Column({ nullable: true, default: null })
  @IsUrl()
  @IsOptional()
  public picture: string | null;

  @Column({ default: false })
  @IsBoolean()
  public isVerified: boolean;

  @Column({ nullable: true, default: null })
  @IsString()
  @IsOptional()
  public emailVerificationToken: string | null;

  @Column({ nullable: true, default: null })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  @IsDate()
  @IsOptional()
  public resetPasswordExpires: Date | null;

  @CreateDateColumn()
  @IsDate()
  public createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  public updatedAt: Date;
}
