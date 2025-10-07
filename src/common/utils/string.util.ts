/**
 * Utility class for string manipulation and formatting
 * Common string operations for lab system
 */
export class StringUtil {
  /**
   * Capitalize first letter of string
   */
  static capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Convert string to title case
   */
  static toTitleCase(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
  }

  /**
   * Generate random string for codes/IDs
   */
  static generateRandomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate barcode for specimens
   */
  static generateBarcode(prefix: string = 'SPEC'): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = this.generateRandomString(4);
    
    return `${prefix}-${year}${month}${day}-${random}`;
  }

  /**
   * Generate order number
   */
  static generateOrderNumber(prefix: string = 'LAB'): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = this.generateRandomString(3);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Format patient name for display
   */
  static formatPatientName(firstName: string, lastName: string): string {
    if (!firstName && !lastName) return 'Unknown Patient';
    if (!firstName) return this.toTitleCase(lastName);
    if (!lastName) return this.toTitleCase(firstName);
    
    return `${this.toTitleCase(firstName)} ${this.toTitleCase(lastName)}`;
  }

  /**
   * Generate Medical Record Number (MRN)
   */
  static generateMRN(orgCode: string = 'LAB'): string {
    const date = new Date();
    const year = date.getFullYear().toString();
    const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    return `${orgCode}-${year}-${sequence}`;
  }

  /**
   * Sanitize string for database storage
   */
  static sanitize(str: string): string {
    if (!str) return '';
    return str.trim().replace(/\s+/g, ' ');
  }

  /**
   * Truncate string with ellipsis
   */
  static truncate(str: string, maxLength: number = 50): string {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }

  /**
   * Remove special characters for search
   */
  static normalizeForSearch(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Check if string is valid email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if string is valid phone number
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Format phone number for display
   */
  static formatPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone;
  }

  /**
   * Generate initials from name
   */
  static getInitials(firstName: string, lastName: string): string {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last;
  }

  /**
   * Mask sensitive information
   */
  static maskString(str: string, visibleChars: number = 4): string {
    if (!str || str.length <= visibleChars) return str;
    const visible = str.slice(-visibleChars);
    const masked = '*'.repeat(str.length - visibleChars);
    return masked + visible;
  }

  /**
   * Calculate string similarity (for duplicate detection)
   */
  static similarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    
    const normalize = (s: string) => this.normalizeForSearch(s);
    const s1 = normalize(str1);
    const s2 = normalize(str2);
    
    if (s1 === s2) return 1;
    
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = this.levenshteinDistance(s1, s2);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}