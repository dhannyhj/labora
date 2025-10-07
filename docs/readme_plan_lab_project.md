# 🧩 Clinical Lab System – VPS Production Ready (DigitalOcean)

## 📦 Overview
A comprehensive clinical laboratory management system optimized for VPS deployment with enterprise-grade reliability.

### 🏥 **Production Architecture (DigitalOcean VPS)**
- **Server**: DigitalOcean Droplet 4GB RAM, 2 vCPU, 80GB SSD
- **Backend**: NestJS API (PM2 managed) - 24/7 uptime
- **Database**: PostgreSQL 15+ (VPS) - unlimited capacity  
- **Frontend**: Next.js SSR/Static (Nginx served)
- **Storage**: VPS File System + DigitalOcean Spaces backup
- **Monitoring**: PM2 + Custom Dashboard + DigitalOcean Monitoring
- **Security**: UFW Firewall + SSL (Let's Encrypt) + Fail2Ban

**Target Capacity:**
- Orders per day: 1000-2000+
- Concurrent users: 50-100
- Database size: 500GB+
- File storage: 100GB+ (expandable)
- Response time: <100ms (95th percentile)

**Monthly Cost Estimate:**
- DigitalOcean Droplet 4GB: $24/month
- Domain + SSL: Free (Let's Encrypt)
- DigitalOcean Spaces (backup): $5/month
- **Total: ~$30/month**

---

## 🗂️ Phase 0: DigitalOcean VPS Setup & Infrastructure (Week 1)

### 🌊 DigitalOcean Droplet Specifications
```
Recommended Droplet:
- **Type**: Regular Intel/AMD
- **CPU**: 2 vCPUs
- **Memory**: 4GB RAM
- **Storage**: 80GB SSD
- **Bandwidth**: 4TB transfer
- **Cost**: $24/month
- **Region**: Singapore/Frankfurt (closest to Indonesia)
```

### 📍 Infrastructure Components
| Component | Technology | Location | Purpose |
|-----------|------------|----------|----------|
| **Application Server** | NestJS + PM2 | DigitalOcean VPS | API Backend |
| **Database** | PostgreSQL 15 | Same VPS | Primary data store |
| **Web Server** | Nginx | Same VPS | Reverse proxy + static files |
| **Frontend** | Next.js Build | Same VPS | Web interface |
| **File Storage** | Local + DO Spaces | VPS + Cloud backup | Documents/images |
| **Monitoring** | PM2 + DO Monitoring | VPS + Dashboard | System health |
| **Security** | UFW + SSL + Fail2Ban | VPS | Protection layer |

### 🚀 Day 1: DigitalOcean VPS Initial Setup

**Step 1: Create Droplet**
```bash
# Via DigitalOcean Dashboard:
# 1. Choose Ubuntu 22.04 LTS x64
# 2. Select Regular Intel - 4GB RAM, 2 vCPUs, 80GB SSD
# 3. Choose region: Singapore (closest to Indonesia)
# 4. Add SSH key for secure access
# 5. Enable monitoring and backups
# 6. Create droplet
```

**Step 2: Initial Server Configuration**
```bash
# Connect to VPS
ssh root@YOUR_DROPLET_IP

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

**Step 3: Install Required Software**
```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install Git and other tools
sudo apt install -y git htop curl wget unzip

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

**Step 4: Configure Firewall (UFW)**
```bash
# Enable UFW
sudo ufw enable

# Allow SSH (port 22)
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow PostgreSQL (only local)
sudo ufw allow from 127.0.0.1 to any port 5432

# Check status
sudo ufw status verbose
```

**Step 5: Secure PostgreSQL**
```bash
# Run security script
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_strong_postgres_password';"

# Create application database and user
sudo -u postgres createuser --interactive labora_user
sudo -u postgres createdb labora_db -O labora_user
sudo -u postgres psql -c "ALTER USER labora_user PASSWORD 'your_strong_db_password';"

# Configure PostgreSQL for local connections
sudo nano /etc/postgresql/15/main/postgresql.conf
# Uncomment and set: listen_addresses = 'localhost'

sudo nano /etc/postgresql/15/main/pg_hba.conf
# Add: local   labora_db   labora_user   md5

# Restart PostgreSQL
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

### 🧱 Backend Setup (Days 1–3)

```bash
# 1. Navigate to project directory
cd c:\webapps\labora_v1

# 2. Initialize NestJS backend
nest new backend --package-manager npm
cd backend

# 3. Install dependencies
npm install @prisma/client prisma
npm install @nestjs/config @nestjs/jwt @nestjs/passport
npm install passport passport-jwt passport-local
npm install argon2 class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express
npm install multer @types/multer

# 4. Dev dependencies
npm install -D @types/passport-jwt @types/passport-local
npm install -D @types/node prisma-dbml-generator ts-node

# 5. Setup Prisma with existing schema
npx prisma init
# Copy existing schema from sql/lab_schema_modular_idempotent_v1.sql
npx prisma db pull --force
npx prisma generate
```

### 🔧 Environment Configuration

**Local Development (.env.development)**
```bash
# --- General ---
NODE_ENV=development
PORT=3000

# --- Database (Local PostgreSQL) ---
DATABASE_URL="postgresql://labuser:lab_secure_pass_2024@localhost:5432/labdb?schema=lab"

# --- JWT Auth ---
JWT_SECRET="labora_jwt_secret_key_2024_secure_dev"
JWT_EXPIRES_IN="7d"

# --- File Upload ---
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES="pdf,jpg,jpeg,png,doc,docx"
```

**VPS Production (.env.production)**
```bash
# --- General ---
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# --- Database (VPS PostgreSQL) ---
DATABASE_URL="postgresql://labora_user:your_strong_db_password@localhost:5432/labora_db?schema=lab&sslmode=disable&connection_limit=10&pool_timeout=60"

# --- JWT Auth (Use strong secret in production) ---
JWT_SECRET="your_super_secure_256_bit_jwt_secret_key_for_production_2024"
JWT_EXPIRES_IN="8h"

# --- Security ---
CORS_ORIGIN="https://yourdomain.com"
HELMET_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# --- File Upload ---
UPLOAD_DIR="/var/www/labora/uploads"
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES="pdf,jpg,jpeg,png,doc,docx,xlsx"

# --- Logging ---
LOG_LEVEL="error,warn,log"
LOG_FILE_PATH="/var/www/labora/logs"

# --- Cache (Redis - optional for future) ---
# REDIS_HOST=localhost
# REDIS_PORT=6379

# --- DigitalOcean Spaces (for backup) ---
# DO_SPACES_ENDPOINT=sgp1.digitaloceanspaces.com
# DO_SPACES_BUCKET=labora-backup
# DO_SPACES_ACCESS_KEY=your_access_key
# DO_SPACES_SECRET_KEY=your_secret_key
```

**Step 4: Create Production Environment File**
```bash
# On VPS
cd /var/www/labora/backend
nano .env.production
# Copy the production config above and customize values

# Set file permissions
chmod 600 .env.production

# Create uploads directory
mkdir -p /var/www/labora/uploads/{results,attachments,temp}
sudo chown -R labora:www-data /var/www/labora/uploads
chmod -R 755 /var/www/labora/uploads

# Create logs directory
mkdir -p /var/www/labora/logs
chmod 755 /var/www/labora/logs
```

---

## 💻 Phase 1: Frontend Setup & VPS Deployment (Week 2)

### 📺 Day 4-5: Next.js Frontend Setup

**Local Development Setup**
```bash
# Navigate to main project directory
cd c:\webapps\labora_v1

# Create frontend directory
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir
cd frontend

# Install dependencies
npm install @tanstack/react-query axios react-hook-form zod
npm install @hookform/resolvers lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-toast
npm install date-fns clsx tailwind-merge

# Install shadcn/ui
npx shadcn-ui@latest init
```

**VPS Frontend Deployment**
```bash
# On VPS
cd /var/www/labora
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir
cd frontend

# Install dependencies
npm install @tanstack/react-query axios react-hook-form zod
npm install @hookform/resolvers lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-toast
npm install date-fns clsx tailwind-merge

# Install shadcn/ui
npx shadcn-ui@latest init
```

### 🌍 Environment Configuration

**Local Development (.env.local)**
```bash
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="LABORA Clinical Lab System"
NEXT_PUBLIC_VERSION="1.0.0"
NEXT_PUBLIC_ENV="development"
```

**VPS Production (.env.production)**
```bash
NEXT_PUBLIC_API_URL="https://yourdomain.com/api"
NEXT_PUBLIC_APP_NAME="LABORA Clinical Lab System"
NEXT_PUBLIC_VERSION="1.0.0"
NEXT_PUBLIC_ENV="production"
NEXT_TELEMETRY_DISABLED=1
```

### 🌐 Day 6-7: Nginx Configuration & SSL Setup

**Step 1: Configure Nginx as Reverse Proxy**
```bash
# Create Nginx site configuration
sudo nano /etc/nginx/sites-available/labora
```

**Nginx Configuration (/etc/nginx/sites-available/labora)**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (will be managed by certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # API Backend (NestJS)
    location /api/ {
        proxy_pass http://localhost:3000/;
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
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # File uploads and static files
    location /uploads/ {
        alias /var/www/labora/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # Security for uploaded files
        location ~* \.(php|html|htm|js)$ {
            deny all;
        }
    }
    
    # API Documentation (Swagger)
    location /api-docs/ {
        proxy_pass http://localhost:3000/api-docs/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend (Next.js static build)
    location / {
        root /var/www/labora/frontend/out;
        try_files $uri $uri.html $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Security headers for HTML files
        location ~* \.html?$ {
            expires 1h;
            add_header Cache-Control "public";
        }
    }
    
    # Security settings
    client_max_body_size 20M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

**Step 2: Enable Site and Setup SSL**
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/labora /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test SSL renewal
sudo certbot renew --dry-run

# Setup auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 🚀 Day 8: PM2 Process Management Setup

**Step 1: Build Applications**
```bash
# Build backend
cd /var/www/labora/backend
npm run build

# Build frontend for static deployment
cd /var/www/labora/frontend
npm run build

# For static export (recommended for better performance)
npm run export
# This creates 'out' directory with static files
```

**Step 2: PM2 Configuration**
```bash
# Create PM2 ecosystem file
cd /var/www/labora
nano ecosystem.config.js
```

**PM2 Ecosystem Configuration (ecosystem.config.js)**
```javascript
module.exports = {
  apps: [
    {
      name: 'labora-backend',
      script: 'dist/main.js',
      cwd: '/var/www/labora/backend',
      instances: 2, // Use 2 instances for 4GB RAM
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_file: '/var/www/labora/backend/.env.production',
      error_file: '/var/www/labora/logs/backend-error.log',
      out_file: '/var/www/labora/logs/backend-out.log',
      log_file: '/var/www/labora/logs/backend-combined.log',
      time: true,
      
      // Restart configuration
      max_restarts: 10,
      min_uptime: '10s',
      
      // Memory management
      max_memory_restart: '512M',
      
      // Health monitoring
      health_check_grace_period: 3000,
      
      // Auto restart on file changes (disable in production)
      watch: false,
      
      // Environment-specific settings
      node_args: '--max-old-space-size=512'
    }
  ],
  
  deploy: {
    production: {
      user: 'labora',
      host: 'yourdomain.com',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/labora_v1.git',
      path: '/var/www/labora',
      'post-deploy': 'cd backend && npm install && npm run build && pm2 reload ecosystem.config.js'
    }
  }
};
```

**Step 3: Start Applications with PM2**
```bash
# Start backend with PM2
cd /var/www/labora
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup ubuntu -u labora --hp /home/labora
# Follow the instructions PM2 gives you

# Check status
pm2 status
pm2 logs
pm2 monit
```

**Step 4: Setup Log Rotation**
```bash
# Install PM2 log rotate
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

# Create system log rotation for other logs
sudo nano /etc/logrotate.d/labora
```

**Log Rotation Configuration (/etc/logrotate.d/labora)**
```bash
/var/www/labora/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 644 labora labora
    postrotate
        systemctl reload nginx
    endscript
}
```

---

## 📊 Phase 2: Monitoring & Backup Strategy (Week 2-3)

### 💶 Day 9: System Monitoring Setup

**Step 1: DigitalOcean Monitoring Integration**
```bash
# Enable DigitalOcean monitoring agent (if not enabled during droplet creation)
curl -sSL https://repos.insights.digitalocean.com/install.sh | sudo bash
sudo systemctl enable do-agent
sudo systemctl start do-agent
```

**Step 2: Application Health Checks**
```bash
# Create health check script
sudo nano /usr/local/bin/labora-health-check.sh
```

**Health Check Script (/usr/local/bin/labora-health-check.sh)**
```bash
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3000/api/health"
LOG_FILE="/var/www/labora/logs/health-check.log"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Check API health
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

# Check PM2 processes
PM2_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="labora-backend") | .pm2_env.status')

