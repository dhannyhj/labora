import { DateUtil } from './date.util';
import { StringUtil } from './string.util';
import { ValidationUtil } from './validation.util';

/**
 * Utility class for lab-specific calculations and operations
 * Business logic helpers for clinical laboratory operations
 */
export class LabUtil {
  /**
   * Calculate Turnaround Time (TAT) in hours
   */
  static calculateTAT(
    collectedAt: Date | string,
    completedAt: Date | string,
    excludeWeekends: boolean = true
  ): {
    hours: number;
    businessHours: number;
    status: 'on-time' | 'delayed' | 'critical-delay';
  } {
    const hours = DateUtil.hoursDifference(collectedAt, completedAt);
    
    let businessHours = hours;
    if (excludeWeekends) {
      const days = DateUtil.getBusinessDays(collectedAt, completedAt);
      businessHours = days * 8; // 8 business hours per day
    }

    let status: 'on-time' | 'delayed' | 'critical-delay' = 'on-time';
    if (businessHours > 48) status = 'critical-delay';
    else if (businessHours > 24) status = 'delayed';

    return { hours, businessHours, status };
  }

  /**
   * Calculate Z-Score for Quality Control
   */
  static calculateZScore(
    measuredValue: number,
    targetMean: number,
    standardDeviation: number
  ): {
    zScore: number;
    isInControl: boolean;
    violationLevel: 'none' | 'warning' | 'out-of-control';
  } {
    if (standardDeviation === 0) {
      return { zScore: 0, isInControl: true, violationLevel: 'none' };
    }

    const zScore = (measuredValue - targetMean) / standardDeviation;
    const absZScore = Math.abs(zScore);

    let isInControl = true;
    let violationLevel: 'none' | 'warning' | 'out-of-control' = 'none';

    if (absZScore > 3) {
      isInControl = false;
      violationLevel = 'out-of-control';
    } else if (absZScore > 2) {
      violationLevel = 'warning';
    }

    return { zScore: Number(zScore.toFixed(3)), isInControl, violationLevel };
  }

  /**
   * Determine result flag based on reference ranges
   */
  static determineResultFlag(
    value: number,
    referenceLow?: number,
    referenceHigh?: number,
    panicLow?: number,
    panicHigh?: number
  ): {
    flag: 'N' | 'H' | 'L' | 'HH' | 'LL';
    interpretation: string;
    isCritical: boolean;
  } {
    // Check critical values first
    if (panicLow !== undefined && value <= panicLow) {
      return { flag: 'LL', interpretation: 'Critical Low', isCritical: true };
    }
    if (panicHigh !== undefined && value >= panicHigh) {
      return { flag: 'HH', interpretation: 'Critical High', isCritical: true };
    }

    // Check normal ranges
    if (referenceLow !== undefined && value < referenceLow) {
      return { flag: 'L', interpretation: 'Low', isCritical: false };
    }
    if (referenceHigh !== undefined && value > referenceHigh) {
      return { flag: 'H', interpretation: 'High', isCritical: false };
    }

    return { flag: 'N', interpretation: 'Normal', isCritical: false };
  }

  /**
   * Calculate delta check (comparison with previous result)
   */
  static calculateDeltaCheck(
    currentValue: number,
    previousValue: number,
    deltaThreshold: number = 20 // percentage
  ): {
    percentChange: number;
    absoluteChange: number;
    isDeltaAlert: boolean;
    direction: 'increased' | 'decreased' | 'stable';
  } {
    if (previousValue === 0) {
      return {
        percentChange: 0,
        absoluteChange: currentValue,
        isDeltaAlert: currentValue !== 0,
        direction: 'stable',
      };
    }

    const absoluteChange = currentValue - previousValue;
    const percentChange = (absoluteChange / previousValue) * 100;
    const isDeltaAlert = Math.abs(percentChange) > deltaThreshold;

    let direction: 'increased' | 'decreased' | 'stable' = 'stable';
    if (percentChange > 5) direction = 'increased';
    else if (percentChange < -5) direction = 'decreased';

    return {
      percentChange: Number(percentChange.toFixed(2)),
      absoluteChange: Number(absoluteChange.toFixed(3)),
      isDeltaAlert,
      direction,
    };
  }

