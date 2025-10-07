# 🏥 Clinical Lab System - Complete Implementation Roadmap

## 📊 Project Overview

**Tech Stack:**
- Backend: NestJS + Prisma ORM
- Database: PostgreSQL 15+
- Hosting: Fly.io (1GB RAM shared-cpu-1x)
- Alternative: VPS (1GB RAM - Hetzner/DigitalOcean)

**Target:** Scalable lab information system for small-medium clinics (100-500 orders/day)

---

## 🗂️ Phase 0: Project Setup & Infrastructure (Week 1)

### Day 1-2: Local Development Environment

**Tasks:**
```bash
# 1. Initialize NestJS project
npm i -g @nestjs/cli
nest new lab-api --package-manager npm
cd lab-api

# 2. Install core dependencies
npm install @prisma/client prisma
npm install @nestjs/config @nestjs/jwt @nestjs/passport
npm install passport passport-jwt passport-local
npm install bcrypt argon2
npm install class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express

# 3. Install dev dependencies
npm install -D @types/passport-jwt @types/passport-local
npm install -D @types/bcrypt prisma-dbml-generator
npm install -D @types/node typescript ts-node

# 4. Setup Prisma
npx prisma init
```

**Project Structure:**
```
lab-api/
├── prisma/
│   ├── schema.prisma           # Prisma schema dari SQL
│   ├── seed.ts                 # Seed data
│   └── migrations/             # DB migrations
├── src/
│   ├── common/                 # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/                 # Configuration
│   │   ├── database.config.ts
│   │   └── app.config.ts
│   ├── modules/
│   │   ├── auth/              # Authentication
│   │   ├── users/
│   │   ├── organizations/
│   │   ├── patients/
│   │   ├── orders/
│   │   ├── tests/
│   │   ├── specimens/
│   │   ├── results/
│   │   ├── billing/
│   │   └── reports/
│   ├── prisma/                # Prisma service
│   ├── app.module.ts
│   └── main.ts
├── .env
├── .env.example
├── docker-compose.yml         # Local Postgres
└── fly.toml                   # Fly.io config
```

### Day 3: Database Setup

**1. Convert SQL Schema to Prisma:**
```prisma
// prisma/schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgcrypto, pg_trgm, btree_gin]
}

// Enums
enum OrderStatus {
  requested
  collected
  received
  in_progress
  completed
  verified
  cancelled
}

enum Gender {
  male
  female
  other
  unknown
}

// Models (akan dibuat lengkap di artifact terpisah)
model Organization {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String
  code      String?  @unique @db.VarChar(50)
  address   String?
  contact   Json?
  meta      Json?
  isDeleted Boolean  @default(false) @map("is_deleted")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)

  users     User[]
  orders    LabOrder[]
  
  @@map("organizations")
  @@schema("lab")
}

// ... (akan dilengkapi)
```

**2. Docker Compose for Local Dev:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: lab_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: labdb
      POSTGRES_USER: labuser
      POSTGRES_PASSWORD: lab_secure_pass_2024
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./prisma/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U labuser -d labdb"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: lab_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**3. Environment Variables:**
```bash
# .env.example
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://labuser:lab_secure_pass_2024@localhost:5432/labdb?schema=lab"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Redis (for sessions/cache)
REDIS_HOST=localhost
REDIS_PORT=6379

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=./uploads

# Fly.io Production
# FLY_APP_NAME=lab-api
# FLY_REGION=sin  # Singapore
```

### Day 4-5: Core Architecture Setup

**1. Prisma Service:**
```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService 
  extends PrismaClient 
  implements OnModuleInit, OnModuleDestroy {
  
  constructor() {
    super({
      log: ['query', 'error', 'warn'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();
    
    // Enable RLS context helpers
    this.$use(async (params, next) => {
      // Set app.current_user for audit trail
      if (params.action === 'create' || params.action === 'update' || params.action === 'delete') {
        const userId = this.getCurrentUserId();
        if (userId) {
          await this.$executeRaw`SELECT lab.set_app_user(${userId}::uuid)`;
        }
      }
      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper untuk RLS
  async setOrgContext(orgId: string) {
    await this.$executeRaw`SELECT lab.set_app_org(${orgId}::uuid)`;
  }

  async setUserContext(userId: string) {
    await this.$executeRaw`SELECT lab.set_app_user(${userId}::uuid)`;
  }

  private getCurrentUserId(): string | null {
    // Will be set by request context
    return null;
  }
}
```

**2. Base Repository Pattern:**
```typescript
// src/common/repositories/base.repository.ts
export abstract class BaseRepository<T> {
  constructor(protected readonly prisma: PrismaService) {}

  async findAll(where?: any, include?: any) {
    return this.model.findMany({ where, include });
  }

  async findById(id: string, include?: any) {
    return this.model.findUnique({ where: { id }, include });
  }

  async create(data: any) {
    return this.model.create({ data });
  }

  async update(id: string, data: any) {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Soft delete
    return this.model.update({
      where: { id },
      data: { isDeleted: true }
    });
  }

  protected abstract get model(): any;
}
```

**Deliverables:**
- ✅ NestJS project initialized
- ✅ Prisma schema created from SQL
- ✅ Docker Compose for local development
- ✅ Core architecture (modules, services, repositories)
- ✅ Git repository setup

---

## 🔐 Phase 1: Authentication & User Management (Week 2)

### Day 6-7: Auth Module

**Features:**
- JWT-based authentication
- Role-based access control (RBAC)
- Organization context isolation
- Password hashing with Argon2

**Implementation:**
```typescript
// src/modules/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { organization: true }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      // Increment failed attempts
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: { increment: 1 } }
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts, update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        failedLoginAttempts: 0,
        lastLoginAt: new Date()
      }
    });

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      orgId: user.organizationId
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        organization: user.organization
      }
    };
  }
}
```

**Guards & Decorators:**
```typescript
// src/common/decorators/roles.decorator.ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// src/common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.role === role);
  }
}

// Usage:
@Get()
@Roles('admin', 'lab_staff')
@UseGuards(JwtAuthGuard, RolesGuard)
async findAll() { ... }
```

### Day 8-9: User Management

**APIs:**
- `POST /api/users` - Create user
- `GET /api/users` - List users (filtered by org)
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Soft delete user
- `POST /api/users/:id/reset-password` - Reset password

**Deliverables:**
- ✅ JWT authentication working
- ✅ User CRUD with RBAC
- ✅ Organization context isolation
- ✅ API documentation (Swagger)

---

## 👥 Phase 2: Core Entities (Week 3-4)

### Week 3: Patients & Providers

**Day 10-12: Patient Module**

**APIs:**
```typescript
// Patient search with pagination
GET /api/patients?search=john&page=1&limit=20

// Patient demographics
POST /api/patients
{
  "mrn": "MR-2024-001",
  "givenName": "John",
  "familyName": "Doe",
  "gender": "male",
  "birthDate": "1990-05-15",
  "contact": {
    "phone": "+62812345678",
    "email": "john@example.com"
  }
}

// Patient history
GET /api/patients/:id/orders
GET /api/patients/:id/results
```

**Features:**
- Full-text search on name
- Duplicate detection (fuzzy matching)
- Contact information (JSONB)
- Multiple identifiers support

**Implementation Highlights:**
```typescript
// src/modules/patients/patients.service.ts
async searchPatients(query: string, orgId: string) {
  // Set organization context for RLS
  await this.prisma.setOrgContext(orgId);
  
  return this.prisma.$queryRaw`
    SELECT * FROM lab.patients
    WHERE 
      to_tsvector('simple', 
        coalesce(family_name,'') || ' ' || coalesce(given_name,'')
      ) @@ plainto_tsquery('simple', ${query})
      OR mrn ILIKE ${`%${query}%`}
    ORDER BY created_at DESC
    LIMIT 20
  `;
}
```

### Day 13-14: Provider Module

**APIs:**
- `POST /api/providers` - Register provider
- `GET /api/providers` - List providers
- `GET /api/providers/:id/orders` - Provider's orders

---

## 🧪 Phase 3: Test Catalog & Orders (Week 5-6)

### Week 5: Test Catalog

**Day 15-17: Tests & Panels**

**Features:**
- Test catalog management
- Test panels (groups)
- Reference ranges by age/sex
- Pricing management
- LOINC code mapping

**APIs:**
```typescript
POST /api/tests
{
  "code": "CBC-WBC",
  "name": "White Blood Cell Count",
  "department": "Hematology",
  "specimenTypeId": "...",
  "cost": 50.00,
  "referenceRanges": [
    {
      "sex": "unknown",
      "ageMin": 18,
      "ageUnit": "years",
      "low": 4000,
      "high": 11000,
      "unitsId": "..."
    }
  ]
}

GET /api/tests?department=Hematology&search=blood
GET /api/tests/:id/reference-ranges?age=25&sex=male
```

### Week 6: Lab Orders

**Day 18-21: Order Management**

**Complete Order Workflow:**
```
requested → collected → received → in_progress → completed → verified
                                      ↓
                                  cancelled
```

**APIs:**
```typescript
// Create order
POST /api/orders
{
  "patientId": "...",
  "requestedBy": "provider-id",
  "priority": "routine",
  "clinicalHistory": "Annual checkup",
  "items": [
    { "testId": "test-1", "price": 50.00 },
    { "testId": "test-2", "price": 75.00 }
  ]
}

// Update order status
PATCH /api/orders/:id/status
{
  "status": "collected",
  "note": "Specimen collected at 08:30"
}

// Get order details with all relations
GET /api/orders/:id?include=patient,items,specimens,results

// Worklist view
GET /api/orders/worklist?status=in_progress&priority=urgent
```

**Business Logic:**
```typescript
// src/modules/orders/orders.service.ts
async createOrder(dto: CreateOrderDto, userId: string) {
  // 1. Validate patient exists
  // 2. Calculate total price
  // 3. Create order with items in transaction
  
  return this.prisma.$transaction(async (tx) => {
    const order = await tx.labOrder.create({
      data: {
        patientId: dto.patientId,
        requestedByUser: userId,
        priority: dto.priority,
        status: 'requested',
        items: {
          create: dto.items.map(item => ({
            testId: item.testId,
            price: item.price,
            status: 'requested'
          }))
        }
      },
      include: {
        patient: true,
        items: {
          include: { test: true }
        }
      }
    });

    // Generate order number (already handled by sequence)
    return order;
  });
}

async updateOrderStatus(
  orderId: string, 
  status: OrderStatus,
  userId: string
) {
  // Validate status transition
  const order = await this.prisma.labOrder.findUnique({
    where: { id: orderId }
  });

  if (!this.isValidTransition(order.status, status)) {
    throw new BadRequestException('Invalid status transition');
  }

  return this.prisma.labOrder.update({
    where: { id: orderId },
    data: { status }
  });
}
```

**Deliverables:**
- ✅ Test catalog with reference ranges
- ✅ Order creation with items
- ✅ Status workflow management
- ✅ Worklist views

---

## 🔬 Phase 4: Specimen & Results (Week 7-8)

### Week 7: Specimen Management

**Day 22-24: Specimen Tracking**

**Features:**
- Barcode generation
- Specimen lifecycle tracking
- Quality checks (rejection handling)
- Storage location tracking

**APIs:**
```typescript
// Collect specimen
POST /api/specimens
{
  "orderItemId": "...",
  "specimenTypeId": "...",
  "barcode": "SPEC-2024-001",
  "collectedAt": "2024-01-15T08:30:00Z",
  "collectedBy": "user-id",
  "container": "Red top tube",
  "volumeMl": 5.0
}

// Receive specimen in lab
PATCH /api/specimens/:id/receive
{
  "receivedBy": "user-id",
  "receivedAt": "2024-01-15T09:00:00Z",
  "status": "received"
}

// Reject specimen
PATCH /api/specimens/:id/reject
{
  "rejectedReason": "Hemolyzed sample",
  "status": "rejected"
}

// Barcode lookup
GET /api/specimens/barcode/:barcode
```

### Week 8: Test Results

**Day 25-28: Result Entry & Verification**

**Features:**
- Multiple result types (numeric, text, JSON)
- Auto-calculation of flags (High/Low/Critical)
- Delta checks (comparison with previous)
- Two-step verification (preliminary → final)
- Critical value alerts

**APIs:**
```typescript
// Enter preliminary result
POST /api/results
{
  "orderItemId": "...",
  "specimenId": "...",
  "valueNumeric": 8500,
  "unitId": "...",
  "status": "preliminary",
  "reportedBy": "user-id"
}

// Verify result
PATCH /api/results/:id/verify
{
  "verifiedBy": "user-id",
  "status": "final"
}

// Batch result entry (from analyzer)
POST /api/results/batch
{
  "worksheetId": "...",
  "results": [
    { "orderItemId": "...", "valueNumeric": 8500 },
    { "orderItemId": "...", "valueNumeric": 12.5 }
  ]
}

// Critical results pending notification
GET /api/results/critical?notified=false
```

**Auto-Flag Logic:**
```typescript
// Implemented via database trigger, but also in application
async calculateFlags(result: TestResult, patient: Patient) {
  const refRange = await this.getApplicableReferenceRange(
    result.testId,
    patient.gender,
    patient.birthDate
  );

  if (!refRange || !result.valueNumeric) return null;

  const value = result.valueNumeric;
  const { low, high } = refRange;

  // Critical thresholds (customize per test)
  if (value < low * 0.5) return 'LL'; // Critical Low
  if (value > high * 1.5) return 'HH'; // Critical High
  if (value < low) return 'L';         // Low
  if (value > high) return 'H';        // High
  
  return null; // Normal
}
```

**Deliverables:**
- ✅ Specimen tracking with barcode
- ✅ Result entry (all value types)
- ✅ Auto-flagging system
- ✅ Two-step verification workflow
- ✅ Critical value detection

