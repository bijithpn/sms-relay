import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SMSTask } from '../entities/sms_task.entity';
import { Device } from '../entities/device.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { SpamPolicy } from '../entities/spam_policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SMSTask, Device, SpamPolicy])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
