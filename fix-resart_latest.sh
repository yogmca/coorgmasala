#!/bin/bash

# Fix PM2 and Restart All Services
# This script fixes PM2 corruption and restarts everything cleanly

echo "=========================================="
echo "Fixing PM2 and Restarting All Services"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# ============================================
# FIX PM2 CORRUPTION
# ============================================
print_info "Step 1: Fixing PM2 corruption..."

# Kill all PM2 processes
pm2 kill
print_success "PM2 daemon killed"

# Remove PM2 dump file
rm -f ~/.pm2/dump.pm2
print_success "PM2 dump file removed"

# Kill any orphaned node processes
print_info "Killing orphaned node processes..."
pkill -f "node.*server.js" || true
pkill -f "pm2.*serve" || true
print_success "Orphaned processes cleaned"

echo ""

# ============================================
# REBUILD FRONTEND
# ============================================
print_info "Step 2: Building Frontend..."
cd ~/coorg-spices/frontend

# Clean old build
rm -rf build

# Build
if npm run build; then
    print_success "Frontend build completed"
else
    print_error "Frontend build failed - check for errors above"
    exit 1
fi

echo ""

# ============================================
# START BACKEND
# ============================================
print_info "Step 3: Starting Backend..."
cd ~/coorg-spices/backend

pm2 start server.js --name coorg-backend
print_success "Backend started on port 4000"

echo ""

# ============================================
# START FRONTEND
# ============================================
print_info "Step 4: Starting Frontend..."
cd ~/coorg-spices/frontend

pm2 serve build 5173 --name coorg-frontend --spa
print_success "Frontend started on port 5173"

echo ""

# ============================================
# RESTART NGINX
# ============================================
print_info "Step 5: Restarting Nginx..."

if sudo nginx -t 2>&1 | grep -q "successful"; then
    sudo systemctl restart nginx
    print_success "Nginx restarted"
else
    print_error "Nginx config has errors - skipping restart"
    sudo nginx -t
fi

echo ""

# ============================================
# SAVE PM2 CONFIG
# ============================================
print_info "Step 6: Saving PM2 configuration..."
pm2 save
print_success "PM2 configuration saved"

echo ""

# ============================================
# VERIFY EVERYTHING IS RUNNING
# ============================================
print_info "Step 7: Verifying services..."
echo ""

print_info "PM2 Status:"
pm2 status

echo ""
print_info "Listening Ports:"
sudo ss -tlnp | grep -E ':(80|4000|5173)' | awk '{print $4, $6}' || echo "Checking ports..."

echo ""
print_info "Testing Backend API:"
if curl -s http://localhost:4000/api/products > /dev/null 2>&1; then
    print_success "Backend API is responding"
else
    print_error "Backend API is not responding"
fi

echo ""
print_info "Testing Frontend:"
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    print_success "Frontend is responding"
else
    print_error "Frontend is not responding"
fi

echo ""
print_info "Testing Nginx:"
if curl -s http://localhost:80 > /dev/null 2>&1; then
    print_success "Nginx is responding"
else
    print_error "Nginx is not responding"
fi

echo ""
echo "=========================================="
print_success "Setup Complete!"
echo "=========================================="
echo ""
echo "Your applications should now be accessible:"
echo ""
echo "  🌐 Main Site (via Nginx):"
echo "     http://3.27.42.171"
echo ""
echo "  📱 Frontend (Direct):"
echo "     http://3.27.42.171:5173"
echo ""
echo "  🔧 Backend API (Direct):"
echo "     http://3.27.42.171:4000/api"
echo "     http://3.27.42.171:4000/api/products"
echo ""
echo "Useful commands:"
echo "  • View logs: pm2 logs"
echo "  • Check status: pm2 status"
echo "  • Restart all: pm2 restart all"
echo "  • Stop all: pm2 stop all"
echo ""
