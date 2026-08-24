#!/bin/bash

# Digital Coffee Admin Dashboard Deployment Script
# This script builds and deploys the admin dashboard to the production server

set -e  # Exit on error

echo "🚀 Digital Coffee Admin Dashboard Deployment"
echo "============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SERVER="digitalcoffee.cafe"
SERVER_USER="root"  # Change this to your server username
REMOTE_PATH="/var/www/digitalcoffee/admin-dashboard/dist"
LOCAL_BUILD_PATH="./admin-dashboard/dist"

echo -e "${BLUE}Step 1: Building Admin Dashboard...${NC}"
cd admin-dashboard
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful!${NC}"
else
    echo -e "${RED}✗ Build failed!${NC}"
    exit 1
fi

cd ..

echo ""
echo -e "${BLUE}Step 2: Deploying to server...${NC}"
echo "Server: $SERVER"
echo "Remote path: $REMOTE_PATH"
echo ""

# Create backup of current deployment
echo -e "${YELLOW}Creating backup of current deployment...${NC}"
ssh ${SERVER_USER}@${SERVER} "if [ -d ${REMOTE_PATH} ]; then cp -r ${REMOTE_PATH} ${REMOTE_PATH}.backup.$(date +%Y%m%d_%H%M%S); fi"

# Deploy new build
echo -e "${YELLOW}Copying files to server...${NC}"
rsync -avz --delete ${LOCAL_BUILD_PATH}/ ${SERVER_USER}@${SERVER}:${REMOTE_PATH}/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment successful!${NC}"
else
    echo -e "${RED}✗ Deployment failed!${NC}"
    echo -e "${YELLOW}Rolling back...${NC}"
    ssh ${SERVER_USER}@${SERVER} "rm -rf ${REMOTE_PATH} && mv ${REMOTE_PATH}.backup.* ${REMOTE_PATH}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 3: Restarting backend server (optional)...${NC}"
read -p "Do you want to restart the backend server? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Restarting server...${NC}"
    ssh ${SERVER_USER}@${SERVER} "cd /var/www/digitalcoffee && pm2 restart index.js || (pkill -f 'node index.js' && nohup node index.js > /dev/null 2>&1 &)"
    echo -e "${GREEN}✓ Server restarted!${NC}"
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Admin Dashboard: https://${SERVER}/admin"
echo ""
echo "Test the following new features:"
echo "  • Push Notifications: https://${SERVER}/admin/notifications"
echo "  • Promo Codes: https://${SERVER}/admin/promo-codes"
echo "  • Content Management: https://${SERVER}/admin/content"
echo "  • Activity Logs: https://${SERVER}/admin/activity-logs"
echo ""
echo -e "${YELLOW}Don't forget to test all features!${NC}"
