#!/bin/bash

# Complete Diagnostic and Fix Script
# Fixes all port mismatches and connectivity issues

echo "=========================================="
echo "Complete Application Diagnostic & Fix"
echo "=========================================="
echo ""

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

CURRENT_IP=$(curl -s ifconfig.me)

# ============================================
# DIAGNOSTIC: CHECK WHAT'S RUNNING
# ============================================
print_info "Step 1: Checking current status..."
echo ""

print_info "PM2 Status:"
pm2 status
echo ""

print_info "Ports in use:"
sudo ss -tlnp | grep -E ':(80|3000|3001|4000|5000|5173)' || echo "No services on expected ports"
echo ""

# ============================================
# CHECK BACKEND ENV
# ============================================
print_info "Step 2: Checking backend configuration..."
cd ~/coorg-spices/backend

if [ -f ".env" ]; then
    BACKEND_PORT=$(grep "^PORT=" .env | cut -d'=' -f2)
    print_info "Backend configured for port: ${BACKEND_PORT:-5000}"
else
    print_error "No .env file found in backend!"
    BACKEND_PORT=3001
fi
echo ""

# ============================================
# TEST BACKEND API
# ============================================
print_info "Step 3: Testing backend API on different ports..."

for port in 3001 4000 5000; do
    print_info "Testing port $port..."
    if curl -s http://localhost:$port/api/health 2>/dev/null | grep -q "success"; then
        print_success "Backend responding on port $port"
        WORKING_PORT=$port
        break
    else
        print_info "No response on port $port"
    fi
done

if [ -z "$WORKING_PORT" ]; then
    print_error "Backend not responding on any port!"
    print_info "Checking backend logs..."
    pm2 logs coorg-backend --lines 50 --nostream
    echo ""
fi
echo ""

# ============================================
# FIX: UPDATE FRONTEND TO USE CORRECT PORT
# ============================================
if [ -n "$WORKING_PORT" ]; then
    print_info "Step 4: Updating frontend to use port $WORKING_PORT..."
    cd ~/coorg-spices/frontend
    
    cat > .env << EOF
REACT_APP_API_URL=http://$CURRENT_IP:$WORKING_PORT/api
EOF
    
    print_success "Frontend .env updated"
    echo ""
    
    # ============================================
    # REBUILD FRONTEND
    # ============================================
    print_info "Step 5: Rebuilding frontend..."
    rm -rf build
    if npm run build; then
        print_success "Frontend build completed"
    else
        print_error "Frontend build failed!"
        exit 1
    fi
    echo ""
    
    # ============================================
    # RESTART FRONTEND
    # ============================================
    print_info "Step 6: Restarting frontend..."
    pm2 delete coorg-frontend 2>/dev/null || true
    pm2 serve build 5173 --name coorg-frontend --spa
    print_success "Frontend restarted"
    echo ""
    
    # ============================================
    # UPDATE NGINX
    # ============================================
    print_info "Step 7: Updating Nginx configuration..."
    
    sudo tee /etc/nginx/sites-available/coorg-spices > /dev/null << EOF
server {
    listen 80;
    server_name $CURRENT_IP coorgmasala.com www.coorgmasala.com;

    # Frontend
    location / {
        root /home/ubuntu/coorg-spices/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API - Proxy to port $WORKING_PORT
    location /api {
        proxy_pass http://localhost:$WORKING_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files
    location /images {
        alias /home/ubuntu/coorg-spices/backend/public/images;
    }
}
EOF
    
    sudo ln -sf /etc/nginx/sites-available/coorg-spices /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    if sudo nginx -t; then
        sudo systemctl restart nginx
        print_success "Nginx configured for port $WORKING_PORT"
    else
        print_error "Nginx configuration error"
    fi
    echo ""
fi

# ============================================
# SAVE PM2
# ============================================
print_info "Step 8: Saving PM2 configuration..."
pm2 save
print_success "PM2 saved"
echo ""

# ============================================
# FINAL TESTS
# ============================================
print_info "Step 9: Final verification..."
echo ""

print_info "Testing Backend Health:"
if curl -s http://localhost:${WORKING_PORT:-3001}/api/health | grep -q "success"; then
    print_success "Backend health check passed"
else
    print_error "Backend health check failed"
fi
echo ""

print_info "Testing Backend Products:"
PRODUCTS=$(curl -s http://localhost:${WORKING_PORT:-3001}/api/products)
if echo "$PRODUCTS" | grep -q "\["; then
    PRODUCT_COUNT=$(echo "$PRODUCTS" | grep -o "\"_id\"" | wc -l)
    print_success "Backend products endpoint working - $PRODUCT_COUNT products"
else
    print_error "Backend products endpoint not working"
    echo "Response: $PRODUCTS"
fi
echo ""

print_info "Testing Frontend:"
if curl -s http://localhost:5173 | grep -q "root"; then
    print_success "Frontend is serving"
else
    print_error "Frontend not responding"
fi
echo ""

print_info "Testing Nginx:"
if curl -s http://localhost:80 | grep -q "root"; then
    print_success "Nginx is serving frontend"
else
    print_error "Nginx not responding"
fi
echo ""

print_info "Testing Nginx API Proxy:"
if curl -s http://localhost:80/api/health | grep -q "success"; then
    print_success "Nginx API proxy working"
else
    print_error "Nginx API proxy not working"
fi
echo ""

# ============================================
# SHOW FINAL STATUS
# ============================================
echo "=========================================="
print_success "Diagnostic Complete!"
echo "=========================================="
echo ""

print_info "Current Configuration:"
echo "  • Backend Port: ${WORKING_PORT:-3001}"
echo "  • Frontend Port: 5173"
echo "  • Nginx Port: 80"
echo "  • EC2 IP: $CURRENT_IP"
echo ""

echo "Access your application:"
echo ""
echo "  🌐 Main Site (via Nginx - RECOMMENDED):"
echo "     http://$CURRENT_IP"
echo "     http://$CURRENT_IP/api/health"
echo "     http://$CURRENT_IP/api/products"
echo ""
echo "  📱 Frontend (Direct):"
echo "     http://$CURRENT_IP:5173"
echo ""
echo "  🔧 Backend API (Direct):"
echo "     http://$CURRENT_IP:${WORKING_PORT:-3001}/api"
echo "     http://$CURRENT_IP:${WORKING_PORT:-3001}/api/products"
echo ""
echo "  🌍 Domain (if DNS configured):"
echo "     http://coorgmasala.com"
echo ""

print_info "Useful Commands:"
echo "  • View all logs: pm2 logs"
echo "  • View backend logs: pm2 logs coorg-backend"
echo "  • View frontend logs: pm2 logs coorg-frontend"
echo "  • Check status: pm2 status"
echo "  • Restart all: pm2 restart all"
echo "  • Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo ""

# Show PM2 status
print_info "Current PM2 Status:"
pm2 status
echo ""