# Check PostgreSQL
PG_STATUS=$(sudo -u postgres pg_isready -q && echo "ready" || echo "not ready")

# Check Nginx
NGINX_STATUS=$(systemctl is-active nginx)

# Check disk space (warn if > 80%)
DISK_USAGE=$(df /var/www | awk 'NR==2 {print $5}' | sed 's/%//')

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')

# Log results
echo "[$TIMESTAMP] API: $API_STATUS | PM2: $PM2_STATUS | PG: $PG_STATUS | Nginx: $NGINX_STATUS | Disk: ${DISK_USAGE}% | Memory: ${MEMORY_USAGE}%" >> $LOG_FILE

# Alert conditions
if [ "$API_STATUS" != "200" ] || [ "$PM2_STATUS" != "online" ] || [ "$PG_STATUS" != "ready" ] || [ "$NGINX_STATUS" != "active" ]; then
    echo -e "${RED}[ALERT] System health check failed!${NC}"
    echo "API Status: $API_STATUS"
    echo "PM2 Status: $PM2_STATUS"
    echo "PostgreSQL: $PG_STATUS"
    echo "Nginx: $NGINX_STATUS"
else
    echo -e "${GREEN}[OK] All systems operational${NC}"
fi

# Disk space warning
if [ "$DISK_USAGE" -gt 80 ]; then
    echo -e "${YELLOW}[WARNING] Disk usage is ${DISK_USAGE}%${NC}"
