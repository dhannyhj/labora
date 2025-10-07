import { Entity, Column, Index, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Organization } from './organization.entity';
import * as bcrypt from 'bcryptjs';

@Entity({ schema: 'lab', name: 'users' })
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
@Index(['organizationId', 'role'])
export class User extends BaseEntity {
  @Column({ 
    length: 100,
    unique: true,
    comment: 'Unique username for login'
  })
  username: string;

  @Column({ 
    length: 255, 
    unique: true,
    nullable: true,
    comment: 'Email address'
  })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'text',
    nullable: true,
    select: false,
    comment: 'Hashed password'
  })
  password: string;

  @Column({
    name: 'full_name',
    type: 'text',
    nullable: true,
    comment: 'Full name of the user'
  })
  fullName: string;

  @Column({ 
    length: 50,
    nullable: true,
    comment: 'User role within organization'
  })
  role: string;

  @Column({
    name: 'organization_id',
    type: 'uuid',
    nullable: true,
    comment: 'Organization this user belongs to'
  })
  organizationId: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: 'Whether user account is active'
  })
  isActive: boolean;

  @Column({ 
    type: 'jsonb', 
    nullable: true,
    comment: 'Additional user metadata'
  })
  meta: any;

  @Column({
    name: 'last_login_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'Last login timestamp'
  })
  lastLoginAt: Date;

  @Column({
    name: 'failed_login_attempts',
    type: 'int',
    default: 0,
    comment: 'Number of failed login attempts'
  })
  failedLoginAttempts: number;

  @Column({
    name: 'is_deleted',
    type: 'boolean',
    default: false,
    comment: 'Soft delete flag'
  })
  isDeleted: boolean;

  // Relationships
  @ManyToOne(() => Organization, organization => organization.users, { eager: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  // Lifecycle hooks
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }
}