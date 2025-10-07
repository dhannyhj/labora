# 🏗️ Backend API Modules - Comprehensive Development Plan

## 📋 **OVERVIEW: 8 CRITICAL BACKEND MODULES**

Berdasarkan audit foundation dan timeline yang telah dibuat, berikut adalah rencana comprehensive untuk membangun **8 Backend API Modules** yang menjadi foundation kritis untuk sistem laboratorium.

---

## 🎯 **MODULE PRIORITY & DEPENDENCIES**

### 📊 **Dependency Chain Analysis:**
```
1. Authentication/Users → 2. Organizations → 3. Patients → 4. Tests
                     ↓              ↓           ↓        ↓
                5. Orders → 6. Specimens → 7. Results → 8. Reports
```

### 🚦 **Development Priority:**
```bash
# Phase 3A: Foundation Modules (Week 1-2)
Priority 1: 🔐 Authentication Module
Priority 2: 👥 Users Module  
Priority 3: 🏢 Organizations Module

# Phase 3B: Core Lab Modules (Week 3-4)
Priority 4: 👤 Patients Module
Priority 5: 🧪 Tests Module
Priority 6: 📋 Orders Module

# Phase 3C: Workflow Modules (Week 5-6)
Priority 7: 🔬 Specimens Module
Priority 8: 📊 Results Module
```

---

## 🔐 **MODULE 1: AUTHENTICATION MODULE**
### **Status: CRITICAL FOUNDATION** | **Duration: 3-4 days**

#### 📁 **Module Structure:**
```bash
src/modules/auth/
├── auth.module.ts           # Module configuration
├── auth.controller.ts       # Login/logout endpoints
├── auth.service.ts          # Business logic
├── strategies/
│   ├── jwt.strategy.ts      # JWT validation
│   └── local.strategy.ts    # Username/password
├── guards/
│   ├── jwt.guard.ts         # Route protection
│   ├── roles.guard.ts       # Role-based access
│   └── local.guard.ts       # Login validation
├── decorators/
│   ├── current-user.decorator.ts
│   └── roles.decorator.ts
└── dto/
    ├── login.dto.ts
    ├── register.dto.ts
    └── change-password.dto.ts
```

#### 🎯 **Core Features:**
```typescript
// Authentication Endpoints
POST /auth/login           # User login with credentials
POST /auth/logout          # User logout (token invalidation)
POST /auth/refresh         # Token refresh
POST /auth/forgot-password # Password reset request
POST /auth/reset-password  # Password reset completion
GET  /auth/profile         # Current user profile
PATCH /auth/change-password # Password change
```

#### 🔧 **Implementation Details:**

**1. JWT Strategy Configuration:**
```typescript
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;
    const user = await this.userRepository.findOne({
      where: { id, status: UserStatus.ACTIVE },
      relations: ['organization'],
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
```

**2. Role-Based Guards:**
```typescript
// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

**3. Authentication Service:**
```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, status: UserStatus.ACTIVE },
      select: ['id', 'email', 'password', 'role', 'firstName', 'lastName'],
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result as User;
    }
    return null;
  }

  async login(user: User) {
    const payload: JwtPayload = { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      organizationId: user.organizationId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
```

---

## 👥 **MODULE 2: USERS MODULE**
### **Status: FOUNDATION DEPENDENCY** | **Duration: 2-3 days**

#### 📁 **Module Structure:**
```bash
src/modules/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── user-query.dto.ts
└── entities/
    └── user.entity.ts (already exists)
```

#### 🎯 **Core Features:**
```typescript
// User Management Endpoints
GET    /users                # List users with pagination/filtering
GET    /users/:id            # Get user by ID
POST   /users                # Create new user
PATCH  /users/:id            # Update user
DELETE /users/:id            # Soft delete user
GET    /users/roles          # Available roles
GET    /users/search         # Search users by name/email
PATCH  /users/:id/status     # Activate/deactivate user
```

#### 🔧 **Implementation Details:**

**1. User Entity Enhancement:**
```typescript
// user.entity.ts (enhancement)
@Entity({ schema: 'lab', name: 'users' })
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { eager: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }
}
```

**2. Users Service:**
```typescript
// users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(query: UserQueryDto): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 20, search, role, status, organizationId } = query;
    
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('user.isDeleted = :isDeleted', { isDeleted: false });

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (organizationId) {
      queryBuilder.andWhere('user.organizationId = :organizationId', { organizationId });
    }

    const [items, total] = await queryBuilder
      .orderBy('user.firstName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }
}
```

---

## 🏢 **MODULE 3: ORGANIZATIONS MODULE**
### **Status: MULTI-TENANT FOUNDATION** | **Duration: 2 days**

#### 📁 **Module Structure:**
```bash
src/modules/organizations/
├── organizations.module.ts
├── organizations.controller.ts
├── organizations.service.ts
├── dto/
│   ├── create-organization.dto.ts
│   └── update-organization.dto.ts
└── entities/
    └── organization.entity.ts (to be created)
```

#### 🎯 **Core Features:**
```typescript
// Organization Endpoints
GET    /organizations        # List organizations
GET    /organizations/:id    # Get organization details
POST   /organizations        # Create organization
PATCH  /organizations/:id    # Update organization
DELETE /organizations/:id    # Delete organization
GET    /organizations/:id/users # Get organization users
```

#### 🔧 **Implementation Details:**

**1. Organization Entity:**
```typescript
// organization.entity.ts
@Entity({ schema: 'lab', name: 'organizations' })
export class Organization extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  contact: {
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    timezone?: string;
    dateFormat?: string;
    currency?: string;
    reportingPeriod?: string;
  };

  @OneToMany(() => User, user => user.organization)
  users: User[];
}
```

---

## 👤 **MODULE 4: PATIENTS MODULE**
### **Status: CORE LAB ENTITY** | **Duration: 3-4 days**

#### 📁 **Module Structure:**
```bash
src/modules/patients/
├── patients.module.ts
├── patients.controller.ts
├── patients.service.ts
├── dto/
│   ├── create-patient.dto.ts
│   ├── update-patient.dto.ts
│   └── patient-search.dto.ts
└── entities/
    └── patient.entity.ts (to be created)