fi

# Memory warning
if (( $(echo "$MEMORY_USAGE > 85" | bc -l) )); then
    echo -e "${YELLOW}[WARNING] Memory usage is ${MEMORY_USAGE}%${NC}"
fi
```

**Step 3: Setup Monitoring Cron Jobs**
```bash
# Make script executable
sudo chmod +x /usr/local/bin/labora-health-check.sh

# Add to crontab
crontab -e
# Add these lines:

# Health check every 5 minutes
*/5 * * * * /usr/local/bin/labora-health-check.sh

# Daily disk cleanup
0 2 * * * find /var/www/labora/uploads/temp -type f -mtime +7 -delete

# Weekly restart (for memory cleanup)
0 3 * * 0 pm2 reload ecosystem.config.js
```

### 📁 VPS Production Project Structure

```
/var/www/labora/                 # Main application directory
├── backend/                    # NestJS API
│   ├── src/                     # Source code
│   │   ├── modules/             # Feature modules
│   │   │   ├── auth/
│   │   │   ├── patients/
│   │   │   ├── orders/
│   │   │   ├── results/
│   │   │   └── billing/
│   │   ├── common/              # Shared utilities
│   │   ├── config/              # Configuration
│   │   └── main.ts              # Application entry
│   ├── prisma/                  # Database schema
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── dist/                    # Built application
│   ├── .env.production          # Production environment
│   ├── package.json
│   └── node_modules/
│
├── frontend/                   # Next.js Web App
│   ├── src/
│   │   ├── app/                 # App Router (Next.js 13+)
│   │   │   ├── (dashboard)/      # Route groups
│   │   │   │   ├── patients/
│   │   │   │   ├── orders/
│   │   │   │   └── results/
│   │   │   ├── api/              # API routes (if needed)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/          # React components
│   │   │   ├── ui/               # Base UI components
│   │   │   ├── forms/            # Form components
│   │   │   └── layout/           # Layout components
│   │   ├── lib/                 # Utilities
│   │   │   ├── api.ts            # API client
│   │   │   ├── auth.ts           # Auth utilities
│   │   │   └── utils.ts          # General utilities
│   │   └── types/               # TypeScript types
│   ├── .next/                   # Next.js build cache
│   ├── out/                     # Static export (for Nginx)
│   ├── .env.production          # Production environment
│   ├── package.json
│   └── node_modules/
│
├── uploads/                    # File storage
│   ├── results/                 # Lab result attachments
│   ├── attachments/             # Order attachments
│   └── temp/                    # Temporary files
│
├── logs/                       # Application logs
│   ├── backend-error.log
│   ├── backend-out.log
│   ├── backend-combined.log
│   └── health-check.log
│
├── sql/                        # Database scripts
│   └── lab_schema_modular_idempotent_v1.sql
│
├── scripts/                    # Deployment scripts
│   ├── deploy.sh               # Deployment automation
│   └── update.sh               # Update application
│
├── docs/                       # Documentation
│   └── readme_plan_lab_project.md
│
├── ecosystem.config.js         # PM2 configuration
├── docker-compose.yml          # Local development
├── package.json                # Root package.json (workspace)
└── README.md

/etc/nginx/sites-available/labora  # Nginx configuration
/var/backups/labora/               # Backup storage
/usr/local/bin/                    # Custom scripts
  ├── labora-health-check.sh
  └── labora-backup.sh
