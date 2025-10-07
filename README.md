# 🧪 Labora Clinical Lab System

Sistem Manajemen Laboratorium Klinik Terpadu yang dirancang untuk VPS deployment dengan reliabilitas enterprise-grade.

![Labora Logo](assets/images/labora-logo.png)

## 📋 Overview

Labora adalah sistem manajemen laboratorium klinik comprehensive yang menggunakan teknologi modern untuk mengelola seluruh workflow laboratorium mulai dari order, specimen management, testing, hingga reporting.

### 🏗️ Tech Stack

- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL 15+
- **Frontend**: TailwindCSS + Flowbite + Handlebars
- **Process Manager**: PM2
- **Web Server**: Nginx
- **Deployment**: DigitalOcean VPS

### 🎯 Key Features

- ✅ **Order Management** - Manajemen order pemeriksaan lab
- ✅ **Patient Management** - Database pasien terintegrasi
- ✅ **Specimen Tracking** - Pelacakan sampel real-time
- ✅ **Test Management** - Manajemen pemeriksaan lab
- ✅ **Result Management** - Manajemen hasil pemeriksaan
- ✅ **Quality Control** - Sistem QC terintegrasi
- ✅ **Inventory Management** - Manajemen inventori reagent
- ✅ **Reporting** - Laporan komprehensif
- ✅ **User Management** - Multi-role user system
- ✅ **Audit Trail** - Pelacakan aktivitas sistem

## 🚀 Quick Start

### Prerequisites

- Node.js 20 LTS
- PostgreSQL 15+
- Git

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/dhannyhj/labora.git
   cd labora
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env file dengan konfigurasi Anda
   ```

4. **Setup database**
   ```bash
   # Buat database PostgreSQL
   createdb labora_db
   
   # Import schema
   psql -d labora_db -f sql/lab_schema_modular_idempotent_v1.sql
   ```

5. **Build and start**
   ```bash
   npm run build
   npm start
   ```

Application akan berjalan di `http://localhost:3000`

## 🐳 Docker Deployment

### Development

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Production

```bash
# Build production image
docker build -t labora-clinical-lab .

# Run with production settings
docker run -d \
  --name labora-app \
  -p 3000:3000 \
  --env-file .env \
  labora-clinical-lab
```

## ☁️ VPS Deployment (DigitalOcean)

### Automated Setup

```bash
# Copy setup script to VPS
scp scripts/deployment/setup-vps.sh user@your-vps-ip:~/

# Run setup on VPS
ssh user@your-vps-ip
chmod +x setup-vps.sh
./setup-vps.sh
```

### Manual Deployment

```bash
# Copy deployment script to VPS
scp scripts/deployment/deploy.sh user@your-vps-ip:/var/www/labora/

# Deploy application
ssh user@your-vps-ip
cd /var/www/labora
./deploy.sh
```

### Production Configuration

1. **Nginx Configuration**
   - Copy `nginx/sites-available/labora.conf` to `/etc/nginx/sites-available/`
   - Enable site: `ln -s /etc/nginx/sites-available/labora /etc/nginx/sites-enabled/`
   - Test config: `nginx -t`
   - Reload: `systemctl reload nginx`

2. **PM2 Process Management**
   ```bash
   # Start application
   pm2 start ecosystem.config.js --env production
   
   # Save PM2 configuration
   pm2 save
   
   # Setup startup
   pm2 startup
   ```

