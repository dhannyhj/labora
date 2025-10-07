import { HttpStatus } from '@nestjs/common';

/**
 * Utility class for standardizing API responses
 * Provides consistent response format across all endpoints
 */
export class ResponseUtil {
  /**
   * Success response with data
   */
  static success<T>(
    message: string,
    data?: T,
    statusCode: HttpStatus = HttpStatus.OK,
  ) {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Success response for lists with pagination
   */
  static successWithPagination<T>(
    message: string,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    statusCode: HttpStatus = HttpStatus.OK,
  ) {
    return {
      success: true,
      statusCode,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Error response
   */
  static error(
    message: string,
    error?: any,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    return {
      success: false,
      statusCode,
      message,
      error: error?.message || error,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validation error response
   */
  static validationError(
    message: string = 'Validation failed',
    errors: string[] = [],
  ) {
    return {
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Not found response
   */
  static notFound(resource: string = 'Resource') {
    return {
      success: false,
      statusCode: HttpStatus.NOT_FOUND,
      message: `${resource} not found`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Unauthorized response
   */
  static unauthorized(message: string = 'Unauthorized access') {
    return {
      success: false,
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Forbidden response
   */
  static forbidden(message: string = 'Access forbidden') {
    return {
      success: false,
      statusCode: HttpStatus.FORBIDDEN,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Conflict response
   */
  static conflict(message: string = 'Resource conflict') {
    return {
      success: false,
      statusCode: HttpStatus.CONFLICT,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Created response
   */
  static created<T>(message: string, data?: T) {
    return this.success(message, data, HttpStatus.CREATED);
  }

  /**
   * No content response
   */
  static noContent(message: string = 'Operation completed successfully') {
    return {
      success: true,
      statusCode: HttpStatus.NO_CONTENT,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}