---

## 💰 Phase 5: Billing & Reports (Week 9-10)

### Week 9: Billing Module

**Day 29-32: Invoice Management**

**APIs:**
```typescript
// Auto-generate invoice from order
POST /api/invoices/from-order/:orderId

// Manual invoice creation
POST /api/invoices
{
  "patientId": "...",
  "orderId": "...",
  "items": [
    {
      "orderItemId": "...",
      "description": "CBC",
      "quantity": 1,
      "unitPrice": 50.00
    }
  ]
}

// Record payment
POST /api/invoices/:id/payments
{
  "amount": 125.00,
  "method": "cash",
  "paidAt": "2024-01-15T10:00:00Z"
}

// Invoice summary
GET /api/invoices?status=issued&dueDate[lte]=2024-01-31
```

### Week 10: Reporting

**Day 33-35: Reports & Analytics**

**Reports:**
1. **Patient Result Report** (PDF/Print)
2. **Daily Workload Report**
3. **QC Summary Report**
4. **Revenue Report**
5. **TAT Analysis**

**APIs:**
```typescript
// Generate patient report
GET /api/reports/patient/:patientId/results?orderId=...&format=pdf

// Daily workload
GET /api/reports/workload?date=2024-01-15

// Revenue summary
GET /api/reports/revenue?startDate=2024-01-01&endDate=2024-01-31

// TAT analysis
GET /api/reports/tat?department=Hematology&period=monthly
```

**Deliverables:**
- ✅ Invoicing system
- ✅ Payment tracking
- ✅ Basic reports (5 types)
- ✅ PDF generation

---

## 🚀 Phase 6: Deployment & Optimization (Week 11-12)

### Week 11: Fly.io Deployment

**Day 36-38: Production Setup**

**1. Fly.io Configuration:**
```toml
# fly.toml
app = "lab-api"
primary_region = "sin"  # Singapore

[build]
  builder = "paketobuildpacks/builder:base"
  buildpacks = ["gcr.io/paketo-buildpacks/nodejs"]

[env]
  PORT = "8080"
  NODE_ENV = "production"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

[[services]]
  protocol = "tcp"
  internal_port = 8080

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20

# Resource allocation for 1GB RAM
[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 1024
```

**2. Database on Fly.io:**
```bash
# Create Postgres app (256MB for small setup)
flyctl postgres create \
  --name lab-postgres \
  --region sin \
  --vm-size shared-cpu-1x \
  --volume-size 10 \
  --initial-cluster-size 1

# Attach to app
flyctl postgres attach lab-postgres --app lab-api

# Run migrations
flyctl ssh console -a lab-api
npx prisma migrate deploy
```

**3. Deployment Script:**
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Deploying to Fly.io..."

# Build application
npm run build

# Deploy
flyctl deploy --remote-only

# Run migrations
flyctl ssh console -a lab-api -C "npx prisma migrate deploy"

# Verify
flyctl status -a lab-api

echo "✅ Deployment complete!"
echo "🌐 App URL: https://lab-api.fly.dev"
```

**4. Monitoring:**
```bash
# Setup metrics
flyctl metrics -a lab-api

# View logs
flyctl logs -a lab-api

# Setup alerts (via Fly.io dashboard)
```

### Alternative: VPS Deployment (1GB RAM)

**Day 36-38: VPS Setup (Hetzner/DigitalOcean)**

**1. Server Setup:**
```bash
# Ubuntu 22.04 LTS
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx
```

**2. Application Deployment:**
```bash
# Clone & build
cd /var/www
git clone https://github.com/your-org/lab-api.git
cd lab-api
npm ci --production
npm run build

# Setup environment
cp .env.example .env
nano .env  # Configure production settings

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start dist/main.js --name lab-api
pm2 startup
pm2 save
```

**3. Nginx Configuration:**
```nginx
# /etc/nginx/sites-available/lab-api
server {
    listen 80;
    server_name api.labsystem.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    client_max_body_size 10M;
}

# Enable site
sudo ln -s /etc/nginx/sites-available/lab-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL
sudo certbot --nginx -d api.labsystem.com
```

**4. Database Optimization (1GB RAM):**
```sql
-- /etc/postgresql/15/main/postgresql.conf
shared_buffers = 256MB
effective_cache_size = 768MB
maintenance_work_mem = 64MB
work_mem = 2MB
max_connections = 50

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Day 39-40: Performance Optimization

**1. Caching Strategy:**
```typescript
// src/common/interceptors/cache.interceptor.ts
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

// Cache test catalog (rarely changes)
@Get()
@UseInterceptors(CacheInterceptor)
@CacheTTL(3600) // 1 hour
async getTests() {
  return this.testsService.findAll();
}

// Cache patient demographics
@Get(':id')
@CacheKey('patient')
@CacheTTL(300) // 5 minutes
async getPatient(@Param('id') id: string) {
  return this.patientsService.findById(id);
}
```

