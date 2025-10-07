import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';
import { Provider } from './provider.entity';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  REQUESTED = 'requested',
  COLLECTED = 'collected',
  RECEIVED = 'received',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  VERIFIED = 'verified',
  CANCELLED = 'cancelled'
}

export enum Urgency {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  STAT = 'stat'
}

@Entity({ schema: 'lab', name: 'lab_orders' })
@Index(['orderNo'], { unique: true })
@Index(['patientId', 'requestedAt'])
@Index(['status', 'priority'])
export class Order extends BaseEntity {
  @Column({ 
    name: 'order_no',
    type: 'bigint',
    comment: 'Sequential order number'
  })
  orderNo: number;

  @Column({ 
    type: 'uuid',
    name: 'patient_id',
    comment: 'Patient this order belongs to'
  })
  patientId: string;

  @Column({ 
    type: 'uuid',
    name: 'requested_by',
    nullable: true,
    comment: 'Provider who requested the order'
  })
  requestedBy: string;

  @Column({ 
    type: 'uuid',
    name: 'requested_by_user',
    nullable: true,
    comment: 'User who created the order'
  })
  requestedByUser: string;

  @Column({ 
    name: 'requested_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'When the order was requested'
  })
  requestedAt: Date;

  @Column({ 
    name: 'clinical_history',
    type: 'text',
    nullable: true,
    comment: 'Clinical history and notes'
  })
  clinicalHistory: string;

  @Column({ 
    type: 'enum',
    enum: Urgency,
    default: Urgency.ROUTINE,
    comment: 'Order priority level'
  })
  priority: Urgency;

  @Column({ 
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.REQUESTED,
    comment: 'Current order status'
  })
  status: OrderStatus;

  @Column({ 
    name: 'collected_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'When specimens were collected'
  })
  collectedAt: Date;

  @Column({ 
    name: 'completed_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'When all tests were completed'
  })
  completedAt: Date;

  @Column({ 
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Total order amount'
  })
  totalAmount: number;

  @Column({ 
    type: 'uuid',
    name: 'organization_id',
    nullable: true,
    comment: 'Organization this order belongs to'
  })
  organizationId: string;

  @Column({ 
    type: 'jsonb',
    nullable: true,
    comment: 'Additional order metadata'
  })
  meta: {
    instructions?: string;
    notes?: string;
    externalOrderId?: string;
    referenceNumber?: string;
  };

  // Relationships
  @ManyToOne(() => Patient, { eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'requested_by' })
  provider: Provider;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by_user' })
  requestedByUserEntity: User;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  items: OrderItem[];

  // Computed properties
  get isCompleted(): boolean {
    return this.status === OrderStatus.COMPLETED || this.status === OrderStatus.VERIFIED;
  }

  get isCancelled(): boolean {
    return this.status === OrderStatus.CANCELLED;
  }

  get isPending(): boolean {
    return [OrderStatus.REQUESTED, OrderStatus.COLLECTED, OrderStatus.RECEIVED, OrderStatus.IN_PROGRESS].includes(this.status);
  }
}