```

### 📋 Day 10-11: Backup & Disaster Recovery

**Step 1: Database Backup Script**
```bash
# Create backup script
sudo nano /usr/local/bin/labora-backup.sh
```

**Backup Script (/usr/local/bin/labora-backup.sh)**
```bash
#!/bin/bash

# Configuration
DB_NAME="labora_db"
DB_USER="labora_user"
BACKUP_DIR="/var/backups/labora"
TIMESTAMP=$(date "+%Y%m%d_%H%M%S")
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting backup at $(date)"

# Database backup
echo "Creating database backup..."
DBDUMP_FILE="$BACKUP_DIR/labora_db_$TIMESTAMP.sql"
export PGPASSWORD="your_strong_db_password"
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $DBDUMP_FILE

# Compress database backup
gzip $DBDUMP_FILE
DBDUMP_FILE="$DBDUMP_FILE.gz"

# Files backup (uploads only)
echo "Creating files backup..."
FILES_BACKUP="$BACKUP_DIR/labora_files_$TIMESTAMP.tar.gz"
tar -czf $FILES_BACKUP -C /var/www/labora uploads/

# Configuration backup
echo "Creating configuration backup..."
CONFIG_BACKUP="$BACKUP_DIR/labora_config_$TIMESTAMP.tar.gz"
tar -czf $CONFIG_BACKUP \
    /var/www/labora/backend/.env.production \
    /var/www/labora/frontend/.env.production \
    /var/www/labora/ecosystem.config.js \
    /etc/nginx/sites-available/labora \
    /usr/local/bin/labora-*.sh

# Upload to DigitalOcean Spaces (if configured)
if command -v s3cmd &> /dev/null && [ -f ~/.s3cfg ]; then
    echo "Uploading to DigitalOcean Spaces..."
    s3cmd put $DBDUMP_FILE s3://labora-backup/db/
    s3cmd put $FILES_BACKUP s3://labora-backup/files/
    s3cmd put $CONFIG_BACKUP s3://labora-backup/config/
fi

# Cleanup old local backups
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed at $(date)"
echo "Database: $DBDUMP_FILE"
echo "Files: $FILES_BACKUP"
echo "Config: $CONFIG_BACKUP"
```

**Step 2: Restore Script**
```bash
# Create restore script
sudo nano /usr/local/bin/labora-restore.sh
```

**Restore Script (/usr/local/bin/labora-restore.sh)**
```bash
#!/bin/bash

# Usage: ./labora-restore.sh [backup_date] [type]
# Example: ./labora-restore.sh 20241007_020000 database
# Types: database, files, config, all

BACKUP_DATE=${1:-"latest"}
RESTORE_TYPE=${2:-"all"}
BACKUP_DIR="/var/backups/labora"
DB_NAME="labora_db"
DB_USER="labora_user"

if [ "$BACKUP_DATE" = "latest" ]; then
    BACKUP_DATE=$(ls $BACKUP_DIR/labora_db_*.sql.gz | sort -r | head -1 | grep -o '[0-9]\{8\}_[0-9]\{6\}')
fi

echo "Restoring from backup: $BACKUP_DATE"
echo "Restore type: $RESTORE_TYPE"

# Stop application
echo "Stopping application..."
pm2 stop labora-backend

if [ "$RESTORE_TYPE" = "database" ] || [ "$RESTORE_TYPE" = "all" ]; then
    echo "Restoring database..."
    DBDUMP_FILE="$BACKUP_DIR/labora_db_$BACKUP_DATE.sql.gz"
    
    if [ -f "$DBDUMP_FILE" ]; then
        # Drop and recreate database
        sudo -u postgres dropdb $DB_NAME
        sudo -u postgres createdb $DB_NAME -O $DB_USER
        
        # Restore database
        export PGPASSWORD="your_strong_db_password"
        gunzip -c $DBDUMP_FILE | psql -h localhost -U $DB_USER -d $DB_NAME
        
        echo "Database restored successfully"
    else
        echo "Database backup file not found: $DBDUMP_FILE"
    fi
fi

if [ "$RESTORE_TYPE" = "files" ] || [ "$RESTORE_TYPE" = "all" ]; then
    echo "Restoring files..."
    FILES_BACKUP="$BACKUP_DIR/labora_files_$BACKUP_DATE.tar.gz"
    
    if [ -f "$FILES_BACKUP" ]; then
        # Backup current files
        mv /var/www/labora/uploads /var/www/labora/uploads.bak.$(date +%s)
        
        # Restore files
        tar -xzf $FILES_BACKUP -C /var/www/labora/
        
        # Fix permissions
        sudo chown -R labora:www-data /var/www/labora/uploads
        chmod -R 755 /var/www/labora/uploads
        
        echo "Files restored successfully"
    else
        echo "Files backup not found: $FILES_BACKUP"
    fi
fi

if [ "$RESTORE_TYPE" = "config" ] || [ "$RESTORE_TYPE" = "all" ]; then
    echo "Restoring configuration..."
    CONFIG_BACKUP="$BACKUP_DIR/labora_config_$BACKUP_DATE.tar.gz"
    
    if [ -f "$CONFIG_BACKUP" ]; then
        # Extract to temporary directory
        TEMP_DIR="/tmp/labora_restore_$BACKUP_DATE"
        mkdir -p $TEMP_DIR
        tar -xzf $CONFIG_BACKUP -C $TEMP_DIR
        
        echo "Configuration files extracted to $TEMP_DIR"
        echo "Please review and manually restore configuration files as needed"
    else
        echo "Configuration backup not found: $CONFIG_BACKUP"
    fi
fi

# Start application
echo "Starting application..."
pm2 start labora-backend

echo "Restore completed at $(date)"
```

**Step 3: Setup Automated Backups**
```bash
# Make scripts executable
sudo chmod +x /usr/local/bin/labora-backup.sh
sudo chmod +x /usr/local/bin/labora-restore.sh