```

#### 🎯 **Core Features:**
```typescript
// Patient Management Endpoints
GET    /patients             # List patients with search
GET    /patients/:id         # Get patient details
POST   /patients             # Register new patient
PATCH  /patients/:id         # Update patient info
DELETE /patients/:id         # Soft delete patient
GET    /patients/search      # Advanced patient search
GET    /patients/:id/orders  # Patient order history
GET    /patients/:id/results # Patient result history
POST   /patients/duplicate-check # Check for duplicates
```

#### 🔧 **Key Implementation Features:**

**1. Advanced Search & Duplicate Detection:**
```typescript
// patients.service.ts
async searchPatients(searchDto: PatientSearchDto) {
  const queryBuilder = this.patientRepository.createQueryBuilder('patient');

  // Full-text search
  if (searchDto.search) {
    queryBuilder.andWhere(
      `to_tsvector('simple', patient.firstName || ' ' || patient.lastName || ' ' || patient.mrn) @@ plainto_tsquery(:search)`,
      { search: searchDto.search }
    );
  }

  // Fuzzy name matching for duplicates
  if (searchDto.fuzzyName) {
    queryBuilder.andWhere(
      `similarity(patient.firstName || ' ' || patient.lastName, :name) > 0.6`,
      { name: searchDto.fuzzyName }
    );
  }

  return queryBuilder.getMany();
}
```

---

## 🧪 **MODULE 5: TESTS MODULE**
### **Status: LAB CATALOG FOUNDATION** | **Duration: 3 days**

#### 📁 **Module Structure:**
```bash
src/modules/tests/
├── tests.module.ts
├── tests.controller.ts
├── tests.service.ts
├── dto/
│   ├── create-test.dto.ts
│   ├── update-test.dto.ts
│   └── test-query.dto.ts
└── entities/
    ├── test.entity.ts (to be created)
    ├── test-panel.entity.ts (to be created)
    ├── specimen-type.entity.ts (to be created)
    └── unit.entity.ts (to be created)
```

#### 🎯 **Core Features:**
```typescript
// Test Catalog Endpoints
GET    /tests                # List all tests
GET    /tests/:id            # Get test details
POST   /tests                # Create new test
PATCH  /tests/:id            # Update test
DELETE /tests/:id            # Delete test
GET    /tests/categories     # Test categories
GET    /tests/panels         # Test panels
POST   /tests/panels         # Create test panel
GET    /tests/specimen-types # Specimen types
GET    /tests/units          # Measurement units
```

---

## 📋 **MODULE 6: ORDERS MODULE**
### **Status: CORE WORKFLOW** | **Duration: 4-5 days**

#### 📁 **Module Structure:**
```bash
src/modules/orders/
├── orders.module.ts
├── orders.controller.ts
├── orders.service.ts
├── dto/
│   ├── create-order.dto.ts
│   ├── update-order.dto.ts
│   └── order-query.dto.ts
└── entities/
    ├── order.entity.ts (to be created)
    └── order-item.entity.ts (to be created)
```

#### 🎯 **Core Features:**
```typescript
// Order Management Endpoints
GET    /orders               # List orders with filters
GET    /orders/:id           # Get order details
POST   /orders               # Create new order
PATCH  /orders/:id           # Update order
DELETE /orders/:id           # Cancel order
PATCH  /orders/:id/status    # Update order status
GET    /orders/worklist      # Lab worklist view
POST   /orders/batch         # Batch order creation
GET    /orders/stats         # Order statistics
```

---

## 🔬 **MODULE 7: SPECIMENS MODULE**
### **Status: SAMPLE TRACKING** | **Duration: 3-4 days**

#### 📁 **Module Structure:**
```bash
src/modules/specimens/
├── specimens.module.ts
├── specimens.controller.ts
├── specimens.service.ts
├── dto/
│   ├── create-specimen.dto.ts
│   ├── update-specimen.dto.ts
│   └── specimen-query.dto.ts
└── entities/
    └── specimen.entity.ts (to be created)
