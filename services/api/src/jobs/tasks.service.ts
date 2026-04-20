import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { SMSTask } from '../entities/sms_task.entity';
import { Device } from '../entities/device.entity';
import { SpamPolicy } from '../entities/spam_policy.entity';
import { SMSTaskStatus } from '../entities/enums';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(SMSTask)
    private tasksRepository: Repository<SMSTask>,
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
    @InjectRepository(SpamPolicy)
    private spamPolicyRepository: Repository<SpamPolicy>,
  ) {}

  async validateSpamLimits(recipient: string, deviceId?: string) {
    const policy = await this.spamPolicyRepository.findOne({ where: { type: 'GLOBAL', isActive: true } });
    if (!policy) return; // No policy, allow everything

    // 1. Recipient Hourly Limit
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const hourlyCount = await this.tasksRepository.count({
      where: {
        recipient,
        createdAt: MoreThan(oneHourAgo),
      }
    });

    if (hourlyCount >= policy.maxPerHourPerRecipient) {
      throw new Error(`Spam Guard: Limit reached for recipient ${recipient} (${policy.maxPerHourPerRecipient} SMS/hour)`);
    }

    // 2. Device Daily Limit
    if (deviceId) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const dailyCount = await this.tasksRepository.count({
        where: {
          device: { id: deviceId },
          createdAt: MoreThan(todayStart),
        }
      });

      if (dailyCount >= policy.maxPerDay) {
        throw new Error(`Spam Guard: Daily limit reached for this mobile node (${policy.maxPerDay} SMS/day)`);
      }
    }
  }

  async sendToDevice(device: Device, task: SMSTask) {
    try {
      const url = `${device.publicUrl.replace(/\/$/, '')}/send-sms`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          recipient: task.recipient,
          message: task.message,
          taskId: task.id,
        }),
      });

      if (response.ok) {
        await this.tasksRepository.update(task.id, { status: SMSTaskStatus.SENT });
        console.log(`[Tasks] Task ${task.id} marked as SENT`);
      } else {
        const errorText = await response.text();
        console.error(`Device returned error for task ${task.id}: ${errorText.slice(0, 100)}...`);
        // Immediate failure for device-reported errors (no retry)
        await this.tasksRepository.update(task.id, { 
          status: SMSTaskStatus.FAILED,
          failureReason: `Device Error: ${errorText.slice(0, 50)}` 
        });
      }
    } catch (e: any) {
      const isLocal = device.publicUrl.includes('192.168') || device.publicUrl.includes('10.');
      if (!isLocal) {
        console.error(`Error sending task to device ${device.id}: ${e.message}`);
      }
      
      const nextStatus = task.retryCount >= 24 ? SMSTaskStatus.FAILED : SMSTaskStatus.PENDING;
      await this.tasksRepository.update(task.id, { 
        status: nextStatus,
        failureReason: `Network Error: ${e.message}`
      });
    }
  }
}
