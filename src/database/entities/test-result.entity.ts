import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { OrderItem } from './order-item.entity';
import { Specimen } from './specimen.entity';
import { Unit } from './unit.entity';
import { User } from './user.entity';

export enum ResultStatus {
  PRELIMINARY = 'preliminary',
  FINAL = 'final',
  AMENDED = 'amended'
}

export enum ResultFlag {
  NORMAL = '',
  HIGH = 'H',
  LOW = 'L',
  CRITICAL_HIGH = 'HH',
  CRITICAL_LOW = 'LL',
  CRITICAL = 'CC'
}

@Entity({ schema: 'lab', name: 'test_results' })
@Index(['orderItemId'])
@Index(['specimenId'])
@Index(['status'])
@Index(['reportedAt'])
export class TestResult extends BaseEntity {
  @Column({ 
    type: 'uuid',
    name: 'order_item_id',
    nullable: true,
    comment: 'Order item this result belongs to'
  })
  orderItemId: string;

  @Column({ 
    type: 'uuid',
    name: 'specimen_id',
    nullable: true,
    comment: 'Specimen this result was obtained from'
  })
  specimenId: string;

  @Column({ 
    type: 'uuid',
    name: 'analyzer_id',
    nullable: true,
    comment: 'User/analyzer that produced the result'
  })
  analyzerId: string;

  @Column({ 
    name: 'value_text',
    type: 'text',
    nullable: true,
    comment: 'Text result value'
  })
  valueText: string;

  @Column({ 
    name: 'value_numeric',
    type: 'decimal',
    precision: 18,
    scale: 6,
    nullable: true,
    comment: 'Numeric result value'
  })
  valueNumeric: number;

  @Column({ 
    name: 'value_json',
    type: 'jsonb',
    nullable: true,
    comment: 'Structured result data'
  })
  valueJson: any;

  @Column({ 
    type: 'uuid',
    name: 'unit_id',
    nullable: true,
    comment: 'Unit of measurement'
  })
  unitId: string;

  @Column({ 
    name: 'reference_range',
    type: 'text',
    nullable: true,
    comment: 'Reference range for this result'
  })
  referenceRange: string;

  @Column({ 
    type: 'varchar',
    length: 2,
    nullable: true,
    comment: 'Result flag (H/L/HH/LL/CC)'
  })
  flag: string;

  @Column({ 
    type: 'enum',
    enum: ResultStatus,
    default: ResultStatus.PRELIMINARY,
    comment: 'Result verification status'
  })
  status: ResultStatus;

  @Column({ 
    type: 'text',
    nullable: true,
    comment: 'Comments about the result'
  })
  comments: string;

  @Column({ 
    name: 'reported_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'When the result was reported'
  })
  reportedAt: Date;

  @Column({ 
    type: 'uuid',
    name: 'reported_by',
    nullable: true,
    comment: 'User who reported the result'
  })
  reportedBy: string;

  @Column({ 
    name: 'verified_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'When the result was verified'
  })
  verifiedAt: Date;

  @Column({ 
    type: 'uuid',
    name: 'verified_by',
    nullable: true,
    comment: 'User who verified the result'
  })
  verifiedBy: string;

  @Column({ 
    name: 'reference_low',
    type: 'decimal',
    precision: 18,
    scale: 6,
    nullable: true,
    comment: 'Lower reference limit'
  })
  referenceLow: number;

  @Column({ 
    name: 'reference_high',
    type: 'decimal',
    precision: 18,
    scale: 6,
    nullable: true,
    comment: 'Upper reference limit'
  })
  referenceHigh: number;

  @Column({ 
    name: 'panic_low',
    type: 'decimal',
    precision: 18,
    scale: 6,
    nullable: true,
    comment: 'Lower panic/critical limit'
  })
  panicLow: number;

  @Column({ 
    name: 'panic_high',
    type: 'decimal',
    precision: 18,
    scale: 6,
    nullable: true,
    comment: 'Upper panic/critical limit'
  })
  panicHigh: number;

  @Column({ 
    type: 'jsonb',
    nullable: true,
    comment: 'Additional result metadata'
  })
  meta: {
    methodUsed?: string;
    instrumentUsed?: string;
    qualityFlags?: string[];
    deltaCheck?: {
      previousValue?: number;
      previousDate?: string;
      percentChange?: number;
    };
    technicalNotes?: string;
  };

  // Relationships
  @ManyToOne(() => OrderItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @ManyToOne(() => Specimen)
  @JoinColumn({ name: 'specimen_id' })
  specimen: Specimen;

  @ManyToOne(() => Unit, { eager: true })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by' })
  reportedByUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'verified_by' })
  verifiedByUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'analyzer_id' })
  analyzer: User;

  // Computed properties
  get isVerified(): boolean {
    return this.status === ResultStatus.FINAL || this.status === ResultStatus.AMENDED;
  }

  get isPreliminary(): boolean {
    return this.status === ResultStatus.PRELIMINARY;
  }

  get isCritical(): boolean {
    return this.flag === ResultFlag.CRITICAL || 
           this.flag === ResultFlag.CRITICAL_HIGH || 
           this.flag === ResultFlag.CRITICAL_LOW;
  }

  get isAbnormal(): boolean {
    return this.flag && this.flag !== ResultFlag.NORMAL;
  }

  get displayValue(): string {
    if (this.valueNumeric !== null && this.valueNumeric !== undefined) {
      return `${this.valueNumeric}${this.unit?.symbol || ''}`;
    }
    return this.valueText || '';
  }

  get interpretationFlag(): string {
    switch (this.flag) {
      case ResultFlag.HIGH:
        return 'High';
      case ResultFlag.LOW:
        return 'Low';
      case ResultFlag.CRITICAL_HIGH:
        return 'Critical High';
      case ResultFlag.CRITICAL_LOW:
        return 'Critical Low';
      case ResultFlag.CRITICAL:
        return 'Critical';
      default:
        return 'Normal';
    }
  }
}