import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';

// Import DTOs
import { LoginDto, RegisterDto } from './dto/login.dto';
import { ChangePasswordDto, RefreshTokenDto } from './dto/password.dto';

// Import interfaces
import { LoginResponse, TokenRefreshResponse, AuthUser } from './interfaces/auth-user.interface';

// Import guards and decorators
import { AuthGuard } from './guards/auth.guard';
import { Public } from './decorators/auth.decorators';
import { CurrentUser, CurrentUserId, CurrentToken } from './decorators/current-user.decorator';

// Import utilities
import { ResponseUtil } from '../common/utils/response.util';

/**
 * Authentication Controller
 * Handles authentication-related HTTP endpoints
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * User Login
   * POST /auth/login
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(ValidationPipe) loginDto: LoginDto
  ): Promise<any> {
    try {
      const loginResponse = await this.authService.login(loginDto);
      return ResponseUtil.success(
        'Login successful',
        loginResponse
      );
    } catch (error) {
      return ResponseUtil.error(
        error.message || 'Login failed',
        null,
        error.status || HttpStatus.UNAUTHORIZED
      );
    }
  }

  /**
   * User Registration
   * POST /auth/register
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(ValidationPipe) registerDto: RegisterDto
  ): Promise<any> {
    try {
      const user = await this.authService.register(registerDto);
      return ResponseUtil.success(
        'User registered successfully',
        user
      );
    } catch (error) {
      return ResponseUtil.error(
        error.message || 'Registration failed',
        null,
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Refresh Access Token
   * POST /auth/refresh
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body(ValidationPipe) refreshTokenDto: RefreshTokenDto
  ): Promise<any> {
    try {
      const tokenResponse = await this.authService.refreshToken(refreshTokenDto.refreshToken);
      return ResponseUtil.success(
        'Token refreshed successfully',
        tokenResponse
      );
    } catch (error) {
      return ResponseUtil.error(
        error.message || 'Token refresh failed',
        null,
        error.status || HttpStatus.UNAUTHORIZED
      );
    }
  }

  /**
   * Change Password
   * POST /auth/change-password
   */
  @UseGuards(AuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUserId() userId: string,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto
  ): Promise<any> {
    try {
      await this.authService.changePassword(userId, changePasswordDto);
      return ResponseUtil.success(
        'Password changed successfully'
      );
    } catch (error) {
      return ResponseUtil.error(
        error.message || 'Password change failed',
        null,
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * User Logout
   * POST /auth/logout
   */
  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentToken() token: string
  ): Promise<any> {
    try {
      // Extract refresh token from request or use access token
      await this.authService.logout(token);
      return ResponseUtil.success(
        'Logout successful'
      );
    } catch (error) {
      return ResponseUtil.success(
        'Logout successful'
      ); // Always return success for logout
    }
  }

  /**
   * Get Current User Profile
   * GET /auth/profile
   */
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(
    @CurrentUser() user: AuthUser
  ): Promise<any> {
    return ResponseUtil.success(
      'Profile retrieved successfully',
      user
    );
  }

  /**
   * Verify Token
   * GET /auth/verify
   */
  @UseGuards(AuthGuard)
  @Get('verify')
  async verifyToken(
    @CurrentUser() user: AuthUser,
    @CurrentToken() token: string
  ): Promise<any> {
    const expirationTime = this.jwtService.getTokenExpirationTime(token);
    
    return ResponseUtil.success(
      'Token is valid',
      {
        valid: true,
        user,
        expiresIn: expirationTime,
      }
    );
  }

  /**
   * Health Check for Auth Service
   * GET /auth/health
   */
  @Public()
  @Get('health')
  async healthCheck(): Promise<any> {
    return ResponseUtil.success(
      'Authentication service is healthy',
      {
        service: 'Authentication',
        status: 'operational',
        timestamp: new Date().toISOString(),
      }
    );
  }
}