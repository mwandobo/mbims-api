// permission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., 'create', 'read', 'update', 'delete'

  @Column()
  description: string;

  @Column()
  group: string;
}