**2. Database Connection Pooling:**
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pool for 1GB RAM server
  connectionLimit = 10
}

// .env.production
DATABASE_URL="postgresql://user:pass@localhost:5432/labdb?schema=lab&connection_limit=10&pool_timeout=60"
```

**3. Query Optimization:**
```typescript
// Use cursor-based pagination for large datasets
async findOrders(cursor?: string, limit = 20) {
  return this.prisma.labOrder.findMany({
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      patient: {
        select: { id: true, mrn: true, givenName: true, familyName: true }
      },
      _count: {
        select: { items: true }
      }
    }
  });
}
```

### Day 41-42: Testing & Documentation

**1. Setup Tests:**
```bash
npm install -D @nestjs/testing jest supertest
npm install -D @types/jest @types/supertest
```

**2. E2E Tests:**
```typescript
// test/orders.e2e-spec.ts
describe('Orders (e2e)', () => {
  it('/api/orders (POST) - should create order', () => {
    return request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patientId: testPatient.id,
        priority: 'routine',
        items: [{ testId: testTest.id, price: 50 }]
      })
      .expect(201)
      .expect(res => {
        expect(res.body.orderNo).toBeDefined();
        expect(res.body.status).toBe('requested');
      });
  });
});
```

**3. API Documentation:**
```typescript
// main.ts - Swagger setup
const config = new DocumentBuilder()
  .setTitle('Clinical Lab API')
  .setDescription('Laboratory Information System API')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('auth', 'Authentication endpoints')
  .addTag('patients', 'Patient management')
  .addTag('orders', 'Lab order management')
  .addTag('results', 'Test results')
  .addTag('billing', 'Invoicing and payments')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Deliverables:**
- ✅ Production deployment (Fly.io or VPS)
- ✅ SSL/TLS configured
- ✅ Monitoring setup
- ✅ Performance optimization
- ✅ E2E tests (>70% coverage)
- ✅ Complete API documentation

---

## 🎯 Phase 7: Advanced Features (Week 13-14)

### Week 13: Quality Control & Worksheets

**Day 43-45: QC Module**

**Features:**
- Levey-Jennings charts
- Westgard rules implementation
- QC lot management
- Out-of-control detection

**APIs:**
```typescript
// Enter QC result
POST /api/qc-results
{
  "testId": "...",
  "controlLot": "LOT-2024-001",
  "controlLevel": "normal",
  "measuredValue": 8.5,
  "expectedMean": 8.2,
  "expectedSd": 0.3,
  "measuredBy": "user-id"
}

// QC analysis
GET /api/qc-results/analysis?testId=...&period=30days

// Check QC status before running
GET /api/qc-results/status?testId=...
```

**Westgard Rules:**
```typescript
// src/modules/qc/qc.service.ts
async evaluateWestgardRules(testId: string, recentResults: QCResult[]) {
  // 1₂s - 1 measurement > 2SD
  // 1₃s - 1 measurement > 3SD (reject)
  // 2₂s - 2 consecutive > 2SD (reject)
  // R₄s - Range of 2 consecutive > 4SD (reject)
  // 4₁s - 4 consecutive > 1SD same side (reject)
  // 10x - 10 consecutive same side of mean (reject)
  
  const violations = [];
  
  // Check 1₃s rule
  const critical = recentResults.find(r => Math.abs(r.zScore) > 3);
  if (critical) {
    violations.push({
      rule: '1_3s',
      severity: 'critical',
      message: 'One measurement exceeded 3 SD'
    });
  }
  
  // Check 2₂s rule
  if (recentResults.length >= 2) {
    const lastTwo = recentResults.slice(-2);
    if (lastTwo.every(r => Math.abs(r.zScore) > 2)) {
      violations.push({
        rule: '2_2s',
        severity: 'critical',
        message: 'Two consecutive measurements exceeded 2 SD'
      });
    }
  }
  
  // ... implement other rules
  
  return {
    inControl: violations.length === 0,
    violations
  };
}
```

### Day 46-49: Worksheet Management

**Features:**
- Batch specimen processing
- Analyzer integration prep
- Worksheet review & approval
- Batch result entry

