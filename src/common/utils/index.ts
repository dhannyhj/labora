import { ApiResponse, PaginatedResponse } from '../interfaces';

/**
 * Utility functions untuk response API
 */
export class ResponseUtil {
  static success<T>(data?: T, message = 'Success'): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error(message: string, error?: string): ApiResponse {
    return {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString()
    };
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResponse<T> {
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}

/**
 * Utility functions untuk string operations
 */
export class StringUtil {
  static generateCode(prefix: string, length = 6): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, length);
    return `${prefix}-${timestamp.slice(-4)}-${random.toUpperCase()}`;
  }

  static generateBarcode(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `LAB${timestamp}${random}`;
  }

  static formatPatientNumber(id: number): string {
    return `PAT${id.toString().padStart(6, '0')}`;
  }

  static formatOrderNumber(id: number): string {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `ORD${year}${month}${day}${id.toString().padStart(4, '0')}`;
  }

  static sanitizeString(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
  }
}

/**
 * Utility functions untuk date operations
 */
export class DateUtil {
  static formatDate(date: Date, format = 'DD/MM/YYYY'): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year.toString());
  }

  static formatDateTime(date: Date): string {
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  static calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  static isValidAge(birthDate: Date): boolean {
    const age = this.calculateAge(birthDate);
    return age >= 0 && age <= 150;
  }
}

/**
 * Utility functions untuk validasi
 */
export class ValidationUtil {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    // Indonesian phone number format
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
  }

  static isValidBarcode(barcode: string): boolean {
    // Labora barcode format: LAB + 13 digits
    const barcodeRegex = /^LAB\d{13}$/;
    return barcodeRegex.test(barcode);
  }

  static sanitizePhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\s|-|\(|\)/g, '');
    
    // Convert to +62 format
    if (cleaned.startsWith('0')) {
      cleaned = '+62' + cleaned.substring(1);
    } else if (cleaned.startsWith('62')) {
      cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+62')) {
      cleaned = '+62' + cleaned;
    }
    
    return cleaned;
  }
}

/**
 * Utility functions untuk lab calculations
 */
export class LabUtil {
  static isValueInRange(value: number, normalRange: string): boolean {
    if (!normalRange) return true;
    
    // Parse range formats like "3.5-5.0", "<10", ">15", etc.
    const rangeRegex = /^(<|>|<=|>=)?(\d+\.?\d*)-?(\d+\.?\d*)?$/;
    const match = normalRange.match(rangeRegex);
    
    if (!match) return true;
    
    const [, operator, min, max] = match;
    
    if (operator) {
      const threshold = parseFloat(min);
      switch (operator) {
        case '<': return value < threshold;
        case '>': return value > threshold;
        case '<=': return value <= threshold;
        case '>=': return value >= threshold;
      }
    }
    
    if (max) {
      return value >= parseFloat(min) && value <= parseFloat(max);
    }
    
    return true;
  }

  static determineCriticalFlag(value: number, normalRange: string, criticalValues?: string): boolean {
    if (!criticalValues) return false;
    
    // Implement critical value logic
    // This could be extended based on specific lab requirements
    const criticalRegex = /(<|>)(\d+\.?\d*)/g;
    let match;
    
    while ((match = criticalRegex.exec(criticalValues)) !== null) {
      const [, operator, threshold] = match;
      const thresholdValue = parseFloat(threshold);
      
      if (operator === '<' && value < thresholdValue) return true;
      if (operator === '>' && value > thresholdValue) return true;
    }
    
    return false;
  }

  static calculateTAT(startTime: Date, endTime: Date): number {
    // Calculate Turn Around Time in hours
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
  }
}