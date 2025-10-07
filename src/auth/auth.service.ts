import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException, 
  ConflictException,
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Import entities
import { User } from '../database/entities/user.entity';
import { Organization } from '../database/entities/organization.entity';

// Import DTOs
import { LoginDto, RegisterDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/password.dto';

// Import interfaces
import { 
  LoginResponse, 
  TokenRefreshResponse, 
  AuthUser,
  AccountLockout 
} from './interfaces/auth-user.interface';

// Import services
import { JwtService } from './jwt.service';

// Import utilities
import { ResponseUtil } from '../common/utils/response.util';
import { ValidationUtil } from '../common/utils/validation.util';

/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */
@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * User Login
   * Authenticates user with email and password
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password, organizationId, deviceId } = loginDto;

    // Find user by email - explicitly select password for authentication
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['organization'],
      select: ['id', 'email', 'password', 'role', 'organizationId', 'isActive', 'failedLoginAttempts']
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if organization matches (if provided)
    if (organizationId && user.organizationId !== organizationId) {
      throw new UnauthorizedException('User does not belong to specified organization');
    }

    // Check account lockout
    const lockoutInfo = await this.checkAccountLockout(user);
    if (lockoutInfo.isLocked) {
      throw new UnauthorizedException(
        `Account is locked. Try again in ${Math.ceil(lockoutInfo.unlockIn / 60)} minutes.`
      );
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check user status
    if (!user.isActive) {
      throw new UnauthorizedException('Account is not active');
    }

    // Reset failed login attempts on successful login
    await this.resetFailedAttempts(user);

    // Generate session ID
    const sessionId = uuidv4();

    // Generate tokens
    const { accessToken, refreshToken } = await this.jwtService.generateTokenPair(
      user.id,
      user.email,
      user.role,
      user.organizationId,
      sessionId,
      deviceId,
      this.getUserPermissions(user.role)
    );

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Prepare authenticated user info
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization?.name,
      isActive: user.isActive,
      permissions: this.getUserPermissions(user.role),
      lastLogin: user.lastLoginAt,
      isVerified: true, // TODO: Add email verification field to User entity
      isTwoFactorEnabled: false, // TODO: Implement 2FA
    };

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.jwtService.getAccessTokenExpirySeconds(),
      user: authUser,
    };
  }

  /**
   * User Registration
   * Creates new user account
   */
  async register(registerDto: RegisterDto): Promise<AuthUser> {
    const { 
      fullName, 
      username,
      email, 
      password, 
      confirmPassword, 
      role, 
      organizationId
    } = registerDto;

    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    // Validate password strength
    if (!ValidationUtil.isStrongPassword(password)) {
      throw new BadRequestException(
        'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'
      );
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username: username.toLowerCase() }
    });

    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // Verify organization exists
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create new user
    const newUser = this.userRepository.create({
      username: username.toLowerCase(),
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      organizationId,
      isActive: true,
      lastLoginAt: null,
      failedLoginAttempts: 0,
      isDeleted: false,
    });

    const savedUser = await this.userRepository.save(newUser);

    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.fullName,
      role: savedUser.role,
      organizationId: savedUser.organizationId,
      organizationName: organization.name,
      isActive: savedUser.isActive,
      permissions: this.getUserPermissions(savedUser.role),
      lastLogin: savedUser.lastLoginAt,
      isVerified: true, // TODO: Add email verification field
      isTwoFactorEnabled: false,
    };
  }

  /**
   * Refresh Access Token
   * Generates new access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyRefreshToken(refreshToken);

      // Find user
      const user = await this.userRepository.findOne({
        where: { id: payload.sub }
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new access token
      const accessToken = await this.jwtService.generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        permissions: this.getUserPermissions(user.role),
        lastLogin: user.lastLoginAt,
      });

      return {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: this.jwtService.getAccessTokenExpirySeconds(),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Change Password
   * Updates user password after validation
   */
  async changePassword(
    userId: string, 
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password strength
    if (!ValidationUtil.isStrongPassword(newPassword)) {
      throw new BadRequestException(
        'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'
      );
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update user password
    user.password = hashedPassword;
    // Note: passwordChangedAt field not available in current User entity
    // TODO: Add passwordChangedAt field to User entity
    await this.userRepository.save(user);
  }

  /**
   * Logout User
   * Invalidates user session (marks refresh token as blacklisted)
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      // Verify and blacklist refresh token
      await this.jwtService.verifyRefreshToken(refreshToken);
      await this.jwtService.blacklistToken(refreshToken);
    } catch (error) {
      // Even if token is invalid, consider logout successful
      console.log('Logout attempt with invalid token');
    }
  }

  /**
   * Validate User by ID
   * Used by JWT strategy for request authentication
   */
  async validateUserById(userId: string): Promise<AuthUser | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['organization'],
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization?.name,
      isActive: user.isActive,
      permissions: this.getUserPermissions(user.role),
      lastLogin: user.lastLoginAt,
      isVerified: true, // TODO: Add email verification field
      isTwoFactorEnabled: false,
    };
  }

  /**
   * Check Account Lockout Status
   * Determines if account is locked due to failed login attempts
   */
  private async checkAccountLockout(user: User): Promise<AccountLockout> {
    const userMeta = user.meta as any || {};
    const failedAttempts = userMeta.failedLoginAttempts || 0;
    const lockedUntil = userMeta.lockedUntil ? new Date(userMeta.lockedUntil) : null;

    if (failedAttempts >= this.MAX_LOGIN_ATTEMPTS && lockedUntil) {
      const now = new Date();
      if (lockedUntil > now) {
        const unlockIn = Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000);
        return {
          isLocked: true,
          failedAttempts,
          lockoutExpires: lockedUntil,
          unlockIn,
        };
      } else {
        // Lockout period expired, reset attempts
        await this.resetFailedAttempts(user);
      }
    }

    return {
      isLocked: false,
      failedAttempts,
    };
  }

  /**
   * Handle Failed Login Attempt
   * Increments failed login counter and locks account if necessary
   */
  private async handleFailedLogin(user: User): Promise<void> {
    const userMeta = user.meta as any || {};
    const currentAttempts = userMeta.failedLoginAttempts || 0;
    const newAttempts = currentAttempts + 1;

    user.meta = {
      ...user.meta,
      failedLoginAttempts: newAttempts,
    } as any;

    if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      (user.meta as any).lockedUntil = new Date(Date.now() + this.LOCKOUT_TIME).toISOString();
    }

    await this.userRepository.save(user);
  }

  /**
   * Reset Failed Login Attempts
   * Clears failed login counter and unlock time
   */
  private async resetFailedAttempts(user: User): Promise<void> {
    const userMeta = user.meta as any || {};
    const failedAttempts = userMeta.failedLoginAttempts || 0;
    const lockedUntil = userMeta.lockedUntil;

    if (failedAttempts > 0 || lockedUntil) {
      user.meta = {
        ...user.meta,
        failedLoginAttempts: 0,
        lockedUntil: undefined,
      } as any;
      await this.userRepository.save(user);
    }
  }

  /**
   * Get User Permissions by Role
   * Returns array of permissions based on user role
   */
  private getUserPermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      SUPER_ADMIN: [
        'manage:organizations',
        'manage:users',
        'manage:tests',
        'manage:orders',
        'manage:results',
        'view:reports',
        'manage:system',
      ],
      ORGANIZATION_ADMIN: [
        'manage:users',
        'manage:tests',
        'manage:orders',
        'manage:results',
        'view:reports',
        'manage:organization',
      ],
      LAB_MANAGER: [
        'manage:users',
        'manage:tests',
        'manage:orders',
        'manage:results',
        'view:reports',
      ],
      SENIOR_TECHNICIAN: [
        'manage:tests',
        'manage:orders',
        'manage:results',
        'view:reports',
      ],
      TECHNICIAN: [
        'manage:orders',
        'manage:results',
        'view:reports',
      ],
      STAFF: [
        'view:orders',
        'view:reports',
      ],
    };

    return rolePermissions[role] || [];
  }
}
