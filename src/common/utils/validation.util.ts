import { ValidationOptions, registerDecorator, ValidationArguments } from 'class-validator';
import { StringUtil } from './string.util';

/**
 * Utility class for custom validation operations
 * Lab-specific validation helpers
 */
export class ValidationUtil {
  /**
   * Validate Medical Record Number format
   */
  static isValidMRN(mrn: string): boolean {
    if (!mrn) return false;
    // Format: ORG-YYYY-NNNN (e.g., LAB-2024-0001)
    const mrnRegex = /^[A-Z]{2,5}-\d{4}-\d{3,6}$/;
    return mrnRegex.test(mrn);
  }

  /**
   * Validate specimen barcode format
   */
  static isValidBarcode(barcode: string): boolean {
    if (!barcode) return false;
    // Format: SPEC-YYMMDD-AAAA (e.g., SPEC-241007-A1B2)
    const barcodeRegex = /^[A-Z]{3,5}-\d{6}-[A-Z0-9]{4}$/;
    return barcodeRegex.test(barcode);
  }

  /**
   * Validate order number format
   */
  static isValidOrderNumber(orderNumber: string): boolean {
    if (!orderNumber) return false;
    // Format: LAB-NNNNNNNN-AAA (e.g., LAB-12345678-ABC)
    const orderRegex = /^[A-Z]{2,5}-\d{6,10}-[A-Z0-9]{3}$/;
    return orderRegex.test(orderNumber);
  }

  /**
   * Validate Indonesian National ID (NIK)
   */
  static isValidNIK(nik: string): boolean {
    if (!nik) return false;
    // NIK should be 16 digits
    const nikRegex = /^\d{16}$/;
    return nikRegex.test(nik);
  }

  /**
   * Validate Indonesian phone number
   */
  static isValidIndonesianPhone(phone: string): boolean {
    if (!phone) return false;
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Indonesian phone patterns
    const patterns = [
      /^08\d{8,11}$/,    // Mobile: 08xx-xxxx-xxxx
      /^628\d{8,11}$/,   // International mobile: +628xx-xxxx-xxxx
      /^021\d{7,8}$/,    // Jakarta landline
      /^0\d{2,3}\d{6,8}$/, // Other area codes
    ];
    
    return patterns.some(pattern => pattern.test(cleaned));
  }

  /**
   * Validate age range for lab tests
   */
  static isValidAge(age: number, minAge: number = 0, maxAge: number = 150): boolean {
    return age >= minAge && age <= maxAge && Number.isInteger(age);
  }

  /**
   * Validate numeric range for lab results
   */
  static isInRange(value: number, min?: number, max?: number): boolean {
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  }

  /**
   * Validate password strength
   */
  static isStrongPassword(password: string): boolean {
    if (!password || password.length < 8) return false;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  /**
   * Validate lab test code format
   */
  static isValidTestCode(code: string): boolean {
    if (!code) return false;
    // Test codes should be 2-10 alphanumeric characters
    const codeRegex = /^[A-Z0-9]{2,10}$/;
    return codeRegex.test(code.toUpperCase());
  }

  /**
   * Validate specimen volume
   */
  static isValidVolume(volume: number, minVolume: number = 0.1, maxVolume: number = 100): boolean {
    return volume > 0 && volume >= minVolume && volume <= maxVolume;
  }

  /**
   * Validate reference range format
   */
  static isValidReferenceRange(range: string): boolean {
    if (!range) return false;
    // Formats: "10-50", "<10", ">100", "Negative", "Positive"
    const patterns = [
      /^\d+(\.\d+)?-\d+(\.\d+)?$/,  // Range: 10-50
      /^<\d+(\.\d+)?$/,             // Less than: <10
      /^>\d+(\.\d+)?$/,             // Greater than: >100
      /^[A-Za-z]+$/,                // Text: Negative, Positive
    ];
    
    return patterns.some(pattern => pattern.test(range.trim()));
  }

  /**
   * Validate email with additional lab-specific rules
   */
  static isValidLabEmail(email: string): boolean {
    if (!StringUtil.isValidEmail(email)) return false;
    
    // Additional lab-specific rules
    const domain = email.split('@')[1];
    if (!domain) return false;
    
    // Block common temporary email domains
    const blockedDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
    return !blockedDomains.includes(domain.toLowerCase());
  }

  /**
   * Validate specimen collection time
   */
  static isValidCollectionTime(collectionTime: Date): boolean {
    const now = new Date();
    const maxFutureHours = 1; // Allow 1 hour in future for timezone differences
    const maxPastDays = 7;    // Don't allow specimens older than 7 days
    
    const futureLimit = new Date(now.getTime() + maxFutureHours * 60 * 60 * 1000);
    const pastLimit = new Date(now.getTime() - maxPastDays * 24 * 60 * 60 * 1000);
    
    return collectionTime <= futureLimit && collectionTime >= pastLimit;
  }

  /**
   * Validate critical value thresholds
   */
  static isValidCriticalValue(value: number, panicLow?: number, panicHigh?: number): {
    isCritical: boolean;
    level: 'normal' | 'critical_low' | 'critical_high';
  } {
    if (panicLow !== undefined && value <= panicLow) {
      return { isCritical: true, level: 'critical_low' };
    }
    
    if (panicHigh !== undefined && value >= panicHigh) {
      return { isCritical: true, level: 'critical_high' };
    }
    
    return { isCritical: false, level: 'normal' };
  }

  /**
   * Sanitize and validate file names for lab reports
   */
  static sanitizeFileName(fileName: string): string {
    if (!fileName) return '';
    
    // Remove dangerous characters and normalize
    return fileName
      .replace(/[^a-zA-Z0-9.-_]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 100); // Limit length
  }

  /**
   * Validate decimal precision for lab results
   */
  static hasValidPrecision(value: number, maxDecimals: number = 3): boolean {
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    return decimalPlaces <= maxDecimals;
  }
}

/**
 * Custom validation decorators for class-validator
 */

/**
 * Validates MRN format
 */
export function IsValidMRN(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidMRN',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' && ValidationUtil.isValidMRN(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid MRN format (e.g., LAB-2024-0001)`;
        },
      },
    });
  };
}

/**
 * Validates barcode format
 */
export function IsValidBarcode(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidBarcode',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' && ValidationUtil.isValidBarcode(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid barcode format (e.g., SPEC-241007-A1B2)`;
        },
      },
    });
  };
}

/**
 * Validates Indonesian phone number
 */
export function IsIndonesianPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isIndonesianPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' && ValidationUtil.isValidIndonesianPhone(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Indonesian phone number`;
        },
      },
    });
  };
}

/**
 * Validates strong password
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' && ValidationUtil.isStrongPassword(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must contain at least 8 characters with uppercase, lowercase, number and special character`;
        },
      },
    });
  };
}