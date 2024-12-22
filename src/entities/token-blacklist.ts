import { IsDate, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class TokenBlacklist {
  @PrimaryGeneratedColumn()
  @IsInt()
  @Min(1)
  public id: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  public token: string;

  @CreateDateColumn()
  @IsDate()
  public createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  public updatedAt: Date;
}
