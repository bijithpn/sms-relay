import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Device } from './device.entity';
import { SMSTaskStatus } from './enums';

@Entity('sms_tasks')
export class SMSTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  jobId: string;

  @Column()
  recipient: string;

  @Column('text')
  message: string;

  @ManyToOne(() => Device, (device) => device.tasks, { nullable: true })
  device: Device;

  @Column({ type: 'enum', enum: SMSTaskStatus, default: SMSTaskStatus.PENDING })
  status: SMSTaskStatus;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;
}
