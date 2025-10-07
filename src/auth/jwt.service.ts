import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { 
  JwtPayload, 
  AccessTokenPayload, 
  RefreshTokenPayload 
} from './interfaces/jwt-payload.interface';

/**
 * JWT Service
 * Handles JWT token generation, validation, and management
 */
@Injectable()
export class JwtService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;
  private readonly issuer: string;
  private readonly audience: string;

  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {
    // Get JWT configuration from environment
    this.accessTokenSecret = this.configService.get<string>('JWT_SECRET') || 'labora-default-secret-key-change-in-production';
    this.refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'labora-refresh-secret-key-change-in-production';
    this.accessTokenExpiry = this.configService.get<string>('JWT_EXPIRATION') || '15m';
    this.refreshTokenExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
    this.issuer = this.configService.get<string>('JWT_ISSUER') || 'labora-clinical-lab';
    this.audience = this.configService.get<string>('JWT_AUDIENCE') || 'labora-users';
  }

  /**
   * Generate Access Token
   * Creates a short-lived token for API access
   */
  async generateAccessToken(payload: Omit<AccessTokenPayload, 'type' | 'iat' | 'exp'>): Promise<string> {
    const tokenPayload: AccessTokenPayload = {
      ...payload,
      type: 'access',
    };

    return this.nestJwtService.signAsync(tokenPayload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpiry,
      issuer: this.issuer,
      audience: this.audience,
    });
  }

  /**
   * Generate Refresh Token
   * Creates a long-lived token for token renewal
   */
  async generateRefreshToken(payload: Omit<RefreshTokenPayload, 'type' | 'iat' | 'exp'>): Promise<string> {
    const tokenPayload: RefreshTokenPayload = {
      ...payload,
      type: 'refresh',
    };

    return this.nestJwtService.signAsync(tokenPayload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenExpiry,
      issuer: this.issuer,
      audience: this.audience,
    });
  }

  /**
   * Generate Token Pair
   * Creates both access and refresh tokens
   */
  async generateTokenPair(
    userId: string,
    email: string,
    role: string,
    organizationId: string,
    sessionId: string,
    deviceId?: string,
    permissions?: string[]
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken({
        sub: userId,
        email,
        role,
        organizationId,
        permissions,
        lastLogin: new Date(),
      }),
      this.generateRefreshToken({
        sub: userId,
        email,
        role,
        organizationId,
        sessionId,
        deviceId,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Verify Access Token
   * Validates and decodes access token
   */
  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      const payload = await this.nestJwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.accessTokenSecret,
        issuer: this.issuer,
        audience: this.audience,
      });

      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      return payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid access token');
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }

  /**
   * Verify Refresh Token
   * Validates and decodes refresh token
   */
  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.nestJwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.refreshTokenSecret,
        issuer: this.issuer,
        audience: this.audience,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      return payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }

  /**
   * Extract Payload Without Verification
   * Decodes token payload without signature verification (for expired tokens)
   */
  extractPayload<T = JwtPayload>(token: string): T {
    try {
      return this.nestJwtService.decode(token) as T;
    } catch (error) {
      throw new UnauthorizedException('Invalid token format');
    }
  }

  /**
   * Check if Token is Expired
   * Validates token expiration without full verification
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.extractPayload(token);
      if (!payload.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Get Token Expiration Time
   * Returns remaining time in seconds until token expires
   */
  getTokenExpirationTime(token: string): number {
    try {
      const payload = this.extractPayload(token);
      if (!payload.exp) return 0;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = payload.exp - currentTime;
      return Math.max(0, remainingTime);
    } catch {
      return 0;
    }
  }

  /**
   * Get Access Token Expiry in Seconds
   * Returns the configured access token expiry time
   */
  getAccessTokenExpirySeconds(): number {
    // Convert expiry string to seconds
    const expiry = this.accessTokenExpiry;
    if (expiry.endsWith('m')) {
      return parseInt(expiry.slice(0, -1)) * 60;
    }
    if (expiry.endsWith('h')) {
      return parseInt(expiry.slice(0, -1)) * 3600;
    }
    if (expiry.endsWith('d')) {
      return parseInt(expiry.slice(0, -1)) * 86400;
    }
    return parseInt(expiry) || 900; // Default 15 minutes
  }

  /**
   * Blacklist Token (Future Implementation)
   * Mark token as invalid (requires Redis or database storage)
   */
  async blacklistToken(token: string): Promise<void> {
    // TODO: Implement token blacklisting with Redis
    // For now, we rely on token expiration
    console.log('Token blacklisted:', token.substring(0, 20) + '...');
  }

  /**
   * Is Token Blacklisted (Future Implementation)
   * Check if token is in blacklist
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    // TODO: Implement blacklist checking with Redis
    // For now, always return false
    return false;
  }
}