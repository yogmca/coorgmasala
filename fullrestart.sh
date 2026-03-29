#!/bin/bash

# Restart Backend, Frontend, and Nginx
# Run this on your EC2 instance after connecting via SSH

set -e  # Exit on error

echo "=========================================="
echo "Restarting Backend, Frontend, and Nginx"
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

# Navigate to project root
cd ~/coorg-spices

# ============================================
# BACKEND
# ============================================
print_info "Step 1: Restarting Backend..."
cd backend

# Stop backend if running
pm2 stop coorg-backend 2>/dev/null || true
pm2 delete coorg-backend 2>/dev/null || true

# Start backend
pm2 start server.js --name coorg-backend
print_success "Backend restarted on port 4000"
echo ""

# ============================================
# FRONTEND
# ============================================
print_info "Step 2: Building and Restarting Frontend..."
cd ../frontend

# Stop frontend if running
pm2 stop coorg-frontend 2>/dev/null || true
pm2 delete coorg-frontend 2>/dev/null || true

# Build frontend
print_info "Building frontend (this may take 1-2 minutes)..."
if npm run build; then
    print_success "Frontend build completed"
else
    print_error "Frontend build failed!"
    print_info "Trying to start anyway..."
fi

# Start frontend (serve the build)
pm2 serve build 5173 --name coorg-frontend --spa
print_success "Frontend restarted on port 5173"
echo ""

# ============================================
# NGINX
# ============================================
print_info "Step 3: Restarting Nginx..."

# Test nginx configuration first
if sudo nginx -t 2>/dev/null; then
    print_success "Nginx configuration is valid"
    
    # Restart nginx
    if sudo systemctl restart nginx; then
        print_success "Nginx restarted successfully"
    else
        print_error "Nginx restart failed"
        print_info "Checking nginx status..."
        sudo systemctl status nginx --no-pager
    fi
else
    print_error "Nginx configuration has errors"
    print_info "Showing nginx configuration test output..."
    sudo nginx -t
fi
echo ""

# ============================================
# SAVE PM2 CONFIGURATION
# ============================================
print_info "Step 4: Saving PM2 configuration..."
pm2 save
print_success "PM2 configuration saved"
echo ""

# ============================================
# SHOW STATUS
# ============================================
print_info "Step 5: Checking Status..."
echo ""

print_info "PM2 Processes:"
pm2 status
echo ""

print_info "Nginx Status:"
sudo systemctl status nginx --no-pager | head -n 10
echo ""

print_info "Listening Ports:"
sudo ss -tlnp | grep -E ':(80|443|4000|5173)' || echo "No services found on expected ports"
echo ""

echo "=========================================="
print_success "Restart Complete!"
echo "=========================================="
echo ""
echo "Your applications are now running:"
echo ""
echo "  📱 Frontend (Direct):"
echo "     http://3.27.42.171:5173"
echo ""
echo "  🔧 Backend API (Direct):"
echo "     http://3.27.42.171:4000/api"
echo ""
echo "  🌐 Nginx (Production):"
echo "     http://3.27.42.171"
echo "     http://3.27.42.171/api (proxied to backend)"
echo ""
echo "Useful commands:"
echo "  • View logs: pm2 logs"
echo "  • Check status: pm2 status"
echo "  • Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "  • Restart nginx: sudo systemctl restart nginx"
echo ""