# Create backup directory
sudo mkdir -p /var/backups/labora
sudo chown labora:labora /var/backups/labora

# Add to crontab
crontab -e
# Add backup schedules:

# Daily database backup at 2 AM
0 2 * * * /usr/local/bin/labora-backup.sh >> /var/www/labora/logs/backup.log 2>&1

# Weekly full backup (Sundays at 1 AM)
0 1 * * 0 /usr/local/bin/labora-backup.sh >> /var/www/labora/logs/backup.log 2>&1
```

### 🚀 Day 12-14: Deployment Automation & Security

**Step 1: Deployment Script**
```bash
# Create deployment script
mkdir -p /var/www/labora/scripts
nano /var/www/labora/scripts/deploy.sh
```

**Deployment Script (/var/www/labora/scripts/deploy.sh)**
```bash
#!/bin/bash

# Labora VPS Deployment Script
# Usage: ./deploy.sh [branch]

BRANCH=${1:-main}
APP_DIR="/var/www/labora"
TIMESTAMP=$(date "+%Y%m%d_%H%M%S")

echo "Starting deployment of branch: $BRANCH at $(date)"

# Create pre-deployment backup
echo "Creating pre-deployment backup..."
/usr/local/bin/labora-backup.sh

# Stop application
echo "Stopping application..."
pm2 stop labora-backend

# Navigate to app directory
cd $APP_DIR

# Pull latest code
echo "Pulling latest code..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# Install/update backend dependencies
echo "Updating backend dependencies..."
cd backend
npm ci --production

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy
npx prisma generate

# Build backend
echo "Building backend..."
npm run build

# Install/update frontend dependencies
echo "Updating frontend dependencies..."
cd ../frontend
npm ci --production

# Build frontend
echo "Building frontend..."
npm run build
npm run export

# Set proper permissions
echo "Setting permissions..."
cd ..
sudo chown -R labora:www-data uploads/
chmod -R 755 uploads/

# Start application
echo "Starting application..."
pm2 start labora-backend
sleep 10

# Health check
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)

if [ "$HEALTH_CHECK" = "200" ]; then
    echo "\033[0;32m[SUCCESS] Deployment completed successfully!\033[0m"
    sudo systemctl reload nginx
    echo "Deployment finished at $(date)"
else
    echo "\033[0;31m[ERROR] Health check failed!\033[0m"
    exit 1
fi
```

**Step 2: Security Hardening**
```bash
# Install and configure Fail2Ban
sudo apt install fail2ban -y

# Configure Fail2Ban
sudo nano /etc/fail2ban/jail.local
```

**Fail2Ban Configuration (/etc/fail2ban/jail.local)**
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600
```

**Step 3: Make Scripts Executable & Start Services**
```bash
# Make deployment scripts executable
chmod +x /var/www/labora/scripts/deploy.sh

# Start and enable Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check services status
sudo systemctl status nginx postgresql fail2ban
pm2 status
```

---

## 📈 VPS Performance & Cost Summary

### 💰 Monthly Cost Breakdown (DigitalOcean)

| Component | Specification | Cost/Month |
|-----------|---------------|------------|
| **Droplet 4GB** | 2 vCPU, 4GB RAM, 80GB SSD | $24 |
| **Domain** | .com domain (yearly) | $1.25 |
| **SSL Certificate** | Let's Encrypt | Free |
| **Backup Storage** | DigitalOcean Spaces 10GB | $5 |
| **Monitoring** | DigitalOcean Monitoring | Free |
| **Total** | | **~$30/month** |

**Annual Cost: ~$360**

### 🚀 Performance Specifications

| Metric | Capacity | Notes |
|--------|----------|-------|
| **Orders/Day** | 1,000-2,000+ | With optimized queries |
| **Concurrent Users** | 50-100 | Real-time active users |
| **Database Size** | 500GB+ | PostgreSQL on SSD |
| **File Storage** | 100GB+ | Expandable with Spaces |
| **Response Time** | <100ms | 95th percentile |
| **Uptime** | 99.9%+ | With proper monitoring |
| **Backup Retention** | 30 days local | + unlimited cloud |

### 🔄 Scaling Options

**When to Scale Up:**
- Orders > 2,000/day: Upgrade to 8GB RAM ($48/month)
- Users > 100 concurrent: Add Redis caching + load balancer
- Storage > 500GB: Migrate to DigitalOcean Managed PostgreSQL
- Traffic spikes: Enable DigitalOcean Load Balancer ($10/month)

**Horizontal Scaling Path:**
1. **Current**: Single VPS (4GB) - $30/month
2. **Medium**: VPS (8GB) + Redis + Spaces - $60/month
3. **Large**: Multiple VPS + Managed DB + Load Balancer - $150/month
4. **Enterprise**: Kubernetes cluster + CDN + Multi-region - $300+/month

---

## ✅ VPS Deployment Checklist

### Phase 0: VPS Initial Setup
- [ ] Create DigitalOcean Droplet (4GB RAM, Ubuntu 22.04)
- [ ] Configure SSH key access
- [ ] Create non-root user (labora)
- [ ] Install Node.js 20, PostgreSQL 15, Nginx, PM2
- [ ] Configure UFW firewall (ports 22, 80, 443)
- [ ] Secure PostgreSQL installation
- [ ] Install monitoring agent

### Phase 1: Application Deployment
- [ ] Clone project to `/var/www/labora`
- [ ] Setup backend NestJS application
- [ ] Configure production environment variables
- [ ] Import database schema
- [ ] Setup frontend Next.js application
- [ ] Configure Nginx reverse proxy
- [ ] Setup SSL with Let's Encrypt
- [ ] Configure PM2 process management

### Phase 2: Monitoring & Security
- [ ] Setup health check scripts
- [ ] Configure automated backups
- [ ] Setup log rotation
- [ ] Install and configure Fail2Ban
- [ ] Enable automatic security updates
- [ ] Configure DigitalOcean Spaces for backup
- [ ] Test disaster recovery procedures

