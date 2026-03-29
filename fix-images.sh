#!/bin/bash

# Fix Product Images Not Loading

echo "=========================================="
echo "Fixing Product Images"
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

# Check if images exist
print_info "Step 1: Checking if images exist..."
if [ -d "/home/ubuntu/coorg-spices/backend/public/images" ]; then
    print_success "Images directory exists"
    ls -lh /home/ubuntu/coorg-spices/backend/public/images/
else
    echo "Images directory missing!"
    mkdir -p /home/ubuntu/coorg-spices/backend/public/images
fi
echo ""

# Check permissions
print_info "Step 2: Fixing permissions..."
sudo chown -R ubuntu:ubuntu /home/ubuntu/coorg-spices/backend/public/images
chmod -R 755 /home/ubuntu/coorg-spices/backend/public/images
print_success "Permissions fixed"
echo ""

# Update Nginx config to serve images correctly
print_info "Step 3: Updating Nginx image configuration..."

# Get current config and update images location
sudo sed -i '/location \/images\//,/}/ c\
    # Static images\
    location /images/ {\
        alias /home/ubuntu/coorg-spices/backend/public/images/;\
        expires 30d;\
        add_header Cache-Control "public, immutable";\
        add_header Access-Control-Allow-Origin "*";\
    }' /etc/nginx/sites-available/coorgmasala

print_success "Nginx config updated"
echo ""

# Test Nginx config
print_info "Step 4: Testing Nginx configuration..."
if sudo nginx -t; then
    print_success "Nginx config is valid"
else
    echo "Nginx config error!"
    exit 1
fi
echo ""

# Reload Nginx
print_info "Step 5: Reloading Nginx..."
sudo systemctl reload nginx
print_success "Nginx reloaded"
echo ""

# Test image access
print_info "Step 6: Testing image access..."
echo ""

# List available images
print_info "Available images:"
ls /home/ubuntu/coorg-spices/backend/public/images/

echo ""
print_info "Testing image URLs:"

# Test a few images
for img in black-pepper.jpg cardamom.jpg turmeric.jpg; do
    if [ -f "/home/ubuntu/coorg-spices/backend/public/images/$img" ]; then
        if curl -sI "http://localhost/images/$img" | grep -q "200"; then
            print_success "✓ /images/$img accessible"
        else
            echo "✗ /images/$img not accessible"
        fi
    fi
done

echo ""
echo "=========================================="
print_success "Image Fix Complete!"
echo "=========================================="
echo ""

echo "Images should now be accessible at:"
echo "  • https://coorgmasala.com/images/black-pepper.jpg"
echo "  • https://coorgmasala.com/images/cardamom.jpg"
echo "  • https://coorgmasala.com/images/turmeric.jpg"
echo ""

print_info "If images still don't show:"
echo "  1. Check browser console for errors (F12)"
echo "  2. Verify image paths in database match filenames"
echo "  3. Clear browser cache (Ctrl+Shift+R)"
echo ""

print_info "Test in browser:"
echo "  https://coorgmasala.com/images/black-pepper.jpg"
echo ""