**APIs:**
```typescript
// Create worksheet
POST /api/worksheets
{
  "testId": "...",
  "analyzerId": "...",
  "specimenIds": ["spec-1", "spec-2", "spec-3"]
}

// Add specimens to worksheet
POST /api/worksheets/:id/specimens
{
  "specimenIds": ["spec-4", "spec-5"]
}

// Batch result entry
POST /api/worksheets/:id/results
{
  "results": [
    { "specimenId": "spec-1", "valueNumeric": 8500 },
    { "specimenId": "spec-2", "valueNumeric": 7200 }
  ]
}

// Complete worksheet
PATCH /api/worksheets/:id/complete
{
  "qcPassed": true,
  "reviewedBy": "user-id"
}
```

### Week 14: Notifications & Integrations

**Day 50-52: Notification System**

**Features:**
- Critical result alerts
- Order status notifications
- Email/SMS integration
- In-app notifications

**Implementation:**
```typescript
// src/modules/notifications/notifications.service.ts
@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications') private notificationQueue: Queue
  ) {}

  async sendCriticalValueAlert(result: TestResult) {
    const order = await this.prisma.labOrder.findFirst({
      where: { items: { some: { id: result.orderItemId } } },
      include: {
        patient: true,
        requestedBy: true
      }
    });

    // Queue notification job
    await this.notificationQueue.add('critical-alert', {
      resultId: result.id,
      patientName: `${order.patient.givenName} ${order.patient.familyName}`,
      testName: result.test.name,
      value: result.valueNumeric,
      providerContact: order.requestedBy?.contact
    });
  }
}

// Worker processor
@Processor('notifications')
export class NotificationProcessor {
  @Process('critical-alert')
  async handleCriticalAlert(job: Job) {
    const { providerContact } = job.data;
    
    // Send email
    await this.emailService.send({
      to: providerContact.email,
      subject: 'CRITICAL: Lab Result Alert',
      template: 'critical-result',
      data: job.data
    });

    // Send SMS if configured
    if (providerContact.phone) {
      await this.smsService.send({
        to: providerContact.phone,
        message: `CRITICAL LAB RESULT: ${job.data.testName} - Please check immediately`
      });
    }
  }
}
```

**Day 53-56: External Integrations**

**1. HL7 Interface (for analyzer integration):**
```typescript
// src/modules/integrations/hl7/hl7.service.ts
async parseHL7Result(message: string) {
  // Parse HL7 ORU^R01 message
  const segments = message.split('\r');
  const msh = this.parseSegment(segments[0]); // Message Header
  const pid = this.parseSegment(segments[1]); // Patient ID
  const obr = this.parseSegment(segments[2]); // Order
  const obx = this.parseSegment(segments[3]); // Observation

  return {
    patientId: pid[3], // MRN
    testCode: obx[3],
    value: obx[5],
    units: obx[6],
    referenceRange: obx[7],
    timestamp: obx[14]
  };
}
```

**2. FHIR API (for interoperability):**
```typescript
// src/modules/integrations/fhir/fhir.controller.ts
@Controller('fhir')
export class FhirController {
  // Get patient resource
  @Get('Patient/:id')
  async getPatient(@Param('id') id: string) {
    const patient = await this.patientsService.findById(id);
    
    return {
      resourceType: 'Patient',
      id: patient.id,
      identifier: [
        { system: 'MRN', value: patient.mrn }
      ],
      name: [{
        family: patient.familyName,
        given: [patient.givenName]
      }],
      gender: patient.gender,
      birthDate: patient.birthDate
    };
  }

  // Get observation (result) resource
  @Get('Observation/:id')
  async getObservation(@Param('id') id: string) {
    const result = await this.resultsService.findById(id);
    
    return {
      resourceType: 'Observation',
      id: result.id,
      status: result.status,
      code: {
        coding: [{
          system: 'LOINC',
          code: result.test.loincCode,
          display: result.test.name
        }]
      },
      subject: {
        reference: `Patient/${result.order.patientId}`
      },
      valueQuantity: {
        value: result.valueNumeric,
        unit: result.unit.symbol
      },
      referenceRange: [{
        low: { value: result.referenceLow },
        high: { value: result.referenceHigh }
      }]
    };
  }
}
```

**Deliverables:**
- ✅ QC system with Westgard rules
- ✅ Worksheet batch processing
- ✅ Critical value notifications
- ✅ HL7/FHIR integration ready

---

## 📊 Resource Requirements & Cost Estimate

### Fly.io Deployment (Recommended for MVP)

**Monthly Costs:**
```
Application (shared-cpu-1x, 1GB RAM)     $3.50/mo
  - Auto-sleep when idle
  - Auto-scale to 2 instances under load

PostgreSQL (shared-cpu-1x, 256MB, 10GB)  $3.00/mo
  - Managed backups
  - Point-in-time recovery

Outbound bandwidth (estimated 50GB)      $4.50/mo

Total:                                   ~$11/mo
```

