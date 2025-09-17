// src/activity/entities/activity-log.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user: string;

  @Column()
  method: string;

  @Column()
  endpoint: string;

  @Column()
  activity: string;

  @Column({ type: 'text', nullable: true })
  data: string;

  @Column({ nullable: true })
  ip: string;

  @Column()
  duration: number;

  @CreateDateColumn()
  createdAt: Date;
}
