import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenBlacklist } from '@/entities/token-blacklist.entity';
import { User } from '@/entities/user.entity';
import { TasksService } from '@/modules/shared/tasks/tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, TokenBlacklist]), ScheduleModule.forRoot()],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
