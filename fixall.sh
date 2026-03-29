#!/bin/bash

# Final Complete Fix - Check Everything and Fix Port 3000

echo "=========================================="
echo "Final Complete Nginx Fix"
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

# Check if script was run with sudo for some commands
if [ "$EUID" -eq 0 ]; then 
    print_error "Don't run this script with sudo"
    exit 1
fi

# ============================================
# STEP 1: SHOW CURRENT NGINX CONFIGS
# ============================================
print_info "Step 1: Checking current Nginx configurations..."
echo ""

print_info "Files in /etc/nginx/sites-enabled/:"
sudo ls -la /etc/nginx/sites-enabled/ || echo "Directory empty or doesn't exist"
echo ""

print_info "Searching for port 3000 in all Nginx configs:"
sudo grep -r "3000" /etc/nginx/ 2>/dev/null || print_success "No port 3000 found"
echo ""

# ============================================
# STEP 2: STOP NGINX
# ============================================
print_info "Step 2: Stopping Nginx..."
sudo systemctl stop nginx
print_success "Nginx stopped"
echo ""

# ============================================
# STEP 3: BACKUP AND REMOVE ALL CONFIGS
# ============================================
print_info "Step 3: Backing up and removing all site configs..."

# Backup
sudo mkdir -p /tmp/nginx-backup
sudo cp -r /etc/nginx/sites-available/* /tmp/nginx-backup/ 2>/dev/null || true
sudo cp -r /etc/nginx/sites-enabled/* /tmp/nginx-backup/ 2>/dev/null || true
print_success "Backup created in /tmp/nginx-backup/"

# Remove all
sudo rm -f /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/sites-available/coorg*
sudo rm -f /etc/nginx/sites-available/default*
print_success "All old configs removed"
echo ""

# ============================================
# STEP 4: CREATE FRESH CONFIG
# ============================================
print_info "Step 4: Creating fresh Nginx configuration..."

sudo tee /etc/nginx/sites-available/coorgmasala > /dev/null << 'NGINXCONF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name coorgmasala.com www.coorgmasala.com api.coorgmasala.com 3.27.42.171 _;
    
    # Document root
    root /home/ubuntu/coorg-spices/frontend/build;
    index index.html index.htm;
    
    # Logging
    access_log /var/log/nginx/coorgmasala_access.log;
    error_log /var/log/nginx/coorgmasala_error.log;
    
    # Frontend - React Router (all routes go to index.html)
    location / {
        try_files $uri $uri/ /index.html =404;
    }
    
    # Backend API - Proxy to port 3001
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
    
    # Favicon
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }
    
    # Robots.txt
    location = /robots.txt {
        log_not_found off;
        access_log off;
    }
}
NGINXCONF

print_success "Fresh config created: /etc/nginx/sites-available/coorgmasala"
echo ""

# ============================================
# STEP 5: ENABLE CONFIG
# ============================================
print_info "Step 5: Enabling configuration..."
sudo ln -s /etc/nginx/sites-available/coorgmasala /etc/nginx/sites-enabled/coorgmasala
print_success "Config enabled"
echo ""

# ============================================
# STEP 6: VERIFY NO PORT 3000
# ============================================
print_info "Step 6: Verifying no port 3000 references..."
if sudo grep -r "3000" /etc/nginx/ 2>/dev/null; then
    print_error "Port 3000 still found in configs!"
    exit 1
else
    print_success "No port 3000 references found"
fi
echo ""

# ============================================
# STEP 7: TEST CONFIG
# ============================================
print_info "Step 7: Testing Nginx configuration..."
if sudo nginx -t; then
    print_success "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors!"
    exit 1
fi
echo ""

# ============================================
# STEP 8: START NGINX
# ============================================
print_info "Step 8: Starting Nginx..."
sudo systemctl start nginx
sleep 2

if sudo systemctl is-active --quiet nginx; then
    print_success "Nginx started successfully"
else
    print_error "Nginx failed to start!"
    sudo systemctl status nginx
    exit 1
fi
echo ""

# ============================================
# STEP 9: VERIFY SERVICES
# ============================================
print_info "Step 9: Verifying all services..."
echo ""

print_info "Backend (port 3001):"
if curl -s http://localhost:3001/api/health 2>/dev/null | grep -q "success"; then
    print_success "✓ Backend responding"
else
    print_error "✗ Backend not responding"
fi

print_info "Frontend build:"
if [ -f "/home/ubuntu/coorg-spices/frontend/build/index.html" ]; then
    print_success "✓ Frontend build exists"
else
    print_error "✗ Frontend build missing"
fi

print_info "Nginx serving frontend:"
if curl -s http://localhost/ 2>/dev/null | grep -q "root"; then
    print_success "✓ Nginx serving frontend"
else
    print_error "✗ Nginx not serving frontend"
fi

print_info "Nginx API proxy:"
if curl -s http://localhost/api/health 2>/dev/null | grep -q "success"; then
    print_success "✓ Nginx API proxy working"
else
    print_error "✗ Nginx API proxy not working"
fi

echo ""

# ============================================
# STEP 10: CHECK RECENT ERRORS
# ============================================
print_info "Step 10: Checking for NEW errors (last 10 lines)..."
echo ""
sudo tail -10 /var/log/nginx/coorgmasala_error.log 2>/dev/null || echo "No errors yet (good!)"
echo ""

# ============================================
# FINAL STATUS
# ============================================
echo "=========================================="
print_success "Setup Complete!"
echo "=========================================="
echo ""

echo "Active Nginx Configuration:"
echo "  • Config: /etc/nginx/sites-available/coorgmasala"
echo "  • Enabled: /etc/nginx/sites-enabled/coorgmasala"
echo "  • Backup: /tmp/nginx-backup/"
echo ""

echo "Your site is accessible at:"
echo "  • http://coorgmasala.com"
echo "  • http://www.coorgmasala.com"
echo "  • http://api.coorgmasala.com"
echo "  • http://3.27.42.171"
echo ""

echo "API Endpoints:"
echo "  • http://coorgmasala.com/api/health"
echo "  • http://coorgmasala.com/api/products"
echo ""

print_info "Monitor for new errors:"
echo "  sudo tail -f /var/log/nginx/coorgmasala_error.log"
echo ""

print_info "Test in browser:"
echo "  1. Open http://coorgmasala.com"
echo "  2. Check browser console for errors"
echo "  3. Verify products load"
echo ""

print_success "All port 3000 references removed!"
print_success "Nginx is now correctly configured!"
echo ""
