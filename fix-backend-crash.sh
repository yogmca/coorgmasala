#!/bin/bash

# Fix Backend Crash - Restart Backend Server
# This script fixes the backend server that keeps crashing

set -e

echo "=========================================="
echo "Fixing Backend Server Crash"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${YELLOW}→ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

# Step 1: Check current PM2 status
print_info "Step 1: Current PM2 status..."
pm2 status

# Step 2: Check backend logs to see why it's crashing
print_info "Step 2: Checking backend error logs..."
pm2 logs coorg-backend --lines 20 --nostream --err

# Step 3: Delete crashed backend process
print_info "Step 3: Deleting crashed backend process..."
pm2 delete coorg-backend || print_info "Backend already deleted"

# Step 4: Check backend .env file
print_info "Step 4: Checking backend .env file..."
if [ ! -f ~/coorg-spices/backend/.env ]; then
    print_error "Backend .env file missing! Creating it..."
    cat > ~/coorg-spices/backend/.env << 'EOF'
PORT=3001
MONGODB_URI=mongodb+srv://yogemca_db_user:IUsHwPUcgO2UL7LA@cluster0.lqzvstt.mongodb.net/coorg-spices?retryWrites=true&w=majority
JWT_SECRET=coorg_spices_jwt_secret_key_2026_production
NODE_ENV=production
EOF
    print_success "Backend .env created"
else
    print_success "Backend .env exists"
    cat ~/coorg-spices/backend/.env
fi

# Step 5: Install backend dependencies
print_info "Step 5: Installing backend dependencies..."
cd ~/coorg-spices/backend
npm install

# Step 6: Test if server can start
print_info "Step 6: Testing if server starts..."
timeout 5 node server.js || print_info "Server test completed"

# Step 7: Start backend with PM2
print_info "Step 7: Starting backend with PM2..."
cd ~/coorg-spices/backend
pm2 start server.js --name coorg-backend --time
print_success "Backend started"

# Step 8: Wait and check status
print_info "Step 8: Waiting for backend to stabilize..."
sleep 5

# Step 9: Check PM2 status
print_info "Step 9: Checking PM2 status..."
pm2 status

# Step 10: Test backend API
print_info "Step 10: Testing backend API..."
curl -s http://localhost:3001/api/products | head -c 200
echo ""

# Step 11: Save PM2 configuration
print_info "Step 11: Saving PM2 configuration..."
pm2 save
print_success "PM2 configuration saved"

echo ""
echo "=========================================="
echo "Backend Status"
echo "=========================================="
pm2 status

echo ""
echo "If backend is still errored, check logs:"
echo "  pm2 logs coorg-backend"
echo ""
echo "Common issues:"
echo "1. MongoDB connection - Check MONGODB_URI in .env"
echo "2. Missing dependencies - Run: cd ~/coorg-spices/backend && npm install"
echo "3. Port already in use - Run: sudo lsof -i :3001"
echo ""