**Scaling Options:**
- Upgrade to 2GB RAM: +$7/mo
- Larger database: 1GB RAM + 50GB = $15/mo
- Multiple regions: +$11/mo per region

### VPS Alternative (Hetzner)

**Monthly Costs:**
```
CX11 (1 vCPU, 2GB RAM, 20GB SSD)        €4.15/mo (~$4.50)
Backup option                            €0.83/mo (~$0.90)
Total:                                   ~$5.40/mo
```

**Performance Capacity (1GB RAM setup):**
- Concurrent users: 20-30
- Orders per day: 200-500
- Database size: Up to 50GB
- Response time: <200ms (95th percentile)

---

## 🎯 MVP Feature Prioritization

### Must-Have (Phase 1-6) - 12 weeks
- ✅ User authentication & RBAC
- ✅ Patient management
- ✅ Test catalog
- ✅ Order creation & workflow
- ✅ Result entry & verification
- ✅ Basic invoicing
- ✅ Patient result report (PDF)

### Nice-to-Have (Phase 7) - 2 weeks
- ⭐ QC management
- ⭐ Batch processing
- ⭐ Critical alerts
- ⭐ Advanced reports

### Future Enhancements - Post-launch
- 📱 Mobile app (React Native)
- 🔬 Analyzer direct integration
- 📊 Business intelligence dashboard
- 🏥 Multi-facility support
- 📧 Patient portal
- 🔔 WhatsApp notifications
- 🌐 Multi-language support

---

## 🛠️ Development Tools & Best Practices

### Required Tools
```bash
# Core
- Node.js 20 LTS
- PostgreSQL 15+
- Git

# Development
- VSCode with extensions:
  - Prisma
  - ESLint
  - Prettier
  - REST Client
  
# Testing
- Postman/Insomnia
- pgAdmin 4

# Deployment
- Fly CLI / SSH client
- Docker Desktop (optional)
```

### Code Standards
```typescript
// Use DTOs for validation
export class CreateOrderDto {
  @IsUUID()
  patientId: string;

  @IsEnum(Urgency)
  priority: Urgency;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

// Use custom decorators
@CurrentUser() // Extract user from JWT
@CurrentOrg()  // Extract org context

// Repository pattern
export class OrdersRepository extends BaseRepository<LabOrder> {
  protected get model() {
    return this.prisma.labOrder;
  }
}

// Service layer business logic
export class OrdersService {
  async createOrder(dto: CreateOrderDto, userId: string) {
    // Business validation
    // Transaction handling
    // Error handling
  }
}
```

### Git Workflow
```bash
# Branch naming
feature/patient-search
fix/order-status-validation
hotfix/critical-result-notification

# Commit messages
feat: add patient search with full-text
fix: prevent duplicate order items
docs: update API documentation
test: add order creation e2e tests
```

### Environment Management
```bash
# Development
.env.development

# Staging
.env.staging

# Production
.env.production

# Never commit .env files!
# Use Fly.io secrets or VPS environment variables
```

---

## 🚨 Common Pitfalls & Solutions

### 1. Database Connection Issues (1GB RAM)
**Problem:** Connection pool exhaustion
**Solution:**
```typescript
// Limit connections
DATABASE_URL="...?connection_limit=5"

// Implement connection retry
async onModuleInit() {
  let retries = 5;
  while (retries > 0) {
    try {
      await this.$connect();
      break;
    } catch (e) {
      retries--;
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}
```

### 2. Memory Leaks
**Problem:** Application crashes on 1GB RAM
**Solution:**
```typescript
// Implement pagination everywhere
async findMany(page = 1, limit = 20) {
  return this.prisma.patient.findMany({
    skip: (page - 1) * limit,
    take: limit
  });
}

// Stream large exports
async exportToCSV(res: Response) {
  const stream = await this.prisma.labOrder.findMany({
    select: { id: true, orderNo: true }
  });
  
  res.setHeader('Content-Type', 'text/csv');
  return stream;
}
```

### 3. Slow Queries
**Problem:** Timeout on complex queries
**Solution:**
```typescript
// Add indexes in Prisma
@@index([patientId, requestedAt])
@@index([status, priority])

// Use raw queries for complex aggregations
const stats = await this.prisma.$queryRaw`
  SELECT 
    DATE(requested_at) as date,
    COUNT(*) as total
  FROM lab.lab_orders
  WHERE requested_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE(requested_at)
`;
```

### 4. RLS Performance Impact
**Problem:** Slow queries with RLS enabled
**Solution:**
```typescript
// Set context once per request
@Injectable()
export class OrgContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const orgId = request.user?.orgId;
    
    if (orgId) {
      this.prisma.setOrgContext(orgId);
    }
    
    return next.handle();
  }
}

// Bypass RLS for admin queries
await this.prisma.$executeRaw`SET app.bypass_rls = 'true'`;
```

