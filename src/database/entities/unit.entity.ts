import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ schema: 'lab', name: 'units' })
export class Unit extends BaseEntity {
  @Column({ 
    length: 100,
    comment: 'Unit name (e.g., milligrams per deciliter)'
  })
  name: string;

  @Column({ 
    length: 50,
    unique: true,
    comment: 'Unit symbol (e.g., mg/dL, mmol/L)'
  })
  symbol: string;

  @Column({ 
    length: 50,
    nullable: true,
    comment: 'Unit category (e.g., concentration, volume, mass)'
  })
  category: string;

  @Column({ 
    type: 'decimal',
    precision: 18,
    scale: 6,
    nullable: true,
    comment: 'Conversion factor to SI units'
  })
  conversionFactor: number;

  @Column({ 
    length: 50,
    nullable: true,
    comment: 'Corresponding SI unit'
  })
  siUnit: string;

  @Column({ 
    type: 'boolean', 
    default: true,
    comment: 'Whether unit is active'
  })
  isActive: boolean;
}