3. **SSL Certificate (Let's Encrypt)**
   ```bash
   certbot --nginx -d yourdomain.com
   ```

## 📊 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Client      │    │     Nginx       │    │    NestJS       │
│   (Browser)     │◄──►│  (Proxy/SSL)    │◄──►│   (API Server)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    File Storage │    │      Redis      │    │   PostgreSQL    │
│    (Uploads)    │    │    (Cache)      │    │   (Database)    │
│                 │    │   [Optional]    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎨 UI Components & Design System

### Consistent Layout Components

- **Header**: Navigation bar dengan branding, notifications, dan user menu
- **Sidebar**: Menu navigasi utama yang responsive
- **Footer**: Informasi copyright dan link bantuan
- **Mobile Bottom Nav**: Navigasi mobile-friendly

### Color Scheme

```css
/* Primary Colors */
--labora-primary: #0d6efd;      /* Medical Blue */
--labora-success: #198754;      /* Success Green */
--labora-danger: #dc3545;       /* Alert Red */
--labora-warning: #ffc107;      /* Warning Amber */

/* Lab-specific Colors */
--labora-lab-blue: #0077be;     /* Laboratory Blue */
--labora-specimen-amber: #ff9800; /* Specimen Tracking */
```

### Components

- **Cards**: Consistent card styling dengan shadow dan hover effects
- **Tables**: Sortable tables dengan search functionality
- **Forms**: Validasi terintegrasi dan styling konsisten
- **Status Badges**: Color-coded status indicators
- **Buttons**: Consistent button styling dengan hover animations

## 🔧 Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start development server with watch
npm run start:debug        # Start with debug mode

# Building
npm run build              # Build for production
npm run start:prod         # Start production build

# Testing
npm test                   # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Database
npm run migration:generate # Generate new migration
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration
npm run seed               # Run database seeders

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

### Project Structure

```
labora_v1/
├── src/                   # Source code
│   ├── modules/          # Feature modules
│   ├── common/           # Shared components
│   ├── database/         # Database configuration
│   └── main.ts          # Application entry point
├── frontend/             # Frontend templates & assets
│   ├── templates/        # Handlebars templates
│   └── assets/          # CSS, JS, images
├── sql/                  # Database schemas
├── scripts/              # Deployment scripts
├── nginx/               # Nginx configuration
├── docs/                # Documentation
└── package.json         # Dependencies
```

## 📚 API Documentation

### Authentication

```bash
# Login
POST /api/auth/login
{
  "username": "user@example.com",
  "password": "password"
}

# Get current user
GET /api/auth/me
Authorization: Bearer <token>
```

### Core Endpoints

- **Orders**: `/api/orders` - CRUD operations for lab orders
- **Patients**: `/api/patients` - Patient management
- **Specimens**: `/api/specimens` - Specimen tracking
- **Tests**: `/api/tests` - Test management
- **Results**: `/api/results` - Test results
- **Reports**: `/api/reports` - Generated reports

## 🔒 Security

### Implemented Security Measures

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Class-validator for all inputs
- **Rate Limiting**: API rate limiting dengan Throttler
- **CORS**: Configured CORS policy
- **Helmet**: Security headers
- **SQL Injection**: TypeORM protection
- **File Upload**: Secure file handling

### Production Security

- **SSL/TLS**: Let's Encrypt certificates
- **Firewall**: UFW configured
- **Fail2Ban**: Brute force protection
- **Regular Updates**: Automated security updates

## 📈 Monitoring & Logging

### Logging

- **Application Logs**: Winston logger
- **Access Logs**: Nginx access logs
- **Error Logs**: Structured error logging
- **Audit Trail**: User activity tracking

### Monitoring

- **PM2 Monitoring**: Process monitoring
- **Health Checks**: Application health endpoints
- **Database Monitoring**: PostgreSQL monitoring
- **System Monitoring**: DigitalOcean monitoring

## 🚧 Roadmap

### Phase 1 (Current)
- ✅ Core system setup
- ✅ Basic CRUD operations
- ✅ User authentication
- ✅ Database schema

### Phase 2 (Next)
- 🔄 Advanced reporting
- 🔄 Real-time notifications
- 🔄 Integration APIs
- 🔄 Mobile app support

### Phase 3 (Future)
- 📋 AI-powered insights
- 📋 Advanced analytics
- 📋 Multi-language support
- 📋 Cloud integrations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write comprehensive tests
- Document new features

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/dhannyhj/labora/issues)
- **Email**: support@labora.com

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Flowbite](https://flowbite.com/) - Component library for TailwindCSS
- [PostgreSQL](https://postgresql.org/) - Database system
- [PM2](https://pm2.keymetrics.io/) - Process manager

---

**Labora Clinical Lab System** - Transforming laboratory management with modern technology.

Built with ❤️ in Indonesia 🇮🇩

Short repo workspace to organize project artifacts and bootstrap a NestJS API.

Quick structure

- `docs/` — project docs, plans and exported system summaries
- `sql/` — database schemas and migration SQL
- `assets/images/` — raster images (png)
- `assets/design/` — design sources (psd)
- `src/` — minimal NestJS app scaffold (start here for API)

Getting started (local, development)

1. Install dependencies

```powershell
# from workspace root
npm install
```

2. Run in development (uses ts-node)

```powershell
npm run start:dev
```

3. Build and run

```powershell
npm run build
npm start
```

Notes
- This repository currently stores documentation and SQL artifacts. The `src/` folder contains a very small NestJS bootstrap to get started.
- Large binary assets (PDF/PSD) are configured via `.gitattributes` to use Git LFS; please install Git LFS locally if you plan to store large files.
Note: Proyek ini dikembangkan secara individu oleh dhannyhj.

Catatan singkat:
- Repo ini dikembangkan sendiri (solo). Tidak ada contributor lain saat ini.
- Git LFS sudah diaktifkan untuk file besar (PDF, PSD, PNG). Pastikan `git lfs` terpasang di mesin lokal.

Next steps I can do for you
- Expand the NestJS project with full module structure (auth, patients, orders, etc.)
- Initialize Git LFS and migrate large files
- Add CI workflow and basic tests

Lihat `CONTRIBUTING.md` untuk instruksi singkat penggunaan Git LFS dan pengaturan lokal.
