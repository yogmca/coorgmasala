#!/bin/bash

echo "=== Fixing 502 Error - Nginx Backend Port Mismatch ==="
echo ""
echo "Issue: Nginx is proxying to port 3001, but backend runs on port 5000"
echo ""

# Step 1: Check current backend status
echo "Step 1: Checking backend status..."
pm2 list
echo ""

# Step 2: Backup nginx config
echo "Step 2: Backing up nginx configuration..."
sudo cp /etc/nginx/sites-enabled/coorgmasala.com /etc/nginx/sites-enabled/coorgmasala.com.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "Backup skipped"
echo ""

# Step 3: Update nginx configuration to use port 5000
echo "Step 3: Updating nginx to proxy to port 5000..."
sudo sed -i 's/proxy_pass http:\/\/127\.0\.0\.1:3001/proxy_pass http:\/\/127.0.0.1:5000/g' /etc/nginx/sites-enabled/coorgmasala.com
sudo sed -i 's/proxy_pass http:\/\/localhost:3001/proxy_pass http:\/\/localhost:5000/g' /etc/nginx/sites-enabled/coorgmasala.com
echo "Configuration updated"
echo ""

# Step 4: Verify configuration
echo "Step 4: Verifying nginx configuration..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✓ Nginx configuration is valid"
else
    echo "✗ Nginx configuration has errors"
    exit 1
fi
echo ""

# Step 5: Reload nginx
echo "Step 5: Reloading nginx..."
sudo systemctl reload nginx
echo "✓ Nginx reloaded"
echo ""

# Step 6: Restart backend to ensure it's running
echo "Step 6: Restarting backend..."
cd /home/ubuntu/coorg-spices/backend
pm2 restart backend
sleep 3
echo ""

# Step 7: Test the endpoint
echo "Step 7: Testing products endpoint..."
echo "Testing locally..."
curl -s http://localhost:5000/api/products | head -c 200
echo ""
echo ""
echo "Testing through nginx..."
curl -s http://localhost/api/products | head -c 200
echo ""
echo ""

echo "=== Fix Complete ==="
echo ""
echo "✓ Nginx configuration updated to proxy to port 5000"
echo "✓ Backend restarted"
echo "✓ Nginx reloaded"
echo ""
echo "Test the products endpoint at:"
echo "  https://coorgmasala.com/api/products"
echo ""
echo "If issues persist, check:"
echo "  pm2 logs backend --lines 50"
echo "  sudo tail -f /var/log/nginx/error.log"
