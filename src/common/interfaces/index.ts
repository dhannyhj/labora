/**
 * Common interfaces untuk Labora Clinical Lab System
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface UserJwtPayload {
  sub: string;
  username: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface AuditLog {
  entityTable: string;
  entityId: string;
  action: string;
  changedBy?: string;
  changedAt: Date;
  change: any;
}

// Lab-specific interfaces
export interface LabTest {
  id: string;
  code: string;
  name: string;
  category: string;
  normalRange?: string;
  unit?: string;
  price: number;
}

export interface Patient {
  id: string;
  patientNumber: string;
  fullName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'unknown';
  phone?: string;
  email?: string;
  address?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  patientId: string;
  doctorName?: string;
  status: 'requested' | 'collected' | 'received' | 'in_progress' | 'completed' | 'verified' | 'cancelled';
  urgency: 'routine' | 'urgent' | 'stat';
  createdAt: Date;
}

export interface Specimen {
  id: string;
  barcode: string;
  orderId: string;
  specimenType: string;
  collectedAt?: Date;
  status: 'collected' | 'in_transit' | 'received' | 'rejected' | 'stored' | 'consumed';
}

export interface TestResult {
  id: string;
  orderItemId: string;
  value?: string;
  numericValue?: number;
  unit?: string;
  normalRange?: string;
  isAbnormal: boolean;
  isCritical: boolean;
  status: 'preliminary' | 'final' | 'amended';
}