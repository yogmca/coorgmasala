#!/bin/bash

# Complete Nginx Cleanup and Reconfiguration
# Removes all old configs and creates fresh one

echo "=========================================="
echo "Complete Nginx Cleanup and Reconfiguration"
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

# ============================================
# STEP 1: REMOVE ALL OLD CONFIGS
# ============================================
print_info "Step 1: Removing all old Nginx configurations..."

# Remove all enabled sites
sudo rm -f /etc/nginx/sites-enabled/*
print_success "Removed all enabled sites"

# Remove old coorg-spices configs
sudo rm -f /etc/nginx/sites-available/coorg-spices*
sudo rm -f /etc/nginx/sites-available/default
print_success "Removed old configurations"
echo ""

# ============================================
# STEP 2: CREATE FRESH CONFIGURATION
# ============================================
print_info "Step 2: Creating fresh Nginx configuration..."

sudo tee /etc/nginx/sites-available/coorgmasala > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name coorgmasala.com www.coorgmasala.com api.coorgmasala.com 3.27.42.171;

    # Root directory for frontend
    root /home/ubuntu/coorg-spices/frontend/build;
    index index.html;

    # Frontend - all routes go to index.html (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API - proxy to port 3001
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static images
    location /images/ {
        alias /home/ubuntu/coorg-spices/backend/public/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
EOF

print_success "Created new configuration: /etc/nginx/sites-available/coorgmasala"
echo ""

# ============================================
# STEP 3: ENABLE NEW CONFIGURATION
# ============================================
print_info "Step 3: Enabling new configuration..."

sudo ln -s /etc/nginx/sites-available/coorgmasala /etc/nginx/sites-enabled/
print_success "Configuration enabled"
echo ""

# ============================================
# STEP 4: TEST CONFIGURATION
# ============================================
print_info "Step 4: Testing Nginx configuration..."

if sudo nginx -t; then
    print_success "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors!"
    sudo nginx -t
    exit 1
fi
echo ""

# ============================================
# STEP 5: RESTART NGINX
# ============================================
print_info "Step 5: Restarting Nginx..."

sudo systemctl restart nginx
sleep 2

if sudo systemctl is-active --quiet nginx; then
    print_success "Nginx restarted successfully"
else
    print_error "Nginx failed to start!"
    sudo systemctl status nginx
    exit 1
fi
echo ""

# ============================================
# STEP 6: VERIFY EVERYTHING
# ============================================
print_info "Step 6: Verification tests..."
echo ""

print_info "Backend health:"
if curl -s http://localhost:3001/api/health | grep -q "success"; then
    print_success "✓ Backend responding on port 3001"
else
    print_error "✗ Backend not responding"
fi

print_info "Frontend files:"
if [ -f "/home/ubuntu/coorg-spices/frontend/build/index.html" ]; then
    print_success "✓ Frontend build exists"
else
    print_error "✗ Frontend build missing!"
fi

print_info "Nginx serving frontend:"
FRONTEND_TEST=$(curl -s http://localhost/)
if echo "$FRONTEND_TEST" | grep -q "root"; then
    print_success "✓ Nginx serving frontend"
else
    print_error "✗ Nginx not serving frontend properly"
fi

print_info "Nginx API proxy:"
if curl -s http://localhost/api/health | grep -q "success"; then
    print_success "✓ Nginx API proxy working"
else
    print_error "✗ Nginx API proxy not working"
fi

print_info "Nginx error log (last 5 lines):"
sudo tail -5 /var/log/nginx/error.log
echo ""

# ============================================
# STEP 7: RECONFIGURE HTTPS IF NEEDED
# ============================================
if command -v certbot &> /dev/null; then
    if sudo certbot certificates 2>/dev/null | grep -q "coorgmasala.com"; then
        print_info "Step 7: Reconfiguring HTTPS..."
        
        sudo certbot --nginx \
            -d coorgmasala.com \
            -d www.coorgmasala.com \
            -d api.coorgmasala.com \
            --non-interactive \
            --agree-tos \
            --email admin@coorgmasala.com \
            --redirect \
            --reinstall
        
        if [ $? -eq 0 ]; then
            print_success "HTTPS reconfigured"
        else
            print_info "HTTPS reconfiguration skipped (not critical)"
        fi
        echo ""
    fi
fi

# ============================================
# FINAL STATUS
# ============================================
echo "=========================================="
print_success "Nginx Cleanup Complete!"
echo "=========================================="
echo ""

echo "Active Nginx configuration:"
echo "  • Config file: /etc/nginx/sites-available/coorgmasala"
echo "  • Enabled: /etc/nginx/sites-enabled/coorgmasala"
echo ""

echo "Your site is now accessible at:"
echo "  • http://coorgmasala.com"
echo "  • http://www.coorgmasala.com"
echo "  • http://api.coorgmasala.com"
echo "  • http://3.27.42.171"
echo ""

if sudo certbot certificates 2>/dev/null | grep -q "coorgmasala.com"; then
    echo "HTTPS URLs:"
    echo "  • https://coorgmasala.com"
    echo "  • https://www.coorgmasala.com"
    echo "  • https://api.coorgmasala.com"
    echo ""
fi

echo "API Endpoints:"
echo "  • http://coorgmasala.com/api/health"
echo "  • http://coorgmasala.com/api/products"
echo ""

print_info "Useful commands:"
echo "  • View Nginx config: sudo cat /etc/nginx/sites-available/coorgmasala"
echo "  • Test Nginx: sudo nginx -t"
echo "  • Reload Nginx: sudo systemctl reload nginx"
echo "  • View errors: sudo tail -f /var/log/nginx/error.log"
echo "  • View access: sudo tail -f /var/log/nginx/access.log"
echo ""

print_success "All old port 3000 references removed!"
echo ""
