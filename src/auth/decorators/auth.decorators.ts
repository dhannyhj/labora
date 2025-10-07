import { SetMetadata } from '@nestjs/common';

/**
 * Public Route Decorator
 * Marks a route as public (no authentication required)
 */
export const Public = () => SetMetadata('isPublic', true);

/**
 * Require Authentication Decorator
 * Explicitly marks a route as requiring authentication (default behavior)
 */
export const RequireAuth = () => SetMetadata('requireAuth', true);

/**
 * Roles Decorator
 * Specifies required roles for accessing a route
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * Permissions Decorator
 * Specifies required permissions for accessing a route
 */
export const Permissions = (...permissions: string[]) => SetMetadata('permissions', permissions);

/**
 * Organization Admin Decorator
 * Shortcut for organization admin role requirement
 */
export const OrganizationAdmin = () => Roles('ORGANIZATION_ADMIN', 'SUPER_ADMIN');

/**
 * Lab Manager Decorator
 * Shortcut for lab manager role requirement
 */
export const LabManager = () => Roles('LAB_MANAGER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN');

/**
 * Technician Decorator
 * Shortcut for technician role requirement
 */
export const Technician = () => Roles('TECHNICIAN', 'SENIOR_TECHNICIAN', 'LAB_MANAGER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN');

/**
 * Staff Decorator
 * Shortcut for any staff role requirement
 */
export const Staff = () => Roles('STAFF', 'TECHNICIAN', 'SENIOR_TECHNICIAN', 'LAB_MANAGER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN');