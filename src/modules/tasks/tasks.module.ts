import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenBlacklist } from '@/entities/token-blacklist.entity';
import { User } from '@/entities/user.entity';
import { TasksService } from '@/modules/tasks/tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, TokenBlacklist])],
  providers: [TasksService],
})
export class TasksModule {}
