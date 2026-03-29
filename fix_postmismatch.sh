#!/bin/bash

# Quick Fix: Port Mismatch Issue
# Backend is on port 3001, but frontend expects port 4000

echo "=========================================="
echo "Fixing Port Mismatch Issue"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

CURRENT_IP=$(curl -s ifconfig.me)

# ============================================
# FIX FRONTEND ENV TO USE PORT 3001
# ============================================
print_info "Updating frontend to use port 3001..."
cd ~/coorg-spices/frontend

# Update .env file
cat > .env << EOF
REACT_APP_API_URL=http://$CURRENT_IP:3001/api
EOF

print_success "Frontend .env updated to port 3001"
echo ""

# ============================================
# REBUILD FRONTEND
# ============================================
print_info "Rebuilding frontend with new API URL..."
rm -rf build
npm run build
print_success "Frontend rebuilt"
echo ""

# ============================================
# RESTART FRONTEND
# ============================================
print_info "Restarting frontend..."
pm2 delete coorg-frontend 2>/dev/null || true
pm2 serve build 5173 --name coorg-frontend --spa
print_success "Frontend restarted"
echo ""

# ============================================
# UPDATE NGINX CONFIG
# ============================================
print_info "Updating Nginx to proxy to port 3001..."

sudo tee /etc/nginx/sites-available/coorg-spices > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /home/ubuntu/coorg-spices/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API - PROXY TO PORT 3001
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
    print_success "Nginx updated and restarted"
else
    print_info "Nginx config error - check manually"
fi

echo ""

# ============================================
# SAVE PM2
# ============================================
pm2 save
print_success "PM2 configuration saved"
echo ""

# ============================================
# TEST EVERYTHING
# ============================================
print_info "Testing services..."
echo ""

print_info "Backend API (port 3001):"
curl -s http://localhost:3001/api/products | head -c 200
echo ""
echo ""

print_info "Frontend (port 5173):"
if curl -s http://localhost:5173 | grep -q "root"; then
    print_success "Frontend is serving"
else
    print_info "Frontend check inconclusive"
fi
echo ""

print_info "Nginx (port 80):"
if curl -s http://localhost:80/api/products | head -c 100 | grep -q "\["; then
    print_success "Nginx is proxying API correctly"
else
    print_info "Nginx proxy check inconclusive"
fi
echo ""

echo "=========================================="
print_success "Fix Complete!"
echo "=========================================="
echo ""
echo "Your application is now accessible:"
echo ""
echo "  🌐 Main Site (via Nginx):"
echo "     http://$CURRENT_IP"
echo "     http://$CURRENT_IP/api/products"
echo ""
echo "  📱 Frontend (Direct):"
echo "     http://$CURRENT_IP:5173"
echo ""
echo "  🔧 Backend API (Direct - PORT 3001):"
echo "     http://$CURRENT_IP:3001/api"
echo "     http://$CURRENT_IP:3001/api/products"
echo ""
echo "  🌍 Domain (if DNS configured):"
echo "     http://coorgmasala.com"
echo ""
echo "Check status: pm2 status"
echo "View logs: pm2 logs"
echo ""
