#!/bin/bash
# VPS Setup Script for DigitalOcean
# Run this script on a fresh Ubuntu 22.04 LTS droplet

set -e

echo "🚀 Starting DigitalOcean VPS setup for Labora Clinical Lab System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Variables (will be prompted or set via environment)
DOMAIN_NAME=${DOMAIN_NAME:-""}
DB_PASSWORD=${DB_PASSWORD:-"$(openssl rand -base64 32)"}
JWT_SECRET=${JWT_SECRET:-"$(openssl rand -base64 64)"}
APP_USER="labora"

# Step 1: System Update
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Step 2: Install required packages
print_status "Installing required packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    nginx \
    postgresql \
    postgresql-contrib \
    ufw \
    fail2ban \
    certbot \
    python3-certbot-nginx \
    htop \
    tree \
    vim

# Step 3: Install Node.js 20 LTS
print_status "Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node_version=$(node --version)
npm_version=$(npm --version)
print_success "Node.js installed: $node_version"
print_success "npm installed: $npm_version"

# Step 4: Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Step 5: Setup PostgreSQL
print_status "Setting up PostgreSQL database..."

# Create database user and database
sudo -u postgres psql <<EOF
CREATE USER labora_user WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE labora_db OWNER labora_user;
GRANT ALL PRIVILEGES ON DATABASE labora_db TO labora_user;
ALTER USER labora_user CREATEDB;
\q
EOF

print_success "PostgreSQL database setup completed"

# Step 6: Configure PostgreSQL for remote connections (if needed)
print_status "Configuring PostgreSQL..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf

# Step 7: Setup firewall
print_status "Configuring UFW firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 5432 # PostgreSQL (only if needed for external access)
sudo ufw --force enable

print_success "Firewall configured"

# Step 8: Configure Fail2Ban
print_status "Setting up Fail2Ban..."
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Create custom Nginx jail for API protection
sudo tee /etc/fail2ban/jail.d/nginx.conf > /dev/null <<EOF
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
port = http,https
filter = nginx-noproxy
logpath = /var/log/nginx/access.log
maxretry = 2
EOF

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

print_success "Fail2Ban configured"

# Step 9: Create application directories
print_status "Creating application directories..."
sudo mkdir -p /var/www/labora
sudo mkdir -p /var/log/pm2
sudo mkdir -p /var/www/labora/uploads
sudo mkdir -p /var/www/labora/logs

# Set proper ownership
sudo chown -R $USER:$USER /var/www/labora
sudo chown -R $USER:$USER /var/log/pm2

print_success "Application directories created"

# Step 10: Configure Nginx
print_status "Configuring Nginx..."

# Backup default configuration
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Create labora site configuration (will be replaced by proper config later)
sudo tee /etc/nginx/sites-available/labora > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME localhost;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /uploads/ {
        alias /var/www/labora/uploads/;
        expires 1M;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/labora /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Start and enable services
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl start postgresql
sudo systemctl enable postgresql

print_success "Nginx configured and started"

# Step 11: SSL Certificate (if domain provided)
if [[ -n "$DOMAIN_NAME" ]]; then
    print_status "Setting up SSL certificate for $DOMAIN_NAME..."
    
    # Get SSL certificate
    sudo certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME
    
    # Setup auto-renewal
    sudo systemctl enable certbot.timer
    
    print_success "SSL certificate installed for $DOMAIN_NAME"
else
    print_warning "No domain name provided. SSL setup skipped."
    print_warning "To setup SSL later, run: sudo certbot --nginx -d yourdomain.com"
fi

# Step 12: Setup PM2 startup
print_status "Configuring PM2 startup..."
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

print_success "PM2 startup configured"

# Step 13: Create environment file template
print_status "Creating environment file template..."
cat > /var/www/labora/.env.example <<EOF
# Labora Clinical Lab System - Production Environment
NODE_ENV=production
PORT=3000
APP_NAME=labora-clinical-lab
APP_VERSION=1.0.0

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=labora_db
DATABASE_USER=labora_user
DATABASE_PASSWORD=$DB_PASSWORD
DATABASE_SSL=false

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRATION=24h

# File Upload Configuration
UPLOAD_PATH=/var/www/labora/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,doc,docx

# Email Configuration (Update with your SMTP settings)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Security
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Monitoring
LOG_LEVEL=info
LOG_FILE_PATH=/var/www/labora/logs/app.log
EOF

print_success "Environment template created"

# Step 14: Create deployment script
print_status "Creating deployment script..."
cat > /var/www/labora/deploy.sh <<'EOF'
#!/bin/bash
# Deployment script for Labora Clinical Lab System

set -e

APP_DIR="/var/www/labora"
REPO_URL="https://github.com/yourusername/labora.git"
BRANCH="main"

cd $APP_DIR

echo "🚀 Starting deployment..."

# Pull latest code
echo "📥 Pulling latest code..."
if [ -d ".git" ]; then
    git pull origin $BRANCH
else
    git clone -b $BRANCH $REPO_URL .
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build application
echo "🔨 Building application..."
npm run build

# Run database migrations (if any)
echo "🗄️ Running database migrations..."
npm run migration:run || echo "No migrations to run"

# Restart PM2 application
echo "🔄 Restarting application..."
pm2 restart ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

echo "✅ Deployment completed successfully!"
EOF

chmod +x /var/www/labora/deploy.sh

print_success "Deployment script created"

# Step 15: Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/labora > /dev/null <<EOF
/var/www/labora/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    copytruncate
}

/var/log/pm2/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF

print_success "Log rotation configured"

# Final instructions
echo ""
echo "🎉 VPS Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your application code to /var/www/labora"
echo "2. Copy .env.example to .env and update the configuration"
echo "3. Run database initialization: psql -U labora_user -d labora_db -f /path/to/schema.sql"
echo "4. Start your application: cd /var/www/labora && pm2 start ecosystem.config.js --env production"
echo "5. Save PM2 configuration: pm2 save"
echo ""
echo "📊 System Information:"
echo "- Database: PostgreSQL (User: labora_user, DB: labora_db)"
echo "- Database Password: $DB_PASSWORD"
echo "- JWT Secret: $JWT_SECRET"
echo "- Application Directory: /var/www/labora"
echo "- Nginx Configuration: /etc/nginx/sites-available/labora"
echo "- Log Directory: /var/www/labora/logs"
echo ""
echo "🔒 Security:"
echo "- UFW Firewall enabled"
echo "- Fail2Ban configured"
if [[ -n "$DOMAIN_NAME" ]]; then
echo "- SSL Certificate installed for $DOMAIN_NAME"
fi
echo ""
echo "⚠️  Important: Save the database password and JWT secret in a secure location!"

# Save credentials to a secure file
echo "DB_PASSWORD=$DB_PASSWORD" > /home/$USER/.labora_credentials
echo "JWT_SECRET=$JWT_SECRET" >> /home/$USER/.labora_credentials
chmod 600 /home/$USER/.labora_credentials

print_success "Setup completed! Credentials saved to ~/.labora_credentials"