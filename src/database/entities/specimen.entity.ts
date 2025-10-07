import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { OrderItem } from './order-item.entity';
import { SpecimenType } from './specimen-type.entity';
import { User } from './user.entity';

export enum SpecimenStatus {
  COLLECTED = 'collected',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  REJECTED = 'rejected',
  STORED = 'stored',
  CONSUMED = 'consumed'
}

@Entity({ schema: 'lab', name: 'specimens' })
@Index(['barcode'], { unique: true })
@Index(['orderItemId'])
@Index(['collectedAt'])
export class Specimen extends BaseEntity {
  @Column({ 
    length: 128,
    unique: true,
    comment: 'Unique specimen barcode'
  })
  barcode: string;

  @Column({ 
    type: 'uuid',
    name: 'order_item_id',
    comment: 'Order item this specimen belongs to'
  })
  orderItemId: string;

  @Column({ 
    type: 'uuid',
    name: 'specimen_type_id',
    nullable: true,
    comment: 'Type of specimen'
  })
  specimenTypeId: string;

  @Column({ 
    name: 'collected_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'When the specimen was collected'
  })
  collectedAt: Date;

  @Column({ 
    type: 'uuid',
    name: 'collected_by',
    nullable: true,
    comment: 'User who collected the specimen'
  })
  collectedBy: string;

  @Column({ 
    length: 100,
    nullable: true,
    comment: 'Container type used'
  })
  container: string;

  @Column({ 
    name: 'volume_ml',
    type: 'decimal',
    precision: 8,
    scale: 3,
    nullable: true,
    comment: 'Specimen volume in milliliters'
  })
  volumeMl: number;

  @Column({ 
    name: 'storage_location',
    length: 200,
    nullable: true,
    comment: 'Where the specimen is stored'
  })
  storageLocation: string;

  @Column({ 
    type: 'enum',
    enum: SpecimenStatus,
    default: SpecimenStatus.COLLECTED,
    comment: 'Current specimen status'
  })
  status: SpecimenStatus;

  @Column({ 
    name: 'received_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'When the specimen was received in lab'
  })
  receivedAt: Date;

  @Column({ 
    type: 'uuid',
    name: 'received_by',
    nullable: true,
    comment: 'User who received the specimen'
  })
  receivedBy: string;

  @Column({ 
    name: 'rejected_reason',
    type: 'text',
    nullable: true,
    comment: 'Reason for specimen rejection'
  })
  rejectedReason: string;

  @Column({ 
    name: 'temperature_c',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Storage temperature in Celsius'
  })
  temperatureC: number;

  @Column({ 
    type: 'jsonb',
    nullable: true,
    comment: 'Additional specimen metadata'
  })
  meta: {
    qualityIssues?: string[];
    handlingNotes?: string;
    transportConditions?: string;
    preservatives?: string[];
    expiryDate?: string;
  };

  // Relationships
  @ManyToOne(() => OrderItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @ManyToOne(() => SpecimenType, { eager: true })
  @JoinColumn({ name: 'specimen_type_id' })
  specimenType: SpecimenType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'collected_by' })
  collectedByUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'received_by' })
  receivedByUser: User;

  // Computed properties
  get isRejected(): boolean {
    return this.status === SpecimenStatus.REJECTED;
  }

  get isAvailable(): boolean {
    return [SpecimenStatus.RECEIVED, SpecimenStatus.STORED].includes(this.status);
  }

  get isConsumed(): boolean {
    return this.status === SpecimenStatus.CONSUMED;
  }

  get ageInHours(): number {
    if (!this.collectedAt) return 0;
    const now = new Date();
    const collected = new Date(this.collectedAt);
    return Math.floor((now.getTime() - collected.getTime()) / (1000 * 60 * 60));
  }
}