import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../interfaces/auth-user.interface';

/**
 * Current User Decorator
 * Extracts the authenticated user from the request
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, context: ExecutionContext): AuthUser | any => {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user) {
      return null;
    }

    // Return specific property if requested
    if (data) {
      return user[data];
    }

    // Return full user object
    return user;
  },
);

/**
 * Current Organization Decorator
 * Extracts the organization ID from the authenticated user
 */
export const CurrentOrganization = createParamDecorator(
  (data: unknown, context: ExecutionContext): string | null => {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    return user?.organizationId || null;
  },
);

/**
 * Current User ID Decorator
 * Extracts the user ID from the authenticated user
 */
export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext): string | null => {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    return user?.id || null;
  },
);

/**
 * Current User Role Decorator
 * Extracts the user role from the authenticated user
 */
export const CurrentUserRole = createParamDecorator(
  (data: unknown, context: ExecutionContext): string | null => {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    return user?.role || null;
  },
);

/**
 * Current Token Decorator
 * Extracts the JWT token from the request
 */
export const CurrentToken = createParamDecorator(
  (data: unknown, context: ExecutionContext): string | null => {
    const request = context.switchToHttp().getRequest();
    return request.token || null;
  },
);