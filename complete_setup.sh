#!/bin/bash

# Complete Setup: Fix Everything and Enable HTTPS
# This script does everything in the correct order

echo "=========================================="
echo "Complete CoorgMasala Setup"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

CURRENT_IP=$(curl -s ifconfig.me)
DOMAIN="coorgmasala.com"

# ============================================
# PHASE 1: FIX PM2 AND CLEAN START
# ============================================
print_header "PHASE 1: Clean PM2 and Kill Orphaned Processes"
echo ""

print_info "Stopping all PM2 processes..."
pm2 kill
rm -f ~/.pm2/dump.pm2
pkill -f "node.*server.js" || true
pkill -f "pm2.*serve" || true
print_success "PM2 cleaned"
echo ""

# ============================================
# PHASE 2: DETECT BACKEND PORT
# ============================================
print_header "PHASE 2: Detect Backend Configuration"
echo ""

cd ~/coorg-spices/backend

# Check .env for port
if [ -f ".env" ]; then
    BACKEND_PORT=$(grep "^PORT=" .env | cut -d'=' -f2 | tr -d ' ')
    if [ -z "$BACKEND_PORT" ]; then
        BACKEND_PORT=3001
    fi
    print_info "Backend port from .env: $BACKEND_PORT"
else
    print_error "No .env file found!"
    print_info "Creating backend .env..."
    cat > .env << EOF
PORT=3001
MONGODB_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/coorg-spices
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF
    BACKEND_PORT=3001
    print_info "⚠️  Please update MONGODB_URI in ~/coorg-spices/backend/.env"
fi
echo ""

# ============================================
# PHASE 3: START BACKEND
# ============================================
print_header "PHASE 3: Start Backend"
echo ""

cd ~/coorg-spices/backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_info "Installing backend dependencies..."
    npm install --production --legacy-peer-deps
fi

print_info "Starting backend on port $BACKEND_PORT..."
pm2 start server.js --name coorg-backend
sleep 3

# Test backend
print_info "Testing backend..."
if curl -s http://localhost:$BACKEND_PORT/api/health 2>/dev/null | grep -q "success"; then
    print_success "Backend is responding on port $BACKEND_PORT"
else
    print_error "Backend not responding - checking logs..."
    pm2 logs coorg-backend --lines 20 --nostream
fi
echo ""

# ============================================
# PHASE 4: CONFIGURE FRONTEND
# ============================================
print_header "PHASE 4: Configure and Build Frontend"
echo ""

cd ~/coorg-spices/frontend

# Create .env with correct backend URL
print_info "Configuring frontend API URL..."
cat > .env << EOF
REACT_APP_API_URL=http://$CURRENT_IP:$BACKEND_PORT/api
EOF
print_success "Frontend configured to use backend on port $BACKEND_PORT"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_info "Installing frontend dependencies..."
    npm install --production --legacy-peer-deps
fi

# Build frontend
print_info "Building frontend (this takes 1-2 minutes)..."
rm -rf build
if npm run build; then
    print_success "Frontend build completed"
else
    print_error "Frontend build failed!"
    exit 1
fi
echo ""

# ============================================
# PHASE 5: START FRONTEND
# ============================================
print_header "PHASE 5: Start Frontend"
echo ""

pm2 serve build 5173 --name coorg-frontend --spa
sleep 2
print_success "Frontend started on port 5173"
echo ""

# ============================================
# PHASE 6: CONFIGURE NGINX
# ============================================
print_header "PHASE 6: Configure Nginx"
echo ""