### Phase 3: Optimization & Maintenance
- [ ] Setup deployment automation scripts
- [ ] Configure monitoring dashboards
- [ ] Optimize database queries and indexing
- [ ] Setup alerting for critical events
- [ ] Document maintenance procedures
- [ ] Train team on deployment process

---

## 🔧 Maintenance Schedule

### Daily (Automated)
- Health checks every 5 minutes
- Log monitoring and cleanup
- Automatic security updates
- Database and file backups

### Weekly (Manual - 30 minutes)
- Review system performance metrics
- Check backup integrity
- Review error logs and alerts
- Update application dependencies

### Monthly (Manual - 2 hours)
- Review and optimize database performance
- Update system packages
- Review security audit logs
- Test disaster recovery procedures
- Capacity planning review

### Quarterly (Manual - 4 hours)
- Major application updates
- Security penetration testing
- Backup strategy review
- Performance benchmarking
- Infrastructure cost optimization

---

## 🎆 Go-Live Strategy

### Week 1-2: Infrastructure & Core Setup
1. Setup DigitalOcean VPS with all required software
2. Deploy basic application structure
3. Configure security and monitoring
4. Setup automated backups

### Week 3-4: Application Development
1. Develop core lab management features
2. Setup authentication and user management
3. Implement patient and order management
4. Basic reporting functionality

### Week 5-6: Testing & Optimization
1. Load testing with simulated traffic
2. Security testing and hardening
3. Performance optimization
4. User acceptance testing

### Week 7: Production Launch
1. Final deployment to production
2. DNS cutover to new system
3. User training and onboarding
4. 24/7 monitoring for first week

**Success Criteria:**
- ✅ System handles 500+ orders/day without issues
- ✅ Response time <200ms for 95% of requests
- ✅ 99.9% uptime in first month
- ✅ All backups automated and tested
- ✅ Zero security incidents
- ✅ User satisfaction >90%

---

## 📞 Support & Emergency Contacts

### System Administration
- **Primary**: DevOps Team
- **Backup**: Senior Developer
- **Emergency Escalation**: Technical Director

### DigitalOcean Support
- **Support Portal**: cloud.digitalocean.com/support
- **Emergency**: Available 24/7 for infrastructure issues
- **SLA**: 99.99% uptime guarantee

### Monitoring & Alerts
- **Health Checks**: Every 5 minutes
- **Alert Channels**: Email + Slack/Teams
- **Response Time**: <15 minutes for critical alerts
- **Escalation**: Auto-escalate after 30 minutes

---

## 🏆 Final Notes

**Estimated Setup Time:**
- VPS Infrastructure: 1-2 days
- Application Deployment: 2-3 days
- Security & Monitoring: 1-2 days
- Testing & Optimization: 2-3 days
- **Total: 1-2 weeks**

**Team Requirements:**
- 1 DevOps/System Administrator
- 1 Full-stack Developer (NestJS + Next.js)
- 1 QA Tester (part-time)
- 1 Lab Domain Expert (consultant)

**Risk Mitigation:**
- ✅ Automated daily backups with cloud storage
- ✅ Health monitoring with automatic alerts
- ✅ Fail2Ban protection against attacks
- ✅ Regular security updates
- ✅ Disaster recovery procedures documented
- ✅ Rollback capabilities for deployments

**Ready to deploy? Your DigitalOcean VPS is waiting! 🚀**
├── sql/                        # Database Schema
│   └── lab_schema_modular_idempotent_v1.sql
├── docs/                       # Documentation
├── assets/                     # Static Assets
├── scripts/                    # Deployment Scripts
├── docker-compose.yml         # Local Development
├── package.json               # Root Package (Workspace)
└── README.md
```

---

## ⚙️ Phase 2: Local Development Setup (Week 3)

**Project Structure:**
```
labora_v1/
├── backend/     # NestJS + Prisma API
├── frontend/    # Next.js Web Application  
├── sql/         # Database Schema & Scripts
├── docs/        # Documentation
├── docker-compose.yml
├── .env.example
├── package.json (workspace)
└── README.md
```

### Docker Compose (Local Development)
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    container_name: labora_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: labdb
      POSTGRES_USER: labuser
      POSTGRES_PASSWORD: lab_secure_pass_2024
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=C"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql/lab_schema_modular_idempotent_v1.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U labuser -d labdb"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: labora_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  pgadmin:
    image: dpage/pgadmin4
    container_name: labora_pgadmin
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@labora.local
      PGADMIN_DEFAULT_PASSWORD: admin123
    volumes:
      - pgadmin_data:/var/lib/pgadmin

volumes:
  postgres_data:
  redis_data:
  pgadmin_data:
```

### Root Package.json (Workspace)
```json
{
  "name": "labora-clinical-lab-system",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "backend",
    "frontend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run start:dev",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && npm run build",
    "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
    "start:backend": "cd backend && npm run start:prod",
    "start:frontend": "cd frontend && npm run start",
    "db:setup": "docker-compose up -d postgres",
    "db:migrate": "cd backend && npx prisma migrate dev",
    "db:seed": "cd backend && npx prisma db seed",
    "db:studio": "cd backend && npx prisma studio",
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "cd backend && npm run test",
    "test:frontend": "cd frontend && npm run test"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

---

## ☁️ File Storage & Upload Handling

### Local Development Setup
```bash
# Create upload directories
mkdir -p backend/uploads/results
mkdir -p backend/uploads/attachments
mkdir -p backend/uploads/temp

# Install file handling dependencies
cd backend
npm install multer @types/multer
npm install file-type mime-types @types/mime-types
```

### File Upload Service (NestJS)
```typescript
// src/modules/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';
import * as multer from 'multer';

@Injectable()
export class UploadService {
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';

