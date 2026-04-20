import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { SMSTask } from './entities/sms_task.entity';
import { Template } from './entities/template.entity';
import { SpamPolicy } from './entities/spam_policy.entity';
import { DevicesModule } from './devices/devices.module';
import { TasksModule } from './jobs/tasks.module';
import { TemplatesModule } from './templates/templates.module';
import { RecipientsModule } from './recipients/recipients.module';
import { OtpModule } from './otp/otp.module';
import { SystemController } from './system/system.controller';
import { TunnelService } from './system/tunnel.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/sms_saas',
      autoLoadEntities: true,
      synchronize: true, // Set to false in production
      retryAttempts: 10,
      retryDelay: 3000,
    }),
    TypeOrmModule.forFeature([Device, SMSTask, SpamPolicy]),
    DevicesModule,
    TasksModule,
    TemplatesModule,
    RecipientsModule,
    OtpModule,
  ],
  controllers: [SystemController],
  providers: [TunnelService],
})
export class AppModule {}
