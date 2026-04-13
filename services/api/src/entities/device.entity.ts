import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { SMSTask } from './sms_task.entity';
import { DeviceStatus } from '@sms-saas/types';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.devices)
  user: User;

  @Column()
  phoneNumber: string;

  @Column()
  simOperator: string;

  @Column({ default: 0 })
  smsRemaining: number;

  @Column({ type: 'enum', enum: DeviceStatus, default: DeviceStatus.OFFLINE })
  status: DeviceStatus;

  @UpdateDateColumn()
  lastSeen: Date;

  @OneToMany(() => SMSTask, (task) => task.device)
  tasks: SMSTask[];
}
