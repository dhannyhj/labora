import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthUser } from '../interfaces/auth-user.interface';

/**
 * Roles Guard
 * Checks if user has required roles/permissions
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles or permissions required, allow access
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check role requirements
    if (requiredRoles && !this.hasRequiredRole(user.role, requiredRoles)) {
      throw new ForbiddenException('Insufficient role privileges');
    }

    // Check permission requirements
    if (requiredPermissions && !this.hasRequiredPermissions(user.permissions || [], requiredPermissions)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  /**
   * Check if user has any of the required roles
   */
  private hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole);
  }

  /**
   * Check if user has all required permissions
   */
  private hasRequiredPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  }
}

/**
 * Organization Guard
 * Ensures users can only access their organization's data
 */
@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Skip organization check for super admins
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Get organization ID from request parameters or body
    const organizationId = request.params?.organizationId || 
                          request.body?.organizationId || 
                          request.query?.organizationId;

    // If no organization ID in request, allow (will be filtered at service level)
    if (!organizationId) {
      return true;
    }

    // Check if user belongs to the requested organization
    if (user.organizationId !== organizationId) {
      throw new ForbiddenException('Access denied: different organization');
    }

    return true;
  }
}