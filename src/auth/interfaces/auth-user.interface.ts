/**
 * Authenticated User Interface
 * Represents the current authenticated user in requests
 */
export interface AuthUser {
  /** User unique identifier */
  id: string;
  
  /** User email address */
  email: string;
  
  /** User's full name */
  name: string;
  
  /** User role in the system */
  role: string;
  
  /** Organization ID for multi-tenant isolation */
  organizationId: string;
  
  /** Organization name for display */
  organizationName?: string;
  
  /** User active status */
  isActive: boolean;
  
  /** User permissions array */
  permissions?: string[];
  
  /** Last login timestamp */
  lastLogin?: Date;
  
  /** Account verification status */
  isVerified?: boolean;
  
  /** Two-factor authentication enabled */
  isTwoFactorEnabled?: boolean;
}

/**
 * Login Response Interface
 * Structure returned after successful authentication
 */
export interface LoginResponse {
  /** Access token for API requests */
  accessToken: string;
  
  /** Refresh token for token renewal */
  refreshToken: string;
  
  /** Token type (always 'Bearer') */
  tokenType: 'Bearer';
  
  /** Access token expiration in seconds */
  expiresIn: number;
  
  /** Authenticated user information */
  user: AuthUser;
}

/**
 * Token Refresh Response Interface
 * Structure returned after token refresh
 */
export interface TokenRefreshResponse {
  /** New access token */
  accessToken: string;
  
  /** New refresh token (optional) */
  refreshToken?: string;
  
  /** Token type (always 'Bearer') */
  tokenType: 'Bearer';
  
  /** Access token expiration in seconds */
  expiresIn: number;
}

/**
 * Password Change Request Interface
 * Structure for password change operations
 */
export interface PasswordChangeRequest {
  /** Current password for verification */
  currentPassword: string;
  
  /** New password */
  newPassword: string;
  
  /** New password confirmation */
  confirmPassword: string;
}

/**
 * Account Lockout Information
 */
export interface AccountLockout {
  /** Is account currently locked */
  isLocked: boolean;
  
  /** Number of failed login attempts */
  failedAttempts: number;
  
  /** Lockout expiration time */
  lockoutExpires?: Date;
  
  /** Time until unlock in seconds */
  unlockIn?: number;
}