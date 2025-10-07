import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum UserRole {
  ADMIN = 'admin',
  LAB_MANAGER = 'lab_manager',
  LAB_TECHNICIAN = 'lab_technician',
  NURSE = 'nurse',
  DOCTOR = 'doctor',
  RECEPTIONIST = 'receptionist'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

@Entity({ schema: 'lab', name: 'users' })
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User extends BaseEntity {
  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({ length: 100 })
  fullName: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.LAB_TECHNICIAN
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status: UserStatus;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'inet', nullable: true })
  lastLoginIp?: string;

  @Column({ type: 'text', nullable: true })
  avatar?: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences?: any;

  @Column({ type: 'jsonb', nullable: true })
  permissions?: string[];

  @Column({ type: 'timestamptz', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamptz', nullable: true })
  resetPasswordExpires?: Date;
}