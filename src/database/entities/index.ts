// Base Entity
export { BaseEntity } from './base.entity';

// Core Entities
export { User } from './user.entity';
export { Organization } from './organization.entity';
export { Patient, Gender } from './patient.entity';
export { Provider } from './provider.entity';

// Test Catalog Entities
export { Test, ResultDataType } from './test.entity';
export { SpecimenType } from './specimen-type.entity';
export { Unit } from './unit.entity';

// Lab Workflow Entities
export { Order, OrderStatus, Urgency } from './order.entity';
export { OrderItem, OrderItemStatus } from './order-item.entity';
export { Specimen, SpecimenStatus } from './specimen.entity';
export { TestResult, ResultStatus, ResultFlag } from './test-result.entity';

// Import for TypeORM configuration
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { Patient } from './patient.entity';
import { Provider } from './provider.entity';
import { Test } from './test.entity';
import { SpecimenType } from './specimen-type.entity';
import { Unit } from './unit.entity';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Specimen } from './specimen.entity';
import { TestResult } from './test-result.entity';

// Array of all entities for TypeORM configuration
export const ENTITIES = [
  // Core
  User,
  Organization,
  Patient,
  Provider,
  
  // Catalog
  Test,
  SpecimenType,
  Unit,
  
  // Workflow
  Order,
  OrderItem,
  Specimen,
  TestResult,
];