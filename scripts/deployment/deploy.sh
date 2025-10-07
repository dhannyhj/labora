#!/bin/bash
# Quick deployment script for Labora Clinical Lab System
# This script deploys the application to an already configured VPS

set -e

# Configuration
APP_DIR="/var/www/labora"
REPO_URL="https://github.com/dhannyhj/labora.git"
BRANCH="main"
BACKUP_DIR="/var/backups/labora"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "🚀 Starting Labora deployment..."

# Create backup directory
sudo mkdir -p $BACKUP_DIR
sudo chown -R $USER:$USER $BACKUP_DIR

# Step 1: Backup current application (if exists)
if [ -d "$APP_DIR" ] && [ -f "$APP_DIR/package.json" ]; then
    print_status "Creating backup of current application..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    cp -r $APP_DIR $BACKUP_DIR/backup_$timestamp
    print_success "Backup created: $BACKUP_DIR/backup_$timestamp"
fi

# Step 2: Create app directory if it doesn't exist
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Step 3: Clone or update repository
cd $APP_DIR
if [ -d ".git" ]; then
    print_status "Updating repository..."
    git fetch origin
    git reset --hard origin/$BRANCH
else
    print_status "Cloning repository..."
    git clone -b $BRANCH $REPO_URL .
fi

print_success "Code updated from repository"

# Step 4: Install dependencies
print_status "Installing dependencies..."
npm ci --only=production

# Step 5: Build application
print_status "Building application..."
npm run build

# Step 6: Setup environment if not exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Copying from .env.example..."
    cp .env.example .env
    print_warning "Please update .env file with your configuration!"
fi

# Step 7: Create necessary directories
mkdir -p uploads logs
sudo mkdir -p /var/log/pm2

# Step 8: Set proper permissions
sudo chown -R $USER:$USER $APP_DIR
sudo chown -R $USER:$USER /var/log/pm2
chmod -R 755 uploads logs

# Step 9: Database setup (if schema file exists)
if [ -f "sql/lab_schema_modular_idempotent_v1.sql" ]; then
    print_status "Setting up database schema..."
    
    # Check if database exists and has tables
    tables_count=$(PGPASSWORD=$DATABASE_PASSWORD psql -h localhost -U labora_user -d labora_db -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='lab';" 2>/dev/null | xargs || echo "0")
    
    if [ "$tables_count" = "0" ]; then
        print_status "Initializing database schema..."
        PGPASSWORD=$DATABASE_PASSWORD psql -h localhost -U labora_user -d labora_db -f sql/lab_schema_modular_idempotent_v1.sql
        print_success "Database schema initialized"
    else
        print_status "Database already has $tables_count tables. Skipping schema initialization."
    fi
else
    print_warning "Database schema file not found. Please run manually if needed."
fi

# Step 10: Start/restart application with PM2
print_status "Starting application with PM2..."

# Stop existing PM2 processes
pm2 delete labora-api 2>/dev/null || true

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

print_success "Application started with PM2"

# Step 11: Update Nginx configuration
print_status "Updating Nginx configuration..."
if [ -f "nginx/sites-available/labora.conf" ]; then
    sudo cp nginx/sites-available/labora.conf /etc/nginx/sites-available/labora
    sudo nginx -t
    sudo systemctl reload nginx
    print_success "Nginx configuration updated"
else
    print_warning "Nginx configuration file not found in repository"
fi

# Step 12: Show application status
print_status "Checking application status..."
sleep 3

echo ""
echo "📊 Application Status:"
pm2 status
echo ""

# Check if application is responding
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "✅ Application is responding on port 3000"
else
    print_error "❌ Application is not responding. Check logs: pm2 logs labora-api"
fi

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Useful commands:"
echo "- Check logs: pm2 logs labora-api"
echo "- Restart app: pm2 restart labora-api"
echo "- Monitor app: pm2 monit"
echo "- Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "- Application logs: tail -f $APP_DIR/logs/app.log"
echo ""
echo "🌐 Your application should be available at:"
echo "- http://your-server-ip"
if [ -n "$DOMAIN_NAME" ]; then
    echo "- https://$DOMAIN_NAME"
fi
echo ""

# Final health check
print_status "Performing final health check..."
sleep 2
response=$(curl -s http://localhost:3000/health || echo "failed")
if [[ $response == *"ok"* ]]; then
    print_success "🎉 Health check passed! Application is running correctly."
else
    print_error "⚠️  Health check failed. Please check the logs."
    echo "Response: $response"
fi