import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SpecimenType } from './specimen-type.entity';
import { Unit } from './unit.entity';
import { Organization } from './organization.entity';

export enum ResultDataType {
  NUMERIC = 'numeric',
  TEXT = 'text',
  CODED = 'coded',
  BOOLEAN = 'boolean'
}

@Entity({ schema: 'lab', name: 'tests' })
export class Test extends BaseEntity {
  @Column({ 
    length: 64, 
    unique: true,
    comment: 'Test code (e.g., CBC, HGB, GLU)'
  })
  code: string;

  @Column({ 
    length: 200,
    comment: 'Test name'
  })
  name: string;

  @Column({ 
    name: 'short_name',
    length: 100,
    nullable: true,
    comment: 'Short test name for displays'
  })
  shortName: string;

  @Column({ 
    type: 'text',
    nullable: true,
    comment: 'Test description and methodology'
  })
  description: string;

  @Column({ 
    length: 100,
    nullable: true,
    comment: 'Lab department (e.g., Chemistry, Hematology)'
  })
  department: string;

  @Column({ 
    length: 200,
    nullable: true,
    comment: 'Test methodology'
  })
  method: string;

  @Column({ 
    name: 'result_data_type',
    type: 'enum',
    enum: ResultDataType,
    default: ResultDataType.NUMERIC,
    comment: 'Expected result data type'
  })
  resultDataType: ResultDataType;

  @Column({ 
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Test cost/price'
  })
  cost: number;

  @Column({ 
    name: 'turnaround_time_hours',
    type: 'int',
    default: 24,
    comment: 'Expected turnaround time in hours'
  })
  turnaroundTimeHours: number;

  @Column({ 
    name: 'loinc_code',
    length: 20,
    nullable: true,
    comment: 'LOINC code for interoperability'
  })
  loincCode: string;

  @Column({ 
    name: 'specimen_type_id',
    type: 'uuid',
    nullable: true
  })
  specimenTypeId: string;

  @Column({ 
    name: 'default_unit_id',
    type: 'uuid',
    nullable: true
  })
  defaultUnitId: string;

  @Column({ 
    type: 'uuid',
    name: 'organization_id',
    nullable: true,
    comment: 'Organization this test belongs to'
  })
  organizationId: string;

  @Column({ 
    type: 'jsonb',
    nullable: true,
    comment: 'Reference ranges by age/gender'
  })
  referenceRanges: {
    ageFrom?: number;
    ageTo?: number;
    gender?: string;
    normalLow?: number;
    normalHigh?: number;
    panicLow?: number;
    panicHigh?: number;
    unit?: string;
  }[];

  @Column({ 
    type: 'jsonb',
    nullable: true,
    comment: 'Additional test metadata'
  })
  meta: {
    categories?: string[];
    synonyms?: string[];
    instructions?: string;
    criticalValues?: string;
  };

  @Column({ 
    type: 'boolean', 
    default: true,
    comment: 'Whether test is active'
  })
  isActive: boolean;

  // Relationships
  @ManyToOne(() => SpecimenType, { eager: true })
  @JoinColumn({ name: 'specimen_type_id' })
  specimenType: SpecimenType;

  @ManyToOne(() => Unit, { eager: true })
  @JoinColumn({ name: 'default_unit_id' })
  defaultUnit: Unit;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;
}