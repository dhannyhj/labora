import { Entity, Column, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Organization } from './organization.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNKNOWN = 'unknown'
}

@Entity({ schema: 'lab', name: 'patients' })
@Index(['mrn', 'organizationId'], { unique: true })
@Index(['firstName', 'lastName'])
export class Patient extends BaseEntity {
  @Column({ 
    length: 50, 
    comment: 'Medical Record Number - unique within organization'
  })
  mrn: string;

  @Column({ 
    name: 'given_name',
    length: 100,
    comment: 'Patient first name'
  })
  firstName: string;

  @Column({ 
    name: 'family_name',
    length: 100,
    comment: 'Patient last name'
  })
  lastName: string;

  @Column({ 
    name: 'birth_date',
    type: 'date',
    comment: 'Patient date of birth'
  })
  birthDate: Date;

  @Column({ 
    type: 'enum',
    enum: Gender,
    default: Gender.UNKNOWN
  })
  gender: Gender;

  @Column({ 
    type: 'jsonb', 
    nullable: true,
    comment: 'Contact information including phone, email, address'
  })
  contact: {
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    emergencyContact?: {
      name?: string;
      phone?: string;
      relationship?: string;
    };
  };

  @Column({ 
    type: 'jsonb', 
    nullable: true,
    comment: 'Additional patient identifiers'
  })
  identifiers: {
    nationalId?: string;
    passportNumber?: string;
    driverLicense?: string;
    insuranceNumber?: string;
  };

  @Column({ 
    type: 'jsonb', 
    nullable: true,
    comment: 'Medical and demographic metadata'
  })
  meta: {
    bloodType?: string;
    allergies?: string[];
    chronicConditions?: string[];
    preferredLanguage?: string;
    notes?: string;
  };

  @Column({ 
    type: 'uuid',
    name: 'organization_id',
    comment: 'Organization this patient belongs to'
  })
  organizationId: string;

  // Relationships
  @ManyToOne(() => Organization, { eager: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  // Computed properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}