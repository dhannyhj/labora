# 🚀 Setup Guide - Labora Clinical Lab System

## 📋 Pre-Installation Checklist

Sebelum memulai instalasi, pastikan semua requirement telah terpenuhi:

### System Requirements

#### Minimum Requirements (Development)
- **OS**: Windows 10/11, macOS 10.15+, atau Ubuntu 20.04+
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 10GB free space
- **Node.js**: 20.x LTS
- **Database**: PostgreSQL 15+

#### Recommended Requirements (Production VPS)
- **VPS**: DigitalOcean Droplet 4GB RAM, 2 vCPU, 80GB SSD
- **OS**: Ubuntu 22.04 LTS
- **CPU**: 2+ cores
- **RAM**: 4GB+
- **Storage**: 80GB+ SSD
- **Bandwidth**: 4TB transfer

### Required Software

✅ **Node.js 20 LTS**
```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v20.x.x
npm --version   # Should be 10.x.x
```

✅ **PostgreSQL 15+**
```bash
# Ubuntu/Debian
sudo apt install -y postgresql postgresql-contrib

# macOS
brew install postgresql@15

# Windows
# Download from https://www.postgresql.org/download/windows/
```

✅ **Git**
```bash
# Ubuntu/Debian
sudo apt install -y git

# macOS
brew install git

# Windows
# Download from https://git-scm.com/download/win
```

✅ **PM2 (Production)**
```bash
npm install -g pm2
```

---

## 🏗️ Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/dhannyhj/labora.git
cd labora
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Database Setup

#### Create Database
```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create user and database
CREATE USER labora_user WITH PASSWORD 'labora123';
CREATE DATABASE labora_db OWNER labora_user;
GRANT ALL PRIVILEGES ON DATABASE labora_db TO labora_user;
ALTER USER labora_user CREATEDB;
\q
```

#### Import Schema
```bash
# Import database schema
psql -U labora_user -d labora_db -f sql/lab_schema_modular_idempotent_v1.sql

# Verify tables created
psql -U labora_user -d labora_db -c "\dt lab.*"
```

### 4. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

**Required .env settings:**
```env
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=labora_db
DATABASE_USER=labora_user
DATABASE_PASSWORD=labora123
JWT_SECRET=your_jwt_secret_here
```

### 5. Build and Start Development

```bash
# Build application
npm run build

# Start development server
npm run start:dev

# Alternative: Start with watch mode
npm run start:dev
```

**Verify installation:**
- Open http://localhost:3000
- Should see health check response: `{"status":"ok","name":"labora-workspace"}`

---

## 🐳 Docker Development Setup

### 1. Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Manual Docker Build

```bash
# Build image
docker build -t labora-clinical-lab .

# Run container
docker run -d \
  --name labora-app \
  -p 3000:3000 \
  --env-file .env \
  labora-clinical-lab
```

---

## ☁️ Production VPS Setup (DigitalOcean)

### 1. Create DigitalOcean Droplet

**Recommended Configuration:**
- **Image**: Ubuntu 22.04 LTS x64
- **Plan**: Regular Intel - $24/month
  - 4GB RAM
  - 2 vCPUs  
  - 80GB SSD
  - 4TB transfer
- **Region**: Singapore (closest to Indonesia)
- **Authentication**: SSH Key (recommended)
- **Options**: Enable monitoring and backups

### 2. Initial VPS Setup

```bash
# Connect to VPS
ssh root@YOUR_VPS_IP

# Update system
apt update && apt upgrade -y

# Create non-root user
adduser labora
usermod -aG sudo labora

# Setup SSH key for new user
mkdir -p /home/labora/.ssh
cp /root/.ssh/authorized_keys /home/labora/.ssh/
chown -R labora:labora /home/labora/.ssh
chmod 700 /home/labora/.ssh
chmod 600 /home/labora/.ssh/authorized_keys

# Switch to new user
su - labora
```

### 3. Automated Setup Script

```bash
# Copy setup script to VPS
scp scripts/deployment/setup-vps.sh labora@YOUR_VPS_IP:~/

# Connect to VPS and run setup
ssh labora@YOUR_VPS_IP
chmod +x setup-vps.sh
./setup-vps.sh
```

