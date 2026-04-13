import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Device } from './device.entity';
import { SMSTaskStatus } from '@sms-saas/types';

@Entity('sms_tasks')
export class SMSTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jobId: string;

  @ManyToOne(() => Device, (device) => device.tasks)
  device: Device;

  @Column({ type: 'enum', enum: SMSTaskStatus, default: SMSTaskStatus.PENDING })
  status: SMSTaskStatus;

  @Column({ default: 0 })
  retryCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
