import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as TypeORMBaseEntity,
  Column,
} from 'typeorm';

export abstract class BaseEntity extends TypeORMBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 'pending' })
  status: 'pending' | 'active' | 'completed' | 'closed' | 'expired';

  @Column({ nullable: true })
  reference_no: string;
}
