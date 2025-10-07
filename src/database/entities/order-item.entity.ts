import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Order } from './order.entity';
import { Test } from './test.entity';

export enum OrderItemStatus {
  REQUESTED = 'requested',
  COLLECTED = 'collected',
  RECEIVED = 'received',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  VERIFIED = 'verified',
  CANCELLED = 'cancelled'
}

@Entity({ schema: 'lab', name: 'order_items' })
@Index(['orderId', 'testId'])
@Index(['status'])
export class OrderItem extends BaseEntity {
  @Column({ 
    type: 'uuid',
    name: 'order_id',
    comment: 'Order this item belongs to'
  })
  orderId: string;

  @Column({ 
    type: 'uuid',
    name: 'test_id',
    comment: 'Test to be performed'
  })
  testId: string;

  @Column({ 
    type: 'enum',
    enum: OrderItemStatus,
    default: OrderItemStatus.REQUESTED,
    comment: 'Current item status'
  })
  status: OrderItemStatus;

  @Column({ 
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Price for this test'
  })
  price: number;

  @Column({ 
    name: 'collected_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'When specimen was collected for this test'
  })
  collectedAt: Date;

  @Column({ 
    name: 'completed_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'When this test was completed'
  })
  completedAt: Date;

  @Column({ 
    name: 'verified_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'When this test result was verified'
  })
  verifiedAt: Date;

  @Column({ 
    type: 'jsonb',
    nullable: true,
    comment: 'Additional item metadata'
  })
  meta: {
    notes?: string;
    technicianNotes?: string;
    specialInstructions?: string;
  };

  // Relationships
  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Test, { eager: true })
  @JoinColumn({ name: 'test_id' })
  test: Test;

  // Computed properties
  get isCompleted(): boolean {
    return this.status === OrderItemStatus.COMPLETED || this.status === OrderItemStatus.VERIFIED;
  }

  get isCancelled(): boolean {
    return this.status === OrderItemStatus.CANCELLED;
  }

  get isPending(): boolean {
    return [OrderItemStatus.REQUESTED, OrderItemStatus.COLLECTED, OrderItemStatus.RECEIVED, OrderItemStatus.IN_PROGRESS].includes(this.status);
  }
}