  /**
   * Calculate specimen age and quality status
   */
  static evaluateSpecimenQuality(
    collectedAt: Date | string,
    specimenType: string,
    temperatureC?: number
  ): {
    ageInHours: number;
    qualityStatus: 'optimal' | 'acceptable' | 'degraded' | 'rejected';
    recommendations: string[];
  } {
    const ageInHours = DateUtil.hoursDifference(collectedAt, new Date());
    const recommendations: string[] = [];

    // Define specimen stability limits (hours at room temperature)
    const stabilityLimits: Record<string, number> = {
      blood: 24,
      serum: 48,
      plasma: 48,
      urine: 24,
      stool: 4,
      csf: 1,
    };

    const maxStableHours = stabilityLimits[specimenType.toLowerCase()] || 24;
    
    let qualityStatus: 'optimal' | 'acceptable' | 'degraded' | 'rejected' = 'optimal';

    // Age-based quality assessment
    if (ageInHours > maxStableHours * 2) {
      qualityStatus = 'rejected';
      recommendations.push('Specimen too old - request new collection');
    } else if (ageInHours > maxStableHours) {
      qualityStatus = 'degraded';
      recommendations.push('Specimen stability compromised - interpret with caution');
    } else if (ageInHours > maxStableHours * 0.8) {
      qualityStatus = 'acceptable';
      recommendations.push('Process specimen promptly');
    }

    // Temperature-based assessment
    if (temperatureC !== undefined) {
      if (temperatureC > 25) {
        if (qualityStatus === 'optimal') qualityStatus = 'acceptable';
        recommendations.push('Specimen exposed to high temperature');
      }
      if (temperatureC < 2) {
        if (qualityStatus === 'optimal') qualityStatus = 'acceptable';
        recommendations.push('Specimen may have been frozen');
      }
    }

    return { ageInHours, qualityStatus, recommendations };
  }

  /**
   * Calculate laboratory productivity metrics
   */
  static calculateProductivityMetrics(
    testsCompleted: number,
    workingHours: number,
    staffCount: number
  ): {
    testsPerHour: number;
    testsPerStaffHour: number;
    efficiency: 'low' | 'average' | 'high';
  } {
    const testsPerHour = workingHours > 0 ? testsCompleted / workingHours : 0;
    const testsPerStaffHour = (workingHours * staffCount) > 0 ? testsCompleted / (workingHours * staffCount) : 0;

    let efficiency: 'low' | 'average' | 'high' = 'average';
    
    // Benchmark: 15 tests per staff hour is average
    if (testsPerStaffHour >= 20) efficiency = 'high';
    else if (testsPerStaffHour < 10) efficiency = 'low';

    return {
      testsPerHour: Number(testsPerHour.toFixed(2)),
      testsPerStaffHour: Number(testsPerStaffHour.toFixed(2)),
      efficiency,
    };
  }

  /**
   * Generate unique lab identifiers
   */
  static generateLabIdentifiers(prefix: string, organizationCode: string = 'LAB'): {
    mrn: string;
    orderNumber: string;
    specimenBarcode: string;
  } {
    return {
      mrn: StringUtil.generateMRN(organizationCode),
      orderNumber: StringUtil.generateOrderNumber(prefix),
      specimenBarcode: StringUtil.generateBarcode('SPEC'),
    };
  }

  /**
   * Validate critical value notification requirements
   */
  static evaluateCriticalValueNotification(
    testResult: {
      value: number;
      testName: string;
      patientAge: number;
      isCritical: boolean;
    },
    lastNotification?: Date
  ): {
    requiresNotification: boolean;
    urgencyLevel: 'immediate' | 'urgent' | 'routine';
    notificationMethods: string[];
    maxResponseTime: number; // minutes
  } {
    if (!testResult.isCritical) {
      return {
        requiresNotification: false,
        urgencyLevel: 'routine',
        notificationMethods: [],
        maxResponseTime: 0,
      };
    }

    // Check if already notified recently (within 2 hours)
    if (lastNotification && DateUtil.hoursDifference(lastNotification, new Date()) < 2) {
      return {
        requiresNotification: false,
        urgencyLevel: 'routine',
        notificationMethods: [],
        maxResponseTime: 0,
      };
    }

    // Critical tests requiring immediate notification
    const immediateCriticalTests = [
      'glucose', 'potassium', 'troponin', 'inr', 'pt', 'ptt',
      'hemoglobin', 'platelet', 'wbc'
    ];

    const testNameLower = testResult.testName.toLowerCase();
    const isImmediateCritical = immediateCriticalTests.some(test => 
      testNameLower.includes(test)
    );

    if (isImmediateCritical || testResult.patientAge < 18) {
      return {
        requiresNotification: true,
        urgencyLevel: 'immediate',
        notificationMethods: ['phone', 'sms', 'email'],
        maxResponseTime: 30, // 30 minutes
      };
    }

    return {
      requiresNotification: true,
      urgencyLevel: 'urgent',
      notificationMethods: ['phone', 'email'],
      maxResponseTime: 60, // 1 hour
    };
  }

