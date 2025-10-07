import { format, parseISO, differenceInYears, differenceInDays, differenceInHours, addDays, addHours, startOfDay, endOfDay, isValid } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

/**
 * Utility class for date manipulation and formatting
 * Lab-specific date operations with timezone support
 */
export class DateUtil {
  /**
   * Format date for display in Indonesian locale
   */
  static formatDate(date: Date | string, pattern: string = 'dd/MM/yyyy'): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      return format(dateObj, pattern, { locale: localeId });
    } catch {
      return '';
    }
  }

  /**
   * Format date and time for display
   */
  static formatDateTime(date: Date | string, pattern: string = 'dd/MM/yyyy HH:mm'): string {
    return this.formatDate(date, pattern);
  }

  /**
   * Format time only
   */
  static formatTime(date: Date | string, pattern: string = 'HH:mm'): string {
    return this.formatDate(date, pattern);
  }

  /**
   * Get current timestamp in ISO format
   */
  static now(): string {
    return new Date().toISOString();
  }

  /**
   * Get current date without time
   */
  static today(): Date {
    return startOfDay(new Date());
  }

  /**
   * Calculate age from birth date
   */
  static calculateAge(birthDate: Date | string): number {
    try {
      const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
      if (!isValid(birth)) return 0;
      return differenceInYears(new Date(), birth);
    } catch {
      return 0;
    }
  }

  /**
   * Calculate age with detailed breakdown
   */
  static calculateDetailedAge(birthDate: Date | string): {
    years: number;
    months: number;
    days: number;
    totalDays: number;
  } {
    try {
      const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
      const now = new Date();
      
      if (!isValid(birth)) {
        return { years: 0, months: 0, days: 0, totalDays: 0 };
      }

      const years = differenceInYears(now, birth);
      const afterYears = addDays(birth, years * 365);
      const months = Math.floor(differenceInDays(now, afterYears) / 30);
      const afterMonths = addDays(afterYears, months * 30);
      const days = differenceInDays(now, afterMonths);
      const totalDays = differenceInDays(now, birth);

      return { years, months, days, totalDays };
    } catch {
      return { years: 0, months: 0, days: 0, totalDays: 0 };
    }
  }

  /**
   * Format age for display
   */
  static formatAge(birthDate: Date | string): string {
    const age = this.calculateDetailedAge(birthDate);
    
    if (age.years > 0) {
      return `${age.years} tahun`;
    } else if (age.totalDays > 30) {
      return `${Math.floor(age.totalDays / 30)} bulan`;
    } else {
      return `${age.totalDays} hari`;
    }
  }

  /**
   * Check if date is today
   */
  static isToday(date: Date | string): boolean {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      const today = new Date();
      return this.formatDate(dateObj, 'yyyy-MM-dd') === this.formatDate(today, 'yyyy-MM-dd');
    } catch {
      return false;
    }
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date | string): boolean {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return dateObj < new Date();
    } catch {
      return false;
    }
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date | string): boolean {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return dateObj > new Date();
    } catch {
      return false;
    }
  }

  /**
   * Get start of day
   */
  static startOfDay(date: Date | string): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return startOfDay(dateObj);
  }

  /**
   * Get end of day
   */
  static endOfDay(date: Date | string): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return endOfDay(dateObj);
  }

  /**
   * Add days to date
   */
  static addDays(date: Date | string, days: number): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return addDays(dateObj, days);
  }

  /**
   * Add hours to date
   */
  static addHours(date: Date | string, hours: number): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return addHours(dateObj, hours);
  }

  /**
   * Calculate time difference in hours
   */
  static hoursDifference(date1: Date | string, date2: Date | string): number {
    try {
      const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
      const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
      return differenceInHours(d2, d1);
    } catch {
      return 0;
    }
  }

  /**
   * Calculate time difference in days
   */
  static daysDifference(date1: Date | string, date2: Date | string): number {
    try {
      const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
      const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
      return differenceInDays(d2, d1);
    } catch {
      return 0;
    }
  }

  /**
   * Get relative time string (e.g., "2 hours ago")
   */
  static getRelativeTime(date: Date | string): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));

      if (diffMinutes < 1) return 'Baru saja';
      if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} jam yang lalu`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} hari yang lalu`;
      
      const diffWeeks = Math.floor(diffDays / 7);
      if (diffWeeks < 4) return `${diffWeeks} minggu yang lalu`;
      
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths < 12) return `${diffMonths} bulan yang lalu`;
      
      const diffYears = Math.floor(diffDays / 365);
      return `${diffYears} tahun yang lalu`;
    } catch {
      return '';
    }
  }

  /**
   * Parse date string safely
   */
  static parseDate(dateString: string): Date | null {
    try {
      const parsed = parseISO(dateString);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  /**
   * Get date range for queries (start and end of day)
   */
  static getDateRange(date: Date | string): { start: Date; end: Date } {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return {
      start: startOfDay(dateObj),
      end: endOfDay(dateObj),
    };
  }

  /**
   * Check if date is within business hours (for lab operations)
   */
  static isBusinessHours(date: Date | string, startHour: number = 8, endHour: number = 17): boolean {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      const hour = dateObj.getHours();
      return hour >= startHour && hour < endHour;
    } catch {
      return false;
    }
  }

  /**
   * Get business days between two dates
   */
  static getBusinessDays(startDate: Date | string, endDate: Date | string): number {
    try {
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
      
      let businessDays = 0;
      const currentDate = new Date(start);
      
      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
          businessDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return businessDays;
    } catch {
      return 0;
    }
  }

  /**
   * Format date for filename (safe characters only)
   */
  static formatForFilename(date: Date | string = new Date()): string {
    return this.formatDate(date, 'yyyy-MM-dd_HH-mm-ss');
  }

  /**
   * Get timezone offset string
   */
  static getTimezoneOffset(): string {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset <= 0 ? '+' : '-';
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}