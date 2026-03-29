#!/bin/bash

echo "=== Complete Fix: Install Dependencies + Fix Nginx ==="
echo ""

# Step 1: Install missing backend dependencies
echo "Step 1: Installing backend dependencies..."
cd /home/ubuntu/coorg-spices/backend
npm install
echo "Dependencies installed"
echo ""

# Step 2: Update nginx configs to use port 5000
echo "Step 2: Updating nginx configurations..."

if [ -f "/etc/nginx/sites-enabled/coorg-spices" ]; then
    echo "Updating /etc/nginx/sites-enabled/coorg-spices..."
    sudo cp /etc/nginx/sites-enabled/coorg-spices /etc/nginx/sites-enabled/coorg-spices.backup.$(date +%Y%m%d_%H%M%S)
    sudo sed -i 's/proxy_pass http:\/\/127\.0\.0\.1:3001/proxy_pass http:\/\/127.0.0.1:5000/g' /etc/nginx/sites-enabled/coorg-spices
    sudo sed -i 's/proxy_pass http:\/\/localhost:3001/proxy_pass http:\/\/localhost:5000/g' /etc/nginx/sites-enabled/coorg-spices
fi

if [ -f "/etc/nginx/sites-enabled/coorgmasala" ]; then
    echo "Updating /etc/nginx/sites-enabled/coorgmasala..."
    sudo cp /etc/nginx/sites-enabled/coorgmasala /etc/nginx/sites-enabled/coorgmasala.backup.$(date +%Y%m%d_%H%M%S)
    sudo sed -i 's/proxy_pass http:\/\/127\.0\.0\.1:3001/proxy_pass http:\/\/127.0.0.1:5000/g' /etc/nginx/sites-enabled/coorgmasala
    sudo sed -i 's/proxy_pass http:\/\/localhost:3001/proxy_pass http:\/\/localhost:5000/g' /etc/nginx/sites-enabled/coorgmasala
fi

echo "Nginx configs updated"
echo ""

# Step 3: Restart backend
echo "Step 3: Restarting backend..."
pm2 restart coorg-backend
sleep 5
pm2 list
echo ""

# Step 4: Check backend logs
echo "Step 4: Checking backend logs..."
pm2 logs coorg-backend --lines 20 --nostream
echo ""

# Step 5: Test backend directly
echo "Step 5: Testing backend on port 5000..."
curl -s http://localhost:5000/api/products | head -c 500
echo ""
echo ""

# Step 6: Reload nginx
echo "Step 6: Reloading nginx..."
sudo nginx -t
sudo systemctl reload nginx
echo ""

# Step 7: Test through nginx
echo "Step 7: Testing through nginx..."
curl -s http://localhost/api/products | head -c 500
echo ""
echo ""

echo "=== Fix Complete ==="
echo ""
echo "✓ Backend dependencies installed"
echo "✓ Nginx updated to proxy to port 5000"
echo "✓ Backend restarted"
echo "✓ Nginx reloaded"
echo ""
echo "Test at: https://coorgmasala.com/api/products"
echo ""
echo "Backend status:"
pm2 list | grep coorg-backend