  async uploadFile(file: Express.Multer.File, category: string): Promise<string> {
    const uploadPath = join(this.uploadDir, category);
    
    // Ensure directory exists
    await fs.mkdir(uploadPath, { recursive: true });
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    const filePath = join(uploadPath, filename);
    
    // Save file
    await fs.writeFile(filePath, file.buffer);
    
    // Return relative path for database storage
    return join(category, filename);
  }

  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = join(this.uploadDir, relativePath);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      console.warn(`Failed to delete file: ${fullPath}`, error);
    }
  }

  getFileUrl(relativePath: string): string {
    return `/uploads/${relativePath}`;
  }
}
```

### Production File Storage (VPS)
```typescript
// For VPS deployment, files stored in /var/www/labora/uploads/
// Served via Nginx static file serving

// nginx.conf snippet
location /uploads/ {
  alias /var/www/labora/uploads/;
  expires 30d;
  add_header Cache-Control "public, immutable";
}
```

---

## 📈 Local Development Optimization Summary

| Layer | Technology | Local Setup | Production Notes |
|-------|------------|-------------|------------------|
| Backend | NestJS | Local dev server | VPS deployment with PM2 |
| Database | PostgreSQL | Docker container | VPS PostgreSQL installation |
| Frontend | Next.js | Local dev server | VPS static build or SSR |
| Storage | File System | Local uploads folder | VPS file system + Nginx |
| Monitoring | Console logs | Basic logging | PM2 monitoring + log files |

### Development Workflow
1. **Start Services:** `docker-compose up -d` (PostgreSQL + Redis)
2. **Database Setup:** Import existing schema from SQL file
3. **Backend Dev:** `cd backend && npm run start:dev`
4. **Frontend Dev:** `cd frontend && npm run dev`
5. **Database Admin:** Access pgAdmin at http://localhost:8080

### Performance Considerations (Local)
- SQLite for testing (optional)
- File watching optimization
- Hot reload for both frontend and backend
- Database connection pooling for development

---

## 🚀 Development & Deployment Flow

### Local Development Flow
1. **Setup Environment**
   - Run `npm install` in root to setup workspace
   - Start PostgreSQL: `npm run db:setup`
   - Import schema: Use existing SQL file in sql/ directory
   - Start development: `npm run dev` (starts both backend and frontend)

### Production Deployment Flow
1. **VPS Preparation**
   - Setup Ubuntu/CentOS server
   - Install Node.js, PostgreSQL, Nginx
   - Configure firewall and SSL
2. **Application Deployment**
   - Clone repository to VPS
   - Build applications: `npm run build`
   - Setup PM2 for process management
   - Configure Nginx reverse proxy
3. **Database Setup**
   - Import production schema
   - Setup automated backups
   - Configure connection pooling
4. **File Storage**
   - Setup upload directories with proper permissions
   - Configure Nginx for static file serving
5. **Monitoring**
   - Setup PM2 monitoring
   - Configure log rotation
   - Setup basic health checks

---

## ✅ Summary

This configuration provides a **robust, scalable foundation** for the laboratory system:

- **PostgreSQL** (Local Docker + Production VPS) for reliable lab data storage
- **NestJS** for clean, modular backend REST API with TypeScript
- **Next.js** for modern, responsive frontend with TypeScript
- **Local File System** for efficient document and image storage
- **Docker Compose** for streamlined local development environment
- **Monorepo Structure** for organized codebase management

> ⚙️ "Optimized for rapid development with a clear path to production deployment."

### Key Advantages of This Setup:
- **No vendor lock-in** - Full control over infrastructure
- **Cost-effective** - Can start with minimal VPS hosting costs
- **Scalable** - Easy to scale horizontally as needed
- **Developer-friendly** - Modern toolstack with great DX
- **Production-ready** - Clean architecture suitable for enterprise use

## ✅ Summary

This configuration gives you a **cost-free, scalable foundation** for your lab system:

- PostgreSQL (Neon) for structured lab data  
- Render for backend REST API  
- Vercel for clean, responsive UI  
- Backblaze B2 for efficient file storage  
- Free-tier monitoring with UptimeRobot + Logtail  

> ⚙️ “Optimized for MVP, but scalable to production without vendor lock-in.”

### Day 3: Database Setup

**1. Use Existing SQL Schema:**
```bash
# Navigate to backend directory
cd backend

# Copy existing schema to Prisma folder
cp ../sql/lab_schema_modular_idempotent_v1.sql prisma/

# Generate Prisma schema from existing database
npx prisma db pull --force

# Generate Prisma client
npx prisma generate
```
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

**2. Local Development Environment:**
```yaml
# docker-compose.yml (already created above)
# Use the existing docker-compose.yml with PostgreSQL setup
```

**3. Environment Variables:**
```bash
# .env (backend)
NODE_ENV=development
PORT=3000

# Database (matches docker-compose setup)
DATABASE_URL="postgresql://labuser:lab_secure_pass_2024@localhost:5432/labdb?schema=lab"

# JWT
JWT_SECRET=labora_jwt_secret_key_2024_secure
JWT_EXPIRES_IN=7d

# Redis (for sessions/cache)
REDIS_HOST=localhost
REDIS_PORT=6379

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=./uploads

# Production Override (VPS)
# DATABASE_URL="postgresql://labuser:lab_secure_pass_2024@production-host:5432/labdb?schema=lab"
# UPLOAD_PATH=/var/www/labora/uploads
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
- ✅ NestJS project initialized in monorepo structure
- ✅ Prisma schema integrated from existing SQL
- ✅ Docker Compose for local PostgreSQL + Redis
- ✅ Core architecture (modules, services, repositories)
- ✅ Monorepo workspace configuration
- ✅ Development workflow scripts

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

## 🚀 Phase 6: Production Deployment & Optimization (Week 11-12)

### Week 11: VPS Production Setup

**Day 36-38: VPS Deployment**

**1. Server Setup (Ubuntu 22.04 LTS):**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx

# Install Git
sudo apt install -y git
```

**2. Database Setup:**
```bash
# Configure PostgreSQL
sudo -u postgres createuser --interactive labuser
sudo -u postgres createdb labdb -O labuser

