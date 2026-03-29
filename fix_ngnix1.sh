#!/bin/bash

# Quick Fix: Nginx is pointing to wrong port (3000 instead of 5173)

echo "=========================================="
echo "Fixing Nginx Port Configuration"
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

# The problem: Nginx is trying to connect to port 3000
# But frontend is on port 5173 and backend is on port 3001

print_info "Creating correct Nginx configuration..."

# Create the correct config
sudo tee /etc/nginx/sites-available/coorg-spices > /dev/null << 'EOF'
server {
    listen 80;
    server_name coorgmasala.com www.coorgmasala.com 3.27.42.171;

    # Frontend - serve static files from build directory
    location / {
        root /home/ubuntu/coorg-spices/frontend/build;
        index index.html;
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
    }
}
EOF

print_success "Nginx configuration created"
echo ""

# Enable the site
print_info "Enabling site..."
sudo ln -sf /etc/nginx/sites-available/coorg-spices /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
print_info "Testing Nginx configuration..."
if sudo nginx -t; then
    print_success "Nginx configuration is valid"
else
    echo "Nginx configuration error!"
    exit 1
fi
echo ""

# Reload Nginx
print_info "Reloading Nginx..."
sudo systemctl reload nginx
print_success "Nginx reloaded"
echo ""

# Test everything
print_info "Testing services..."
echo ""

print_info "Backend (port 3001):"
if curl -s http://localhost:3001/api/health | grep -q "success"; then
    print_success "✓ Backend responding"
else
    echo "✗ Backend not responding"
fi

print_info "Frontend build exists:"
if [ -d "/home/ubuntu/coorg-spices/frontend/build" ]; then
    print_success "✓ Frontend build directory exists"
    ls -lh /home/ubuntu/coorg-spices/frontend/build/index.html
else
    echo "✗ Frontend build directory missing!"
fi

print_info "Nginx serving frontend:"
if curl -s http://localhost/ | grep -q "root"; then
    print_success "✓ Nginx serving frontend"
else
    echo "✗ Nginx not serving frontend"
fi

print_info "Nginx proxying API:"
if curl -s http://localhost/api/health | grep -q "success"; then
    print_success "✓ Nginx API proxy working"
else
    echo "✗ Nginx API proxy not working"
fi

echo ""
echo "=========================================="
print_success "Fix Complete!"
echo "=========================================="
echo ""

echo "Your site should now work at:"
echo "  • http://coorgmasala.com"
echo "  • http://www.coorgmasala.com"
echo "  • http://3.27.42.171"
echo ""

echo "Test the API:"
echo "  • http://coorgmasala.com/api/health"
echo "  • http://coorgmasala.com/api/products"
echo ""

print_info "Note: Frontend is served from build directory (not port 5173)"
print_info "Port 5173 is only for PM2 serve process (not used by Nginx)"
echo ""
