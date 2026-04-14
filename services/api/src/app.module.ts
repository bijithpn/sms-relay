import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Device } from './entities/device.entity';
import { SMSTask } from './entities/sms_task.entity';
import { Template } from './entities/template.entity';
import { AuthModule } from './auth/auth.module';
import { DevicesModule } from './devices/devices.module';
import { TasksModule } from './jobs/tasks.module';
import { TemplatesModule } from './templates/templates.module';
import { SystemController } from './system/system.controller';
import { TunnelService } from './system/tunnel.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/sms_saas',
      autoLoadEntities: true,
      synchronize: true, // Set to false in production
    }),
    TypeOrmModule.forFeature([User, Device, SMSTask]),
    AuthModule,
    DevicesModule,
    TasksModule,
    TemplatesModule,
  ],
  controllers: [SystemController],
  providers: [TunnelService],
})
export class AppModule {}