# Set password for database user
sudo -u postgres psql
ALTER USER labuser PASSWORD 'lab_secure_pass_2024';
\q

# Import schema
cd /var/www/labora_v1
sudo -u postgres psql -d labdb -f sql/lab_schema_modular_idempotent_v1.sql
```

**3. Application Deployment:**
```bash
# Create application directory
sudo mkdir -p /var/www/labora_v1
sudo chown $USER:$USER /var/www/labora_v1

# Clone repository
cd /var/www
git clone https://github.com/your-org/labora_v1.git
cd labora_v1

# Install dependencies
npm install

# Build applications
npm run build

# Setup environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Create uploads directory
mkdir -p backend/uploads
sudo chown -R www-data:www-data backend/uploads

# Run database migrations
cd backend
npx prisma migrate deploy
npx prisma generate

# Start with PM2
pm2 start dist/main.js --name labora-backend
pm2 startup
pm2 save
```

**4. Nginx Configuration:**
```nginx
# /etc/nginx/sites-available/labora
server {
    listen 80;
    server_name your-domain.com;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/;
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

    # File uploads and downloads
    location /uploads/ {
        alias /var/www/labora_v1/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Frontend (if serving static build)
    location / {
        root /var/www/labora_v1/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    client_max_body_size 10M;
}

# Enable site
sudo ln -s /etc/nginx/sites-available/labora /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL
sudo certbot --nginx -d your-domain.com
```
### Alternative: Docker Deployment (Optional)

**Day 36-38: Containerized Deployment**

**1. Dockerfile for Backend:**
```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma/ ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "run", "start:prod"]
```

**2. Docker Compose for Production:**
```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: labdb
      POSTGRES_USER: labuser
      POSTGRES_PASSWORD: lab_secure_pass_2024
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql/lab_schema_modular_idempotent_v1.sql:/docker-entrypoint-initdb.d/init.sql
    
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://labuser:lab_secure_pass_2024@postgres:5432/labdb?schema=lab"
      NODE_ENV: production
    volumes:
      - ./backend/uploads:/app/uploads
    depends_on:
      - postgres

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./backend/uploads:/var/www/uploads
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Day 39-40: Performance Optimization

**1. Production Environment Variables:**
```bash
# backend/.env.production
NODE_ENV=production
PORT=3000

# Database with connection pooling
DATABASE_URL="postgresql://labuser:lab_secure_pass_2024@localhost:5432/labdb?schema=lab&connection_limit=10&pool_timeout=60"

# JWT with stronger security
JWT_SECRET="your-super-secure-production-jwt-key-256-bit"
JWT_EXPIRES_IN="8h"

# File upload optimizations
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/labora_v1/backend/uploads

# Redis for caching
REDIS_HOST=localhost
REDIS_PORT=6379

# Security headers
CORS_ORIGIN="https://your-domain.com"
HELMET_ENABLED=true
```

**2. Database Optimization (PostgreSQL):**
```sql
-- /etc/postgresql/15/main/postgresql.conf adjustments for 4GB RAM
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
work_mem = 4MB
max_connections = 100

-- Enable query performance insights
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.max = 10000
pg_stat_statements.track = all

-- Restart PostgreSQL
sudo systemctl restart postgresql
```

**3. Application Performance:**
```typescript
// src/main.ts - Production optimizations
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Security middleware
  app.use(helmet());
  
  // Compression middleware
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  // Request rate limiting
  const rateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  });
  app.use(rateLimit);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

**4. Caching Strategy:**
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

// Cache patient demographics (frequently accessed)
@Get(':id')
@CacheKey('patient')
@CacheTTL(300) // 5 minutes
async getPatient(@Param('id') id: string) {
  return this.patientsService.findById(id);
}
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
- ✅ Production VPS deployment with Nginx + SSL
- ✅ Database optimized for production workload
- ✅ PM2 process management setup
- ✅ File upload handling with proper permissions
- ✅ Performance monitoring and logging
- ✅ Automated backup procedures
- ✅ Security hardening implemented

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

### VPS Deployment (Recommended for Production)

**Monthly Costs:**
```
VPS Server (4GB RAM, 2 CPU, 50GB SSD)     $20-40/mo
  - Suitable for 500-1000 orders/day
  - Includes PostgreSQL, Redis, application
  - Full control over resources

Domain + SSL Certificate                   $15/year
Database Backup Storage                    $5/mo

Total Monthly:                            ~$25-45/mo
Total Annual:                             ~$300-540/year
```

**Scaling Options:**
- Upgrade to 8GB RAM: $50-80/mo
- Add dedicated database server: +$20-30/mo
- Load balancer + multiple instances: +$40-60/mo
- CDN for static files: +$10-20/mo

### Local Development (Free)

**Setup Costs:**
```
Development Tools                         Free
  - Node.js, PostgreSQL, VS Code
  - Docker Desktop
  - Git

Local Testing Environment                 Free
  - Docker containers
  - Local file system storage
  - No bandwidth costs

Total Development Cost:                   $0
```

**Performance Capacity (4GB VPS):**
- Concurrent users: 50-100
- Orders per day: 500-1,000
- Database size: Up to 500GB
- Response time: <100ms (95th percentile)
- File storage: Limited by disk space

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
- Hosting (VPS 4GB): $25-40/mo
- Domain + SSL: $15/year  
- Development Tools: Free (Open Source)
- Total first year: ~$300-500

**Development Cost:**
- Solo Developer: 3-4 months full-time
- Small Team (2 devs): 2-3 months
- Contractor Estimate: $15,000-30,000

**Risk Mitigation:**
- Start with local development first
- Use proven technology stack (NestJS + PostgreSQL)
- Implement comprehensive error handling and logging
- Regular database backups (automated daily)
- Staged deployment process (dev → staging → production)
- Performance monitoring from day one

---

**Ready to start? Begin with Phase 0! 🚀**