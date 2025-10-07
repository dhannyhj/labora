/**
 * JWT Payload Interface
 * Defines the structure of data stored in JWT tokens
 */
export interface JwtPayload {
  /** User unique identifier */
  sub: string;
  
  /** User email address */
  email: string;
  
  /** User role in the system */
  role: string;
  
  /** Organization ID for multi-tenant isolation */
  organizationId: string;
  
  /** Token type: 'access' or 'refresh' */
  type: 'access' | 'refresh';
  
  /** Token issued at timestamp */
  iat?: number;
  
  /** Token expiration timestamp */
  exp?: number;
  
  /** Token issuer */
  iss?: string;
  
  /** Token audience */
  aud?: string;
}

/**
 * Refresh Token Payload
 * Specific payload for refresh tokens
 */
export interface RefreshTokenPayload extends Omit<JwtPayload, 'type'> {
  type: 'refresh';
  
  /** Session ID for token validation */
  sessionId: string;
  
  /** Device identifier for security */
  deviceId?: string;
}

/**
 * Access Token Payload  
 * Specific payload for access tokens
 */
export interface AccessTokenPayload extends Omit<JwtPayload, 'type'> {
  type: 'access';
  
  /** User permissions array */
  permissions?: string[];
  
  /** Last login timestamp */
  lastLogin?: Date;
}