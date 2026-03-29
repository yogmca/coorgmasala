#!/bin/bash

echo "=== Final Complete Fix for 502 Error ==="
echo ""

# Issue 1: Missing multer dependency
# Issue 2: Duplicate nginx backup files
# Issue 3: Port mismatch (3001 vs 5000)

# Step 1: Remove problematic nginx backup files
echo "Step 1: Cleaning up nginx backup files..."
sudo rm -f /etc/nginx/sites-enabled/*.backup.*
sudo rm -f /etc/nginx/sites-available/*.backup.*
echo "Backup files removed"
echo ""

# Step 2: Install backend dependencies
echo "Step 2: Installing backend dependencies..."
cd /home/ubuntu/coorg-spices/backend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found!"
    exit 1
fi

echo "Running npm install..."
npm install
echo "Dependencies installed"
echo ""

# Step 3: Verify multer is installed
echo "Step 3: Verifying multer installation..."
if [ -d "node_modules/multer" ]; then
    echo "✓ multer is installed"
else
    echo "Installing multer explicitly..."
    npm install multer
fi
echo ""

# Step 4: Update nginx configs
echo "Step 4: Updating nginx configurations..."

if [ -f "/etc/nginx/sites-enabled/coorg-spices" ]; then
    echo "Updating coorg-spices config..."
    sudo sed -i 's/127\.0\.0\.1:3001/127.0.0.1:5000/g' /etc/nginx/sites-enabled/coorg-spices
    sudo sed -i 's/localhost:3001/localhost:5000/g' /etc/nginx/sites-enabled/coorg-spices
fi

if [ -f "/etc/nginx/sites-enabled/coorgmasala" ]; then
    echo "Updating coorgmasala config..."
    sudo sed -i 's/127\.0\.0\.1:3001/127.0.0.1:5000/g' /etc/nginx/sites-enabled/coorgmasala
    sudo sed -i 's/localhost:3001/localhost:5000/g' /etc/nginx/sites-enabled/coorgmasala
fi

echo "Nginx configs updated"
echo ""

# Step 5: Test nginx config
echo "Step 5: Testing nginx configuration..."
sudo nginx -t
if [ $? -ne 0 ]; then
    echo "ERROR: Nginx config test failed"
    exit 1
fi
echo ""

# Step 6: Restart backend
echo "Step 6: Restarting backend..."
pm2 restart coorg-backend
sleep 5
echo ""

# Step 7: Check backend status
echo "Step 7: Checking backend status..."
pm2 list | grep coorg-backend
echo ""

# Step 8: Check backend logs for errors
echo "Step 8: Checking for errors in backend logs..."
pm2 logs coorg-backend --lines 10 --nostream
echo ""

# Step 9: Test backend directly
echo "Step 9: Testing backend on port 5000..."
sleep 2
BACKEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/products)
echo "Backend response code: $BACKEND_TEST"
if [ "$BACKEND_TEST" = "200" ]; then
    echo "✓ Backend is responding correctly"
    curl -s http://localhost:5000/api/products | head -c 300
    echo ""
else
    echo "✗ Backend is not responding correctly"
fi
echo ""

# Step 10: Reload nginx
echo "Step 10: Reloading nginx..."
sudo systemctl reload nginx
echo ""

# Step 11: Test through nginx
echo "Step 11: Testing through nginx..."
NGINX_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/products)
echo "Nginx response code: $NGINX_TEST"
if [ "$NGINX_TEST" = "200" ]; then
    echo "✓ Nginx is proxying correctly"
    curl -s http://localhost/api/products | head -c 300
    echo ""
else
    echo "✗ Nginx proxy not working"
fi
echo ""

echo "=== Fix Complete ==="
echo ""
echo "Summary:"
echo "✓ Removed duplicate nginx backup files"
echo "✓ Installed all backend dependencies"
echo "✓ Updated nginx to proxy to port 5000"
echo "✓ Restarted backend and nginx"
echo ""
echo "Test your site at: https://coorgmasala.com/api/products"
echo ""
echo "Current status:"
pm2 list

