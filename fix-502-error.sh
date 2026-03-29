#!/bin/bash

# Fix 502 Bad Gateway Error
# This script fixes the backend application not running issue

set -e

echo "=========================================="
echo "Fixing 502 Bad Gateway Error"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${YELLOW}→ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

# Step 1: Check PM2 status
print_info "Step 1: Checking PM2 processes..."
pm2 status

# Step 2: Stop all PM2 processes
print_info "Step 2: Stopping all PM2 processes..."
pm2 delete all || print_info "No processes to delete"

# Step 3: Navigate to app directory
print_info "Step 3: Navigating to app directory..."
cd ~/coorg-spices

# Step 4: Pull latest code
print_info "Step 4: Pulling latest code from Git..."
git pull || print_info "Already up to date"

# Step 5: Install backend dependencies
print_info "Step 5: Installing backend dependencies..."
cd backend
npm install

# Step 6: Install frontend dependencies and build
print_info "Step 6: Installing frontend dependencies and building..."
cd ../frontend
npm install
npm run build

# Step 7: Start backend with PM2
print_info "Step 7: Starting backend server..."
cd ../backend
pm2 start server.js --name coorg-backend
print_success "Backend started"

# Step 8: Start frontend with PM2
print_info "Step 8: Starting frontend server..."
cd ../frontend
pm2 serve build 3000 --name coorg-frontend --spa
print_success "Frontend started"

# Step 9: Save PM2 configuration
print_info "Step 9: Saving PM2 configuration..."
pm2 save
print_success "PM2 configuration saved"

# Step 10: Check PM2 status
print_info "Step 10: Checking PM2 status..."
pm2 status

# Step 11: Test backend
print_info "Step 11: Testing backend API..."
sleep 3
curl -s http://localhost:3001/api/products | head -c 100
echo ""

# Step 12: Test frontend
print_info "Step 12: Testing frontend..."
curl -I http://localhost:3000 | head -5

# Step 13: Restart Nginx
print_info "Step 13: Restarting Nginx..."
sudo systemctl restart nginx
print_success "Nginx restarted"

echo ""
echo "=========================================="
echo "✅ Fix Complete!"
echo "=========================================="
echo ""
echo "PM2 Status:"
pm2 status
echo ""
echo "Your site should now be accessible at:"
echo "  https://coorgmasala.com"
echo "  http://3.26.91.105"
echo ""
echo "If you still see 502 error:"
echo "1. Check PM2 logs: pm2 logs"
echo "2. Check Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "3. Restart everything: pm2 restart all && sudo systemctl restart nginx"
echo ""