```

#### 🎯 **Core Features:**
```typescript
// Specimen Tracking Endpoints
GET    /specimens            # List specimens
GET    /specimens/:id        # Get specimen details
POST   /specimens            # Create specimen record
PATCH  /specimens/:id        # Update specimen
DELETE /specimens/:id        # Reject specimen
GET    /specimens/barcode/:code # Find by barcode
PATCH  /specimens/:id/status # Update specimen status
GET    /specimens/workflow   # Specimen workflow view
```

---

## 📊 **MODULE 8: RESULTS MODULE**
### **Status: FINAL OUTPUT** | **Duration: 4-5 days**

#### 📁 **Module Structure:**
```bash
src/modules/results/
├── results.module.ts
├── results.controller.ts
├── results.service.ts
├── dto/
│   ├── create-result.dto.ts
│   ├── update-result.dto.ts
│   └── result-query.dto.ts
└── entities/
    ├── result.entity.ts (to be created)
    └── result-interpretation.entity.ts (to be created)
```

#### 🎯 **Core Features:**
```typescript
// Results Management Endpoints
GET    /results              # List results
GET    /results/:id          # Get result details
POST   /results              # Enter result
PATCH  /results/:id          # Update result
DELETE /results/:id          # Delete result
PATCH  /results/:id/verify   # Verify result
GET    /results/pending      # Pending verification
POST   /results/batch        # Batch result entry
GET    /results/critical     # Critical values
```

---

## 📅 **DEVELOPMENT TIMELINE**

### 🗓️ **Week 1: Foundation Modules**
```bash
Day 1-2: 🔐 Authentication Module (JWT, Guards, Strategies)
Day 3-4: 👥 Users Module (CRUD, Search, Roles)
Day 5-6: 🏢 Organizations Module (Multi-tenant setup)
Day 7:   🧪 Testing & Integration
```

### 🗓️ **Week 2: Core Lab Modules**
```bash
Day 8-10:  👤 Patients Module (Registration, Search, Duplicates)
Day 11-13: 🧪 Tests Module (Catalog, Panels, References)
Day 14:    📋 Orders Module (Start - Basic CRUD)
```

### 🗓️ **Week 3: Workflow Modules**
```bash
Day 15-17: 📋 Orders Module (Complete - Workflow, Status)
Day 18-20: 🔬 Specimens Module (Tracking, Barcodes)
Day 21:    📊 Results Module (Start - Basic entry)
```

### 🗓️ **Week 4: Completion & Testing**
```bash
Day 22-24: 📊 Results Module (Complete - Verification, Critical)
Day 25-26: 🔧 Integration Testing
Day 27-28: 📚 API Documentation & Cleanup
```

---

## 🔧 **DEVELOPMENT STANDARDS**

### 📝 **Code Standards:**
```typescript
// 1. Consistent DTO Validation
export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsEmail()
  email: string;

  @IsEnum(Gender)
  gender: Gender;
}

// 2. Consistent Error Handling
try {
  return await this.patientsService.create(createPatientDto);
} catch (error) {
  if (error.code === '23505') {
    throw new ConflictException('Patient already exists');
  }
  throw new InternalServerErrorException('Failed to create patient');
}

// 3. Consistent Response Format
return ResponseUtil.success(
  'Patient created successfully',
  patient,
  HttpStatus.CREATED
);
```

### 🧪 **Testing Requirements:**
```bash
# Each module must have:
- Unit tests (>80% coverage)
- Integration tests (API endpoints)
- E2E tests (Critical workflows)
```

### 📚 **Documentation Requirements:**
```bash
# Each module must include:
- OpenAPI/Swagger documentation
- README with setup instructions
- API endpoint examples
- Business logic documentation
```

---

## 🎯 **SUCCESS CRITERIA**

### ✅ **Module Completion Checklist:**
- [ ] All entities created with proper relationships
- [ ] CRUD operations implemented
- [ ] Business logic validated
- [ ] Error handling comprehensive
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] API documentation complete
- [ ] Security implemented (JWT, RBAC)

### 📊 **Quality Gates:**
```bash
# Before module sign-off:
1. Code review passed
2. Tests passing
3. Security audit passed
4. Performance benchmarks met
5. Documentation complete
```

---

## 🚀 **NEXT STEPS**

### 🔥 **IMMEDIATE ACTION (Today):**
1. **Create missing database entities** (Priority 1)
2. **Setup module folder structure** 
3. **Begin Authentication Module development**

### 📋 **THIS WEEK:**
1. **Complete Authentication & Users modules**
2. **Setup testing framework**
3. **Create API documentation structure**

Apakah kita siap memulai dengan **Module 1: Authentication** sebagai foundation yang paling kritis?