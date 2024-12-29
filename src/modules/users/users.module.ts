import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/entities/user.entity';
import { CloudinaryModule } from '@/modules/shared/cloudinary/cloudinary.module';
import { UsersController } from '@/modules/users/users.controller';
import { UsersService } from '@/modules/users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CloudinaryModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
