#!/bin/bash

# Fix Network Error - Update Frontend API URL
# This script fixes the frontend API URL to use HTTPS domain

set -e

echo "=========================================="
echo "Fixing Network Error - API URL"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${YELLOW}→ $1${NC}"; }

# Step 1: Check current frontend .env
print_info "Step 1: Checking current frontend .env..."
cat ~/coorg-spices/frontend/.env

# Step 2: Update frontend .env with HTTPS domain
print_info "Step 2: Updating frontend .env with HTTPS domain..."
cat > ~/coorg-spices/frontend/.env << 'EOF'
REACT_APP_API_URL=https://coorgmasala.com/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
EOF

print_success "Frontend .env updated"
echo ""
cat ~/coorg-spices/frontend/.env

# Step 3: Rebuild frontend
print_info "Step 3: Rebuilding frontend with new API URL..."
cd ~/coorg-spices/frontend
npm run build

# Step 4: Restart frontend
print_info "Step 4: Restarting frontend..."
pm2 restart coorg-frontend

# Step 5: Test API
print_info "Step 5: Testing API..."
sleep 2
curl -s https://coorgmasala.com/api/products | head -c 200
echo ""

echo ""
echo "=========================================="
echo "✅ Fix Complete!"
echo "=========================================="
echo ""
echo "Frontend .env now uses: https://coorgmasala.com/api"
echo ""
echo "Your site: https://coorgmasala.com"
echo ""
echo "Products should now load correctly!"
echo ""
echo "Clear your browser cache (Ctrl+Shift+Delete) and refresh"
echo ""
