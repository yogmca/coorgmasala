#!/bin/bash

echo "=== Targeted Fix for 502 Error ==="
echo ""

# Step 1: Fix nginx configs - update both files
echo "Step 1: Updating nginx configurations..."

# Fix coorg-spices config
if [ -f "/etc/nginx/sites-enabled/coorg-spices" ]; then
    echo "Updating /etc/nginx/sites-enabled/coorg-spices..."
    sudo cp /etc/nginx/sites-enabled/coorg-spices /etc/nginx/sites-enabled/coorg-spices.backup.$(date +%Y%m%d_%H%M%S)
    sudo sed -i 's/proxy_pass http:\/\/127\.0\.0\.1:3001/proxy_pass http:\/\/127.0.0.1:5000/g' /etc/nginx/sites-enabled/coorg-spices
    sudo sed -i 's/proxy_pass http:\/\/localhost:3001/proxy_pass http:\/\/localhost:5000/g' /etc/nginx/sites-enabled/coorg-spices
fi

# Fix coorgmasala config
if [ -f "/etc/nginx/sites-enabled/coorgmasala" ]; then
    echo "Updating /etc/nginx/sites-enabled/coorgmasala..."
    sudo cp /etc/nginx/sites-enabled/coorgmasala /etc/nginx/sites-enabled/coorgmasala.backup.$(date +%Y%m%d_%H%M%S)
    sudo sed -i 's/proxy_pass http:\/\/127\.0\.0\.1:3001/proxy_pass http:\/\/127.0.0.1:5000/g' /etc/nginx/sites-enabled/coorgmasala
    sudo sed -i 's/proxy_pass http:\/\/localhost:3001/proxy_pass http:\/\/localhost:5000/g' /etc/nginx/sites-enabled/coorgmasala
fi

echo "Nginx configs updated"
echo ""

# Step 2: Check backend logs to see why it's crashing
echo "Step 2: Checking backend crash logs..."
pm2 logs coorg-backend --lines 30 --nostream
echo ""

# Step 3: Stop the crashing backend
echo "Step 3: Stopping crashing backend..."
pm2 stop coorg-backend
pm2 delete coorg-backend
echo ""

# Step 4: Check backend environment
echo "Step 4: Checking backend .env file..."
cd /home/ubuntu/coorg-spices/backend
if [ -f ".env" ]; then
    echo ".env file exists"
    echo "PORT setting:"
    grep PORT .env || echo "PORT not set in .env"
else
    echo "WARNING: .env file missing!"
    if [ -f ".env.example" ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
    fi
fi
echo ""

# Step 5: Start backend fresh
echo "Step 5: Starting backend on port 5000..."
cd /home/ubuntu/coorg-spices/backend
PORT=5000 pm2 start server.js --name coorg-backend --update-env
sleep 5
pm2 list
echo ""

# Step 6: Check if backend is responding
echo "Step 6: Testing backend on port 5000..."
curl -s http://localhost:5000/api/products | head -c 500
echo ""
echo ""

# Step 7: Reload nginx
echo "Step 7: Testing and reloading nginx..."
sudo nginx -t
sudo systemctl reload nginx
echo ""

# Step 8: Test through nginx
echo "Step 8: Testing through nginx..."
curl -s http://localhost/api/products | head -c 500
echo ""
echo ""

# Step 9: Show backend logs
echo "Step 9: Recent backend logs..."
pm2 logs coorg-backend --lines 20 --nostream
echo ""

echo "=== Fix Complete ==="
echo ""
echo "Backend status:"
pm2 list | grep coorg-backend
echo ""
echo "Test at: https://coorgmasala.com/api/products"
echo ""
echo "If still failing, check:"
echo "  pm2 logs coorg-backend --lines 50"