### 5. Audit Log Growth
**Problem:** audit_logs table grows too large
**Solution:**
```bash
# Setup cron job for archival
0 0 1 * * cd /var/www/lab-api && npm run archive-audit-logs

# Archive script
async archiveOldLogs() {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 6);
  
  // Move to archive table
  await this.prisma.$executeRaw`
    INSERT INTO lab.audit_logs_archive
    SELECT * FROM lab.audit_logs
    WHERE changed_at < ${cutoff}
  `;
  
  // Delete from main table
  await this.prisma.auditLog.deleteMany({
    where: { changedAt: { lt: cutoff } }
  });
}
```

---

## 📈 Performance Benchmarks (1GB RAM)

### Expected Metrics

**API Response Times:**
- Authentication: <100ms
- Patient search: <150ms
- Order creation: <200ms
- Result entry: <150ms
- Report generation: <2s

**Database Performance:**
- Simple queries: <10ms
- Complex joins: <50ms
- Aggregations: <100ms
- Full-text search: <30ms

**System Load:**
- CPU usage: 20-40% (normal)
- Memory usage: 600-800MB (normal)
- Database connections: 3-8 (normal)

**Capacity:**
- Orders/day: 500
- Concurrent users: 25
- Results/hour: 200
- PDF reports/hour: 100

---

## ✅ Go-Live Checklist

### Week 12 - Pre-Production
- [ ] All Phase 1-6 features tested
- [ ] Database migrations tested on staging
- [ ] Backup/restore procedure documented
- [ ] SSL certificate installed
- [ ] Environment variables configured
- [ ] Monitoring dashboards setup
- [ ] User training completed
- [ ] Data migration plan (if applicable)

### Week 13 - Soft Launch
- [ ] Deploy to production
- [ ] Import initial data (specimen types, tests, units)
- [ ] Create admin users
- [ ] Test critical workflows
- [ ] Monitor error logs
- [ ] Gradual user rollout (5-10 users)

### Week 14 - Full Launch
- [ ] All users onboarded
- [ ] Support documentation published
- [ ] Incident response plan active
- [ ] Daily monitoring routine established
- [ ] Feedback collection system active

---

## 📞 Support & Maintenance Plan

### Daily Tasks (15 mins)
- Check error logs
- Monitor critical result notifications
- Verify database backups

### Weekly Tasks (1 hour)
- Review system performance
- Check QC failures
- Analyze TAT reports
- Update test catalog if needed

### Monthly Tasks (2-3 hours)
- Security updates
- Database optimization
- Archive old audit logs
- Review and optimize slow queries
- Capacity planning review

### Quarterly Tasks
- Major feature releases
- User feedback implementation
- Infrastructure scaling review

---

## 🎓 Learning Resources

### NestJS
- Official docs: https://docs.nestjs.com
- Udemy: "NestJS Zero to Hero"
- GitHub: awesome-nestjs

### Prisma
- Official docs: https://www.prisma.io/docs
- Prisma Examples: https://github.com/prisma/prisma-examples

### PostgreSQL
- PostgreSQL Tutorial: https://www.postgresqltutorial.com
- Use The Index, Luke: https://use-the-index-luke.com

### Deployment
- Fly.io docs: https://fly.io/docs
- Deploy NestJS to Fly: https://fly.io/docs/languages-and-frameworks/node/

---

## 🎯 Success Criteria

**Technical:**
- 99.5% uptime
- <200ms API response time (p95)
- Zero data loss
- <1 hour recovery time

**Business:**
- Handle 500+ orders/day
- <5 min TAT for critical results
- 100% result traceability
- Audit compliance ready

**User Satisfaction:**
- <3 clicks to common actions
- <30 min new user training
- 90%+ user satisfaction score

---

## 📝 Final Notes

**Estimated Timeline:**
- MVP (Phase 1-6): **12 weeks** (3 months)
- Advanced Features (Phase 7): **2 weeks**
- Total: **14 weeks** (~3.5 months)

**Team Requirements:**
- 1 Full-stack developer (NestJS + PostgreSQL)
- 1 QA tester (part-time)
- 1 Lab domain expert (consultant)

**Budget Estimate:**
- Hosting (Fly.io): $11/mo
- Domain + SSL: $20/year
- Development: $15,000-25,000 (contractor)
- Total first year: ~$15,500-25,500

**Risk Mitigation:**
- Start with MVP only (Phase 1-6)
- Use managed services (Fly.io) for easier ops
- Implement comprehensive logging early
- Have rollback plan for each deployment
- Regular backups (automated + manual)

---

**Ready to start? Begin with Phase 0! 🚀**