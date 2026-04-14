#!/bin/bash

# Digital Coffee VPS Deployment Script
# This script deploys the backend server and admin dashboard to the VPS

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Digital Coffee Deployment Script ===${NC}\n"

# Configuration - Update these with your VPS details
VPS_USER="root"
VPS_HOST="76.13.41.99"
VPS_PATH="/var/www/digitalcoffee"
DOMAIN="digitalcoffee.cafe"

# Function to print step
print_step() {
  echo -e "\n${YELLOW}>>> $1${NC}\n"
}

# Step 1: Build admin dashboard
print_step "Building admin dashboard for production..."
cd admin-dashboard
npm run build
cd ..

# Step 2: Create deployment package
print_step "Creating deployment package..."
mkdir -p deploy-package
cp -r admin-dashboard/dist deploy-package/admin
cp -r config deploy-package/
cp -r audio deploy-package/ 2>/dev/null || mkdir -p deploy-package/audio
cp index.js deploy-package/
cp package.json deploy-package/
cp .env deploy-package/
cp -r scripts deploy-package/

# Step 3: Upload to VPS
print_step "Uploading files to VPS..."
ssh ${VPS_USER}@${VPS_HOST} "mkdir -p ${VPS_PATH}"
rsync -avz --progress deploy-package/ ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/

# Step 4: Install dependencies and setup on VPS
print_step "Installing dependencies on VPS..."
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
cd /var/www/digitalcoffee
npm install --production
pm2 stop digitalcoffee || true
pm2 start index.js --name digitalcoffee
pm2 save
pm2 startup
ENDSSH

# Step 5: Configure nginx
print_step "Configuring nginx..."
ssh ${VPS_USER}@${VPS_HOST} "cat > /etc/nginx/sites-available/digitalcoffee << 'EOF'
server {
    listen 80;
    server_name ${DOMAIN};

    # Root location for main website (if exists)
    location / {
        root /var/www/html;
        index index.html;
    }

    # Admin dashboard at /admin
    location /admin {
        alias /var/www/digitalcoffee/admin;
        try_files \$uri \$uri/ /admin/index.html;
        add_header Cache-Control 'no-cache, must-revalidate, proxy-revalidate, max-age=0';
    }

    # API endpoints
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Audio files
    location /audio {
        proxy_pass http://localhost:3001;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF"

ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
ln -sf /etc/nginx/sites-available/digitalcoffee /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
ENDSSH

# Step 6: Cleanup
print_step "Cleaning up..."
rm -rf deploy-package

echo -e "\n${GREEN}=== Deployment Complete! ===${NC}\n"
echo -e "${GREEN}Admin Dashboard:${NC} http://${DOMAIN}"
echo -e "${GREEN}API Endpoint:${NC} http://${DOMAIN}/api"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Set up SSL certificate with: sudo certbot --nginx -d ${DOMAIN}"
echo "2. Create an admin user: cd /var/www/digitalcoffee && node scripts/create-admin.js"
echo "3. Update Firebase web credentials in admin dashboard .env file on VPS"
echo ""
