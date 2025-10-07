import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Organization } from './organization.entity';

@Entity({ schema: 'lab', name: 'providers' })
export class Provider extends BaseEntity {
  @Column({ 
    length: 100,
    comment: 'Provider full name'
  })
  name: string;

  @Column({ 
    length: 100,
    nullable: true,
    comment: 'Medical license number'
  })
  licenseNumber: string;

  @Column({ 
    length: 100,
    nullable: true,
    comment: 'Medical specialty'
  })
  specialty: string;

  @Column({ 
    type: 'jsonb', 
    nullable: true,
    comment: 'Contact information'
  })
  contact: {
    phone?: string;
    email?: string;
    address?: string;
    fax?: string;
  };

  @Column({ 
    type: 'boolean', 
    default: true,
    comment: 'Whether provider is active'
  })
  isActive: boolean;

  @Column({ 
    type: 'uuid',
    name: 'organization_id',
    nullable: true,
    comment: 'Organization this provider belongs to'
  })
  organizationId: string;

  // Relationships
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;
}