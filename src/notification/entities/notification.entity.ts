import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ name: 'for_name', length: 255 })
  forName: string;

  @Column({ name: 'for_id', length: 255 })
  forId: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'expires_at', nullable: true, length: 255 })
  expiresAt: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'notified_personnel_id' })
  notifiedPersonnel: User;

  @Column({ name: 'redirect_url', length: 255, nullable: true })
  redirectUrl: string;

  @Column({ length: 255, nullable: true })
  group: string;
}