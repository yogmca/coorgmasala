#!/bin/bash

echo "=== Comprehensive 502 Fix - Finding and Fixing All Issues ==="
echo ""

# Step 1: Find the actual nginx configuration file
echo "Step 1: Locating nginx configuration files..."
echo "Enabled sites:"
ls -la /etc/nginx/sites-enabled/
echo ""
echo "Available sites:"
ls -la /etc/nginx/sites-available/
echo ""

# Step 2: Check if backend is running
echo "Step 2: Checking backend status..."
pm2 list
echo ""

# Step 3: Check what's listening on ports
echo "Step 3: Checking what's running on ports 3001 and 5000..."
sudo netstat -tlnp | grep -E ':(3001|5000)' || sudo ss -tlnp | grep -E ':(3001|5000)'
echo ""

# Step 4: Find and fix the correct nginx config
echo "Step 4: Finding and updating nginx configuration..."
NGINX_CONFIG=""

# Check common locations
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    NGINX_CONFIG="/etc/nginx/sites-enabled/default"
    echo "Found config: $NGINX_CONFIG"
elif [ -f "/etc/nginx/sites-enabled/coorgmasala.com" ]; then
    NGINX_CONFIG="/etc/nginx/sites-enabled/coorgmasala.com"
    echo "Found config: $NGINX_CONFIG"
elif [ -f "/etc/nginx/conf.d/default.conf" ]; then
    NGINX_CONFIG="/etc/nginx/conf.d/default.conf"
    echo "Found config: $NGINX_CONFIG"
fi

if [ -n "$NGINX_CONFIG" ]; then
    echo "Backing up: $NGINX_CONFIG"
    sudo cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    
    echo "Updating port 3001 to 5000..."
    sudo sed -i 's/proxy_pass http:\/\/127\.0\.0\.1:3001/proxy_pass http:\/\/127.0.0.1:5000/g' "$NGINX_CONFIG"
    sudo sed -i 's/proxy_pass http:\/\/localhost:3001/proxy_pass http:\/\/localhost:5000/g' "$NGINX_CONFIG"
    
    echo "Current proxy configuration:"
    sudo grep -A 3 "proxy_pass" "$NGINX_CONFIG" | head -20
else
    echo "ERROR: Could not find nginx configuration file"
fi
echo ""

# Step 5: Start the backend if it's not running
echo "Step 5: Starting backend..."
cd /home/ubuntu/coorg-spices/backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "Created .env file. You may need to update it with correct values."
    fi
fi

# Start or restart backend
if pm2 list | grep -q "backend"; then
    echo "Restarting existing backend process..."
    pm2 restart backend
else
    echo "Starting new backend process..."
    pm2 start server.js --name backend
fi

sleep 3
pm2 list
echo ""

# Step 6: Test nginx configuration
echo "Step 6: Testing nginx configuration..."
sudo nginx -t
echo ""

# Step 7: Reload nginx
echo "Step 7: Reloading nginx..."
sudo systemctl reload nginx
echo ""

# Step 8: Wait and test
echo "Step 8: Testing endpoints..."
sleep 2

echo "Testing backend directly on port 5000:"
curl -s http://localhost:5000/api/products | head -c 300
echo ""
echo ""

echo "Testing through nginx:"
curl -s http://localhost/api/products | head -c 300
echo ""
echo ""

# Step 9: Show backend logs
echo "Step 9: Recent backend logs..."
pm2 logs backend --lines 20 --nostream
echo ""

echo "=== Diagnostic and Fix Complete ==="
echo ""
echo "Summary:"
echo "1. Nginx config location: $NGINX_CONFIG"
echo "2. Backend status: $(pm2 list | grep backend || echo 'Not running')"
echo "3. Test URL: https://coorgmasala.com/api/products"
echo ""
echo "If still not working, check:"
echo "  - Backend logs: pm2 logs backend"
echo "  - Nginx errors: sudo tail -f /var/log/nginx/error.log"
echo "  - Backend .env file: cat /home/ubuntu/coorg-spices/backend/.env"