print_info "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/coorg-spices > /dev/null << EOF
server {
    listen 80;
    server_name $CURRENT_IP $DOMAIN www.$DOMAIN;

    # Frontend
    location / {
        root /home/ubuntu/coorg-spices/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:$BACKEND_PORT;
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
    print_success "Nginx configured and started"
else
    print_error "Nginx configuration error"
    sudo nginx -t
    exit 1
fi
echo ""

# ============================================
# PHASE 7: SAVE PM2 CONFIGURATION
# ============================================
print_header "PHASE 7: Save PM2 Configuration"
echo ""

pm2 save
pm2 startup | grep "sudo" | bash || true
print_success "PM2 configuration saved"
echo ""

# ============================================
# PHASE 8: VERIFY EVERYTHING
# ============================================
print_header "PHASE 8: Verification Tests"
echo ""

print_info "Testing Backend Health:"
if curl -s http://localhost:$BACKEND_PORT/api/health | grep -q "success"; then
    print_success "✓ Backend health check passed"
else
    print_error "✗ Backend health check failed"
fi

print_info "Testing Backend Products:"
PRODUCTS=$(curl -s http://localhost:$BACKEND_PORT/api/products)
if echo "$PRODUCTS" | grep -q "\["; then
    PRODUCT_COUNT=$(echo "$PRODUCTS" | grep -o "\"_id\"" | wc -l)
    print_success "✓ Backend products working - $PRODUCT_COUNT products found"
else
    print_error "✗ Backend products not working"
fi

print_info "Testing Frontend:"
if curl -s http://localhost:5173 | grep -q "root"; then
    print_success "✓ Frontend is serving"
else
    print_error "✗ Frontend not responding"
fi

print_info "Testing Nginx:"
if curl -s http://localhost:80 | grep -q "root"; then
    print_success "✓ Nginx is serving frontend"
else
    print_error "✗ Nginx not responding"
fi

print_info "Testing Nginx API Proxy:"
if curl -s http://localhost:80/api/health | grep -q "success"; then
    print_success "✓ Nginx API proxy working"
else
    print_error "✗ Nginx API proxy not working"
fi
echo ""

# ============================================
# PHASE 9: SETUP HTTPS (OPTIONAL)
# ============================================
print_header "PHASE 9: HTTPS Setup (Optional)"
echo ""

print_info "DNS Configuration:"
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)
if [ "$DOMAIN_IP" = "$CURRENT_IP" ]; then
    print_success "✓ Domain $DOMAIN points to this server"
    echo ""
    read -p "Do you want to setup HTTPS/SSL now? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Installing Certbot..."
        sudo apt-get update -qq
        sudo apt-get install -y certbot python3-certbot-nginx
        
        print_info "Obtaining SSL certificate..."
        sudo certbot --nginx \
            -d $DOMAIN \
            -d www.$DOMAIN \
            --non-interactive \
            --agree-tos \
            --email admin@$DOMAIN \
            --redirect
        
        if [ $? -eq 0 ]; then
            print_success "✓ HTTPS configured successfully!"
            
            # Update frontend for HTTPS
            cd ~/coorg-spices/frontend
            cat > .env << EOF
REACT_APP_API_URL=https://$DOMAIN/api
EOF
            print_info "Rebuilding frontend for HTTPS..."
            npm run build
            pm2 restart coorg-frontend
            pm2 save
            
            print_success "✓ Site now accessible via HTTPS!"
        else
            print_error "✗ HTTPS setup failed - you can run it manually later"
        fi
    else
        print_info "Skipping HTTPS setup - you can run it later with: ./setup-https.sh"
    fi
else
    print_info "Domain $DOMAIN points to $DOMAIN_IP (this server is $CURRENT_IP)"
    print_info "HTTPS setup skipped - fix DNS first"
fi
echo ""

# ============================================
# FINAL STATUS
# ============================================
print_header "Setup Complete! 🎉"
echo ""

echo "Your application is now running:"
echo ""
echo "  🌐 Main Site (via Nginx):"
echo "     http://$CURRENT_IP"
echo "     http://$DOMAIN"
echo "     http://www.$DOMAIN"
echo ""
echo "  🔧 API Endpoints:"
echo "     http://$CURRENT_IP/api/health"
echo "     http://$CURRENT_IP/api/products"
echo "     http://$DOMAIN/api/products"
echo ""
echo "  📱 Direct Access (for debugging):"
echo "     Frontend: http://$CURRENT_IP:5173"
echo "     Backend: http://$CURRENT_IP:$BACKEND_PORT/api"
echo ""

if sudo certbot certificates 2>/dev/null | grep -q "Certificate Name"; then
    echo "  🔒 HTTPS:"
    echo "     https://$DOMAIN"
    echo "     https://www.$DOMAIN"
    echo ""
fi

echo "Configuration:"
echo "  • Backend Port: $BACKEND_PORT"
echo "  • Frontend Port: 5173"
echo "  • Nginx Port: 80"
if sudo certbot certificates 2>/dev/null | grep -q "Certificate Name"; then
    echo "  • HTTPS Port: 443"
fi
echo "  • EC2 IP: $CURRENT_IP"
echo ""

echo "Useful Commands:"
echo "  • View logs: pm2 logs"
echo "  • Check status: pm2 status"
echo "  • Restart all: pm2 restart all"
echo "  • Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "  • Test backend: curl http://localhost:$BACKEND_PORT/api/products"
echo ""

print_info "PM2 Status:"
pm2 status
echo ""

print_success "All done! Your site should now be accessible! 🚀"
echo ""
