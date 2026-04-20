import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('spam_policies')
export class SpamPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'GLOBAL' })
  type: string; // GLOBAL, RECIPIENT_DAILY, DEVICE_DAILY

  @Column({ default: 100 })
  maxPerDay: number;

  @Column({ default: 5 })
  maxPerHourPerRecipient: number;

  @Column({ default: true })
  isActive: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
