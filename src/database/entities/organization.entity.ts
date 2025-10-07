import { Entity, Column, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ schema: 'lab', name: 'organizations' })
export class Organization extends BaseEntity {
  @Column({ type: 'text' })
  name: string;

  @Column({ length: 50, unique: true, nullable: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ 
    type: 'jsonb', 
    nullable: true,
    comment: 'Contact information'
  })
  contact: any;

  @Column({ 
    type: 'jsonb', 
    nullable: true,
    comment: 'Additional metadata'
  })
  meta: any;

  @Column({ 
    name: 'is_deleted',
    type: 'boolean', 
    default: false,
    comment: 'Soft delete flag'
  })
  isDeleted: boolean;

  // Relationships
  @OneToMany(() => User, user => user.organization)
  users: User[];
}