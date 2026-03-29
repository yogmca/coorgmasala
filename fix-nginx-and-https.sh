#!/bin/bash

# Fix Nginx and HTTPS Setup Script
# Run this on EC2 to fix Nginx not running issue

set -e

echo "=========================================="
echo "Fixing Nginx and HTTPS Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${YELLOW}→ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

# Step 1: Start Nginx
print_info "Step 1: Starting Nginx..."
sudo systemctl start nginx
if sudo systemctl is-active --quiet nginx; then
    print_success "Nginx started successfully"
else
    print_error "Failed to start Nginx"
    print_info "Checking Nginx error logs..."
    sudo journalctl -u nginx -n 20 --no-pager
    exit 1
fi

# Step 2: Enable Nginx to start on boot
print_info "Step 2: Enabling Nginx on boot..."
sudo systemctl enable nginx
print_success "Nginx enabled on boot"

# Step 3: Check Nginx status
print_info "Step 3: Checking Nginx status..."
sudo systemctl status nginx --no-pager | head -15

# Step 4: Test Nginx configuration
print_info "Step 4: Testing Nginx configuration..."
sudo nginx -t

# Step 5: Reload Nginx
print_info "Step 5: Reloading Nginx..."
sudo systemctl reload nginx
print_success "Nginx reloaded"

# Step 6: Check if site is accessible
print_info "Step 6: Testing site accessibility..."
if curl -I http://localhost 2>&1 | grep -q "200 OK"; then
    print_success "Site is accessible via HTTP"
else
    print_info "Site may not be accessible yet"
fi

echo ""
echo "=========================================="
echo "Nginx Status"
echo "=========================================="
sudo systemctl status nginx --no-pager | head -10

echo ""
echo "=========================================="
echo "Next Steps for HTTPS"
echo "=========================================="
echo ""
echo "Now that Nginx is running, you can set up HTTPS:"
echo ""
echo "1. Make sure your domain DNS is configured:"
echo "   - coorgmasala.com → 3.26.91.105"
echo "   - www.coorgmasala.com → 3.26.91.105"
echo ""
echo "2. Wait for DNS propagation (check with: dig coorgmasala.com)"
echo ""
echo "3. Run Certbot:"
echo "   sudo certbot --nginx -d coorgmasala.com -d www.coorgmasala.com"
echo ""
echo "4. Or use the automated script:"
echo "   ./setup-https-coorgmasala.sh"
echo ""
