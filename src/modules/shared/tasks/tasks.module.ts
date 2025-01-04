import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from '@/entities/role.entity';
import { Token } from '@/entities/token.entity';
import { User } from '@/entities/user.entity';
import { TasksService } from '@/modules/shared/tasks/tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Token, User]), ScheduleModule.forRoot()],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
