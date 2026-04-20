import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { SMSTask } from './sms_task.entity';
import { DeviceStatus } from './enums';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  gatewayId: string;

  @Column({ nullable: true })
  publicUrl: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
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
