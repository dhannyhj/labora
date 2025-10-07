import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Import entities
import { User } from '../database/entities/user.entity';
import { Organization } from '../database/entities/organization.entity';

// Import services
import { AuthService } from './auth.service';
import { JwtService as CustomJwtService } from './jwt.service';

// Import controllers
import { AuthController } from './auth.controller';

// Import guards
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard, OrganizationGuard } from './guards/roles.guard';

// Import strategies
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Authentication Module
 * Configures authentication services, guards, and strategies
 */
@Module({
  imports: [
    // TypeORM for database entities
    TypeOrmModule.forFeature([User, Organization]),
    
    // Passport for authentication strategies
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // JWT Module configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'labora-default-secret-key-change-in-production',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '15m',
          issuer: configService.get<string>('JWT_ISSUER') || 'labora-clinical-lab',
          audience: configService.get<string>('JWT_AUDIENCE') || 'labora-users',
        },
      }),
    }),
  ],
  
  providers: [
    // Services
    AuthService,
    CustomJwtService,
    
    // Guards
    AuthGuard,
    RolesGuard,
    OrganizationGuard,
    
    // Strategies
    JwtStrategy,
  ],
  
  controllers: [AuthController],
  
  exports: [
    // Export services for use in other modules
    AuthService,
    CustomJwtService,
    
    // Export guards for use in other modules
    AuthGuard,
    RolesGuard,
    OrganizationGuard,
    
    // Export TypeORM feature for testing
    TypeOrmModule,
  ],
})
export class AuthModule {}