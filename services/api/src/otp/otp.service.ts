import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { SMSTask } from '../entities/sms_task.entity';
import { Device } from '../entities/device.entity';
import { TasksService } from '../jobs/tasks.service';
import { DeviceStatus, SMSTaskStatus } from '../entities/enums';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    @InjectRepository(SMSTask)
    private tasksRepository: Repository<SMSTask>,
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
    private readonly tasksService: TasksService,
  ) {}

  async generate(rawPhoneNumber: string, length: number = 6) {
    const phoneNumber = this.normalizePhoneNumber(rawPhoneNumber);
    if (!phoneNumber) {
      throw new BadRequestException('Valid phone number is required');
    }

    // Check if there is already a pending task for this number
    const existingActiveTask = await this.tasksRepository.findOne({
      where: { 
        recipient: phoneNumber,
        status: In([SMSTaskStatus.PENDING, SMSTaskStatus.QUEUED])
      }
    });

    if (existingActiveTask) {
      throw new BadRequestException('A message is already in transit for this number. Please wait for it to be processed.');
    }

    // Generate random code of specified length
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const code = Math.floor(min + Math.random() * (max - min + 1)).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const otp = this.otpRepository.create({
      phoneNumber,
      code,
      expiresAt,
    });

    await this.otpRepository.save(otp);

    // Find an online device for immediate assignment
    const staleThreshold = new Date(Date.now() - 1 * 60 * 1000);
    const device = await this.devicesRepository.createQueryBuilder('device')
      .where('device.status = :status', { status: DeviceStatus.ONLINE })
      .andWhere('device.lastSeen > :threshold', { threshold: staleThreshold })
      .orderBy('device.lastSeen', 'DESC')
      .getOne();

    if (!device) {
      throw new BadRequestException('No active mobile nodes are currently online to send OTP. Please check your phone connection.');
    }

    // 1. Check Spam Guard
    await this.tasksService.validateSpamLimits(phoneNumber, device.id);

    const refId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const task = this.tasksRepository.create({
      recipient: phoneNumber,
      message: `Hi! Your requested code is ${code}. (Ref: ${refId})`,
      status: SMSTaskStatus.PENDING,
      device: device || null,
    });

    const savedTask = await this.tasksRepository.save(task);

    // If device is online, push immediately and wait for response
    if (device && device.publicUrl) {
      console.log(`[OTP] Pushing code to device ${device.id}`);
      try {
        await this.tasksService.sendToDevice(device, savedTask);
      } catch (err: any) {
        console.error(`[OTP] Immediate push failed: ${err.message}`);
      }
    }

    const updatedTask = await this.tasksRepository.findOne({ where: { id: savedTask.id } });

    return { 
      success: true,
      message: updatedTask?.status === SMSTaskStatus.FAILED ? 'Failed to send SMS via phone' : 'OTP generated and sent',
      taskId: savedTask.id,
      status: updatedTask?.status || SMSTaskStatus.PENDING,
      failureReason: updatedTask?.failureReason
    };
  }

  async verify(rawPhoneNumber: string, code: string) {
    const phoneNumber = this.normalizePhoneNumber(rawPhoneNumber);
    if (!phoneNumber || !code) {
      throw new BadRequestException('Phone number and code are required');
    }

    const otp = await this.otpRepository.findOne({
      where: { phoneNumber, code, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new BadRequestException('Invalid OTP code or phone number');
    }

    if (otp.expiresAt < new Date()) {
      console.warn(`[OTP] Expired Check: ExpiresAt ${otp.expiresAt.toISOString()}, Now ${new Date().toISOString()}`);
      throw new BadRequestException('OTP has expired');
    }

    otp.isUsed = true;
    await this.otpRepository.save(otp);

    return { 
      success: true, 
      message: 'OTP verified successfully' 
    };
  }

  private normalizePhoneNumber(value?: string) {
    return value?.trim().replace(/[^\d+]/g, '') || '';
  }
}
