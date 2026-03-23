#!/bin/bash

#############################################
# Coorg Spices - Update Script for EC2
# This script updates the application with latest code from GitHub
#############################################

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="/home/ubuntu/coorg-spices"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Updating Coorg Spices Application${NC}"
echo -e "${GREEN}========================================${NC}"

# Navigate to app directory
cd "$APP_DIR"

# Pull latest changes
echo -e "${GREEN}[INFO]${NC} Pulling latest changes from GitHub..."
git pull origin main

# Update backend
echo -e "${GREEN}[INFO]${NC} Updating backend..."
cd "$APP_DIR/backend"
npm install --production

# Update frontend
echo -e "${GREEN}[INFO]${NC} Updating frontend..."
cd "$APP_DIR/frontend"
npm install --production
npm run build

# Restart services
echo -e "${GREEN}[INFO]${NC} Restarting services..."
pm2 restart all

# Show status
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Update Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
pm2 status

echo -e "\n${YELLOW}Note: If you updated environment variables, make sure to restart:${NC}"
echo -e "  ${YELLOW}pm2 restart all${NC}"
