#!/bin/bash

# Fix 502 Bad Gateway Error
# This happens when Nginx can't connect to backend

echo "=========================================="
echo "Fixing 502 Bad Gateway Error"
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
# STEP 1: TEST BACKEND DIRECTLY
# ============================================
print_info "Step 1: Testing backend directly..."
echo ""

for port in 3001 4000 5000; do
    print_info "Testing port $port..."
    RESPONSE=$(curl -s http://localhost:$port/api/health 2>&1)
    if echo "$RESPONSE" | grep -q "success"; then
        print_success "Backend responding on port $port"
        BACKEND_PORT=$port
        break
    fi
done

if [ -z "$BACKEND_PORT" ]; then
    print_error "Backend not responding on any port!"
    print_info "Checking backend logs..."
    pm2 logs coorg-backend --lines 30 --nostream
    echo ""
    print_info "Restarting backend..."
    pm2 restart coorg-backend
    sleep 3
    
    # Try again
    for port in 3001 4000 5000; do
        if curl -s http://localhost:$port/api/health 2>&1 | grep -q "success"; then
            BACKEND_PORT=$port
            break
        fi
    done
fi

if [ -z "$BACKEND_PORT" ]; then
    print_error "Backend still not responding - check MongoDB connection"
    exit 1
fi

print_success "Backend confirmed on port $BACKEND_PORT"
echo ""

# ============================================
# STEP 2: UPDATE NGINX CONFIGURATION
# ============================================
print_info "Step 2: Updating Nginx configuration..."

sudo tee /etc/nginx/sites-available/coorg-spices > /dev/null << EOF
server {
    listen 80;
    server_name coorgmasala.com www.coorgmasala.com 3.27.42.171;

    # Frontend
    location / {
        root /home/ubuntu/coorg-spices/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files
    location /images {
        alias /home/ubuntu/coorg-spices/backend/public/images;
    }
}
EOF

print_success "Nginx config updated for port $BACKEND_PORT"
echo ""

# ============================================
# STEP 3: TEST AND RELOAD NGINX
# ============================================
print_info "Step 3: Testing and reloading Nginx..."

if sudo nginx -t; then
    sudo systemctl reload nginx
    print_success "Nginx reloaded successfully"
else
    print_error "Nginx configuration error"
    sudo nginx -t
    exit 1
fi
echo ""

# ============================================
# STEP 4: VERIFY EVERYTHING
# ============================================
print_info "Step 4: Verification..."
echo ""

print_info "Testing backend directly:"
if curl -s http://localhost:$BACKEND_PORT/api/health | grep -q "success"; then
    print_success "✓ Backend health check passed"
else
    print_error "✗ Backend health check failed"
fi

print_info "Testing backend products:"
if curl -s http://localhost:$BACKEND_PORT/api/products | grep -q "\["; then
    print_success "✓ Backend products working"
else
    print_error "✗ Backend products not working"
fi

print_info "Testing Nginx proxy:"
if curl -s http://localhost/api/health | grep -q "success"; then
    print_success "✓ Nginx proxy working"
else
    print_error "✗ Nginx proxy not working"
    print_info "Checking Nginx error log..."
    sudo tail -20 /var/log/nginx/error.log
fi

print_info "Testing frontend:"
if curl -s http://localhost:5173 | grep -q "root"; then
    print_success "✓ Frontend working"
else
    print_error "✗ Frontend not working"
fi
echo ""

# ============================================
# STEP 5: CHECK HTTPS IF CONFIGURED
# ============================================
if sudo certbot certificates 2>/dev/null | grep -q "Certificate Name"; then
    print_info "Step 5: Checking HTTPS configuration..."
    
    # Update HTTPS config
    sudo certbot --nginx \
        -d coorgmasala.com \
        -d www.coorgmasala.com \
        --non-interactive \
        --agree-tos \
        --email admin@coorgmasala.com \
        --redirect \
        --reinstall
    
    print_success "HTTPS configuration updated"
    echo ""
fi

# ============================================
# FINAL STATUS
# ============================================
echo "=========================================="
print_success "Fix Complete!"
echo "=========================================="
echo ""

echo "Test these URLs in your browser:"
echo ""
echo "  HTTP:"
echo "    http://coorgmasala.com"
echo "    http://coorgmasala.com/api/health"
echo "    http://coorgmasala.com/api/products"
echo ""

if sudo certbot certificates 2>/dev/null | grep -q "Certificate Name"; then
    echo "  HTTPS:"
    echo "    https://coorgmasala.com"
    echo "    https://coorgmasala.com/api/health"
    echo "    https://coorgmasala.com/api/products"
    echo ""
fi

echo "  Direct (for debugging):"
echo "    http://3.27.42.171:$BACKEND_PORT/api/health"
echo "    http://3.27.42.171:5173"
echo ""

print_info "If you still see 502 error:"
echo "  1. Check backend logs: pm2 logs coorg-backend"
echo "  2. Check Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "  3. Restart backend: pm2 restart coorg-backend"
echo "  4. Restart Nginx: sudo systemctl restart nginx"
echo ""