**The setup script will:**
- Install Node.js 20 LTS
- Install PostgreSQL 15
- Install Nginx
- Configure UFW firewall
- Setup Fail2Ban
- Install PM2
- Create application directories
- Generate SSL certificate (if domain provided)

### 4. Manual Production Setup

If you prefer manual setup:

#### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql
CREATE USER labora_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE labora_db OWNER labora_user;
GRANT ALL PRIVILEGES ON DATABASE labora_db TO labora_user;
\q
```

#### Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Configure Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

#### Install PM2
```bash
sudo npm install -g pm2
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u labora --hp /home/labora
```

### 5. Deploy Application

```bash
# Clone repository to VPS
cd /var/www
sudo mkdir labora
sudo chown labora:labora labora
cd labora
git clone https://github.com/dhannyhj/labora.git .

# Install dependencies and build
npm ci --only=production
npm run build

# Setup environment
cp .env.example .env
nano .env  # Edit with production settings

# Import database schema
psql -U labora_user -d labora_db -f sql/lab_schema_modular_idempotent_v1.sql

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
```

### 6. Nginx Configuration

```bash
# Copy Nginx config
sudo cp nginx/sites-available/labora.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/labora /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 🔧 Development Workflow

### Daily Development

```bash
# Start development
npm run start:dev

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

### Database Operations

```bash
# Generate migration
npm run migration:generate -- -n AddNewFeature

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert

# Run seeds
npm run seed
```

### Building for Production

```bash
# Build application
npm run build

# Test production build locally
npm run start:prod
```

---

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database exists
psql -U labora_user -d labora_db -c "SELECT version();"

# Reset password
sudo -u postgres psql
ALTER USER labora_user PASSWORD 'new_password';
```

#### Permission Issues
```bash
# Fix ownership
sudo chown -R labora:labora /var/www/labora

# Fix permissions
chmod -R 755 /var/www/labora
```

#### Nginx Issues
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log
```

#### PM2 Issues
```bash
# View PM2 status
pm2 status

# View logs
pm2 logs

# Restart application
pm2 restart labora-api

# Reset PM2
pm2 kill
pm2 start ecosystem.config.js --env production
```

### Performance Optimization

#### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_orders_created_at ON lab.orders(created_at);
CREATE INDEX CONCURRENTLY idx_patients_name ON lab.patients(full_name);
CREATE INDEX CONCURRENTLY idx_specimens_barcode ON lab.specimens(barcode);
```

#### Nginx Optimization
```nginx
# Add to nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript;
client_max_body_size 10M;
```

---

## 📈 Monitoring & Maintenance

### Health Checks

```bash
# Application health
curl http://localhost:3000/health

# Database health
psql -U labora_user -d labora_db -c "SELECT 1;"

# Nginx health
curl -I http://localhost
```

### Log Monitoring

```bash
# Application logs
pm2 logs labora-api

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Backup Strategy

```bash
# Database backup
pg_dump -U labora_user -d labora_db -f backup_$(date +%Y%m%d_%H%M%S).sql

# Application backup
tar -czf labora_backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/labora

# Automated backup script
# Add to crontab: 0 2 * * * /path/to/backup_script.sh
```

---

## ✅ Setup Verification

After completing setup, verify everything works:

1. **Application Health**
   - [ ] http://localhost:3000/health returns `{"status":"ok"}`
   - [ ] No errors in PM2 logs
   - [ ] Database connection successful

2. **Web Server**
   - [ ] Nginx serving requests
   - [ ] SSL certificate valid (production)
   - [ ] Static files loading correctly

3. **Security**
   - [ ] Firewall configured
   - [ ] Fail2Ban running
   - [ ] Non-root user setup

4. **Monitoring**
   - [ ] PM2 monitoring active
   - [ ] Log rotation configured
   - [ ] Backup script working

---

**🎉 Setup Complete! Your Labora Clinical Lab System is ready for use.**

For additional help, refer to:
- [API Documentation](API_DOCUMENTATION.md)
- [User Guide](USER_GUIDE.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)