  /**
   * Calculate workload distribution for lab departments
   */
  static calculateWorkloadDistribution(
    orders: Array<{
      testCount: number;
      priority: 'routine' | 'urgent' | 'stat';
      department: string;
    }>
  ): Record<string, {
    totalTests: number;
    statTests: number;
    urgentTests: number;
    routineTests: number;
    workloadScore: number;
  }> {
    const distribution: Record<string, any> = {};

    orders.forEach(order => {
      if (!distribution[order.department]) {
        distribution[order.department] = {
          totalTests: 0,
          statTests: 0,
          urgentTests: 0,
          routineTests: 0,
          workloadScore: 0,
        };
      }

      const dept = distribution[order.department];
      dept.totalTests += order.testCount;

      switch (order.priority) {
        case 'stat':
          dept.statTests += order.testCount;
          dept.workloadScore += order.testCount * 3; // STAT tests have 3x weight
          break;
        case 'urgent':
          dept.urgentTests += order.testCount;
          dept.workloadScore += order.testCount * 2; // Urgent tests have 2x weight
          break;
        case 'routine':
          dept.routineTests += order.testCount;
          dept.workloadScore += order.testCount * 1; // Routine tests have 1x weight
          break;
      }
    });

    return distribution;
  }

  /**
   * Format lab result for display with appropriate precision
   */
  static formatLabResult(
    value: number | string,
    unit?: string,
    precision: number = 2
  ): string {
    if (typeof value === 'string') {
      return unit ? `${value} ${unit}` : value;
    }

    if (typeof value === 'number') {
      const formatted = ValidationUtil.hasValidPrecision(value, precision)
        ? value.toString()
        : value.toFixed(precision);
      
      return unit ? `${formatted} ${unit}` : formatted;
    }

    return '';
  }

  /**
   * Estimate test completion time based on test type and workload
   */
  static estimateCompletionTime(
    testCode: string,
    currentWorkload: number,
    priority: 'routine' | 'urgent' | 'stat'
  ): {
    estimatedMinutes: number;
    estimatedCompletionTime: Date;
    confidence: 'high' | 'medium' | 'low';
  } {
    // Base processing times by test category (minutes)
    const baseTimes: Record<string, number> = {
      // Hematology
      CBC: 15, WBC: 10, RBC: 10, PLT: 10,
      // Chemistry
      GLU: 10, BUN: 15, CREAT: 15, ALT: 20, AST: 20,
      // Microbiology
      CULTURE: 2880, // 48 hours
      GRAM: 30,
      // Immunology
      HBV: 60, HCV: 60, HIV: 60,
    };

    const baseTime = baseTimes[testCode.toUpperCase()] || 30; // Default 30 minutes
    
    // Adjust for priority
    let adjustedTime = baseTime;
    switch (priority) {
      case 'stat':
        adjustedTime = baseTime * 0.5; // Rush processing
        break;
      case 'urgent':
        adjustedTime = baseTime * 0.7;
        break;
      case 'routine':
        adjustedTime = baseTime * 1.2; // Standard processing
        break;
    }

    // Adjust for workload (more tests = longer delays)
    const workloadMultiplier = 1 + (currentWorkload / 100);
    const estimatedMinutes = Math.round(adjustedTime * workloadMultiplier);

    const estimatedCompletionTime = DateUtil.addHours(new Date(), estimatedMinutes / 60);

    // Confidence based on test type and workload
    let confidence: 'high' | 'medium' | 'low' = 'high';
    if (currentWorkload > 50) confidence = 'medium';
    if (currentWorkload > 100) confidence = 'low';
    if (testCode.includes('CULTURE')) confidence = 'low'; // Cultures are unpredictable

    return { estimatedMinutes, estimatedCompletionTime, confidence };
  }
}