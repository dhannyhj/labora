import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ schema: 'lab', name: 'specimen_types' })
export class SpecimenType extends BaseEntity {
  @Column({ 
    length: 50, 
    unique: true,
    comment: 'Specimen type code (e.g., BLOOD, URINE)'
  })
  code: string;

  @Column({ 
    length: 200,
    comment: 'Specimen type name'
  })
  name: string;

  @Column({ 
    type: 'text',
    nullable: true,
    comment: 'Specimen type description'
  })
  description: string;

  @Column({ 
    length: 100,
    nullable: true,
    comment: 'Default container type'
  })
  defaultContainer: string;

  @Column({ 
    type: 'jsonb',
    nullable: true,
    comment: 'Collection and handling requirements'
  })
  requirements: {
    volumeMin?: number;
    volumeMax?: number;
    temperatureStorage?: string;
    preservative?: string;
    transportTime?: string;
    handlingInstructions?: string[];
  };

  @Column({ 
    type: 'boolean', 
    default: true,
    comment: 'Whether specimen type is active'
  })
  isActive: boolean;
}