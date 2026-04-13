import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SMSTask } from '../entities/sms_task.entity';
import { TasksController } from './tasks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SMSTask])],
  controllers: [TasksController],
  providers: [],
})
export class TasksModule {}
