#!/bin/bash

# Emergency Fix: Remove ALL port 3000 references

echo "=========================================="
echo "Emergency Nginx Fix - Remove Port 3000"
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

# Find all files with port 3000
print_info "Finding all Nginx configs with port 3000..."
sudo grep -r "3000" /etc/nginx/ || echo "No files found"
echo ""

# Remove ALL Nginx site configs
print_info "Removing ALL Nginx site configurations..."
sudo rm -f /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/sites-available/coorg*
sudo rm -f /etc/nginx/sites-available/default
print_success "Old configs removed"
echo ""

# Create fresh config
print_info "Creating fresh Nginx configuration..."
sudo tee /etc/nginx/sites-available/coorgmasala > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name coorgmasala.com www.coorgmasala.com api.coorgmasala.com 3.27.42.171;
    
    root /home/ubuntu/coorg-spices/frontend/build;
    index index.html;
    
    # Frontend - React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Images
    location /images/ {
        alias /home/ubuntu/coorg-spices/backend/public/images/;
    }
}
EOF
print_success "Fresh config created"
echo ""

# Enable config
print_info "Enabling configuration..."
sudo ln -s /etc/nginx/sites-available/coorgmasala /etc/nginx/sites-enabled/
print_success "Config enabled"
echo ""

# Test config
print_info "Testing Nginx configuration..."
if sudo nginx -t; then
    print_success "Config is valid"
else
    echo "Config has errors!"
    exit 1
fi
echo ""

# Restart Nginx
print_info "Restarting Nginx..."
sudo systemctl restart nginx
sleep 2
print_success "Nginx restarted"
echo ""

# Verify
print_info "Testing services..."
echo ""

if curl -s http://localhost/api/health | grep -q "success"; then
    print_success "✓ API working"
else
    echo "✗ API not working"
fi

if curl -s http://localhost/ | grep -q "root"; then
    print_success "✓ Frontend working"
else
    echo "✗ Frontend not working"
fi

echo ""
echo "=========================================="
print_success "Fix Complete!"
echo "=========================================="
echo ""
echo "Test your site:"
echo "  http://coorgmasala.com"
echo "  http://coorgmasala.com/api/products"
echo ""
echo "Check for errors:"
echo "  sudo tail -f /var/log/nginx/error.log"
echo ""
