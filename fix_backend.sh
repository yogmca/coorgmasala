#!/bin/bash

# Complete Fix: Backend, Frontend, Database, and Nginx
# This fixes the "Loading products..." issue

echo "=========================================="
echo "Complete Application Fix"
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

# Get current IP
CURRENT_IP=$(curl -s ifconfig.me)
print_info "Current EC2 IP: $CURRENT_IP"
echo ""

# ============================================
# STEP 1: FIX PM2
# ============================================
print_info "Step 1: Cleaning PM2..."
pm2 kill
rm -f ~/.pm2/dump.pm2
pkill -f node || true
print_success "PM2 cleaned"
echo ""

# ============================================
# STEP 2: CHECK/UPDATE BACKEND ENV
# ============================================
print_info "Step 2: Checking Backend Configuration..."
cd ~/coorg-spices/backend

if [ ! -f ".env" ]; then
    print_error "Backend .env file not found!"
    print_info "Creating .env file..."
    cat > .env << EOF
PORT=4000
MONGODB_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/coorg-spices
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF
    print_info "Please update MONGODB_URI in ~/coorg-spices/backend/.env"
else
    print_success "Backend .env exists"
fi

# Check if MongoDB URI is set
if grep -q "your_user:your_password" .env 2>/dev/null; then
    print_error "MongoDB URI not configured!"
    print_info "Please update MONGODB_URI in ~/coorg-spices/backend/.env"
fi

echo ""

# ============================================
# STEP 3: CHECK/UPDATE FRONTEND ENV
# ============================================
print_info "Step 3: Checking Frontend Configuration..."
cd ~/coorg-spices/frontend

if [ ! -f ".env" ]; then
    print_error "Frontend .env file not found!"
    print_info "Creating .env file..."
    cat > .env << EOF
REACT_APP_API_URL=http://$CURRENT_IP:4000/api
EOF
    print_success "Frontend .env created with current IP"
else
    # Update API URL with current IP
    if grep -q "REACT_APP_API_URL" .env; then
        sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=http://$CURRENT_IP:4000/api|" .env
        print_success "Frontend .env updated with current IP"
    else
        echo "REACT_APP_API_URL=http://$CURRENT_IP:4000/api" >> .env
        print_success "API URL added to frontend .env"
    fi
fi

echo ""

# ============================================
# STEP 4: SEED DATABASE (IF NEEDED)
# ============================================
print_info "Step 4: Checking Database..."
cd ~/coorg-spices/backend

if [ -f "seed.js" ]; then
    print_info "Seeding database with products..."
    if node seed.js 2>&1 | grep -q "success\|completed\|seeded"; then
        print_success "Database seeded successfully"
    else
        print_info "Database seed attempted (check if MongoDB is configured)"
    fi
else
    print_info "No seed.js file found - skipping database seed"
fi

echo ""

# ============================================
# STEP 5: START BACKEND
# ============================================
print_info "Step 5: Starting Backend..."
cd ~/coorg-spices/backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_info "Installing backend dependencies..."
    npm install --production
fi

pm2 start server.js --name coorg-backend
sleep 2
print_success "Backend started"

# Test backend
print_info "Testing backend API..."
sleep 3
if curl -s http://localhost:4000/api/products | grep -q "\["; then
    print_success "Backend API is responding with data"
else
    print_error "Backend API not responding correctly"
    print_info "Checking backend logs..."
    pm2 logs coorg-backend --lines 20 --nostream
fi

echo ""

# ============================================
# STEP 6: BUILD AND START FRONTEND
# ============================================
print_info "Step 6: Building Frontend..."
cd ~/coorg-spices/frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_info "Installing frontend dependencies..."
    npm install --production
fi

# Clean old build
rm -rf build

# Build with current env
print_info "Building React app (this takes 1-2 minutes)..."
if npm run build; then
    print_success "Frontend build completed"
else
    print_error "Frontend build failed"
    exit 1
fi

# Start frontend
pm2 serve build 5173 --name coorg-frontend --spa
sleep 2
print_success "Frontend started"

echo ""

# ============================================
# STEP 7: CONFIGURE NGINX
# ============================================
print_info "Step 7: Configuring Nginx..."

# Create nginx config
sudo tee /etc/nginx/sites-available/coorg-spices > /dev/null << EOF
server {
    listen 80;
    server_name $CURRENT_IP coorgmasala.com www.coorgmasala.com;

    # Frontend
    location / {
        root /home/ubuntu/coorg-spices/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
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

# Enable site
sudo ln -sf /etc/nginx/sites-available/coorg-spices /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
if sudo nginx -t 2>&1 | grep -q "successful"; then
    sudo systemctl restart nginx
    print_success "Nginx configured and restarted"
else
    print_error "Nginx configuration error"
    sudo nginx -t
fi

echo ""

# ============================================
# STEP 8: SAVE PM2 CONFIG
# ============================================
print_info "Step 8: Saving PM2 configuration..."
pm2 save
pm2 startup | grep "sudo" | bash || true
print_success "PM2 configuration saved"

echo ""

# ============================================
# STEP 9: VERIFY EVERYTHING
# ============================================
print_info "Step 9: Verifying All Services..."
echo ""

print_info "PM2 Status:"
pm2 status
echo ""

print_info "Listening Ports:"
sudo ss -tlnp | grep -E ':(80|4000|5173)' | awk '{print $4}' | sort -u
echo ""

print_info "Testing Backend API (products):"
BACKEND_TEST=$(curl -s http://localhost:4000/api/products)
if echo "$BACKEND_TEST" | grep -q "\["; then
    PRODUCT_COUNT=$(echo "$BACKEND_TEST" | grep -o "\"_id\"" | wc -l)
    print_success "Backend API working - $PRODUCT_COUNT products found"
else
    print_error "Backend API not returning products"
    echo "Response: $BACKEND_TEST"
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

# ============================================
# FINAL STATUS
# ============================================
echo "=========================================="
print_success "Setup Complete!"
echo "=========================================="
echo ""
echo "Your application is now accessible at:"
echo ""
echo "  🌐 Via Nginx (Production):"
echo "     http://$CURRENT_IP"
echo "     http://$CURRENT_IP/api/products"
echo ""
echo "  📱 Frontend (Direct):"
echo "     http://$CURRENT_IP:5173"
echo ""
echo "  🔧 Backend API (Direct):"
echo "     http://$CURRENT_IP:4000/api"
echo "     http://$CURRENT_IP:4000/api/products"
echo ""
echo "  🌍 Domain (if DNS configured):"
echo "     http://coorgmasala.com"
echo ""
echo "Important Configuration Files:"
echo "  • Backend env: ~/coorg-spices/backend/.env"
echo "  • Frontend env: ~/coorg-spices/frontend/.env"
echo "  • Nginx config: /etc/nginx/sites-available/coorg-spices"
echo ""
echo "Useful Commands:"
echo "  • View logs: pm2 logs"
echo "  • Restart all: pm2 restart all"
echo "  • Check status: pm2 status"
echo "  • Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo ""

# Show backend logs if there were issues
if ! echo "$BACKEND_TEST" | grep -q "\["; then
    print_error "Backend API Issues Detected!"
    echo ""
    print_info "Backend Logs (last 30 lines):"
    pm2 logs coorg-backend --lines 30 --nostream
    echo ""
    print_info "Check MongoDB connection in ~/coorg-spices/backend/.env"
fi
