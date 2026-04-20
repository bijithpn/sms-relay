import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { SMSTask } from '../entities/sms_task.entity';
import { Device } from '../entities/device.entity';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { TasksModule } from '../jobs/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Otp, SMSTask, Device]),
    TasksModule,
  ],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
