import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AccessTokenPayload } from '../interfaces/jwt-payload.interface';
import { AuthUser } from '../interfaces/auth-user.interface';

/**
 * JWT Strategy for Passport
 * Handles JWT token validation and user retrieval
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'labora-default-secret-key-change-in-production',
      issuer: configService.get<string>('JWT_ISSUER') || 'labora-clinical-lab',
      audience: configService.get<string>('JWT_AUDIENCE') || 'labora-users',
    });
  }

  /**
   * Validate JWT payload
   * Called automatically by Passport after token verification
   */
  async validate(payload: AccessTokenPayload): Promise<AuthUser> {
    // Validate token type
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Get user from database
    const user = await this.authService.validateUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Return user (will be attached to request.user)
    return user;
  }
}