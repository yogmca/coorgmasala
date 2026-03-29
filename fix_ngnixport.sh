#!/bin/bash

echo "=== Fixing Nginx Backend Port Configuration ==="
echo ""

# The issue: nginx is proxying to port 3001, but backend runs on port 5000
echo "Problem identified: Nginx is configured to proxy to port 3001"
echo "But the backend is running on port 5000"
echo ""

# Check current backend port
echo "1. Checking which port backend is running on..."
pm2 list
sudo netstat -tlnp | grep node || sudo ss -tlnp | grep node
echo ""

# Backup current nginx config
echo "2. Backing up nginx configuration..."
sudo cp /etc/nginx/sites-enabled/coorgmasala.com /etc/nginx/sites-enabled/coorgmasala.com.backup.$(date +%Y%m%d_%H%M%S)
echo "Backup created"
echo ""

# Fix the nginx configuration - change port 3001 to 5000
echo "3. Updating nginx configuration to use port 5000..."
sudo sed -i 's/127\.0\.0\.1:3001/127.0.0.1:5000/g' /etc/nginx/sites-enabled/coorgmasala.com
sudo sed -i 's/localhost:3001/localhost:5000/g' /etc/nginx/sites-enabled/coorgmasala.com
echo "Configuration updated"
echo ""

# Show the changes
echo "4. Verifying the updated configuration..."
echo "API proxy configuration:"
sudo grep -A 5 "location /api" /etc/nginx/sites-enabled/coorgmasala.com
echo ""

# Test nginx configuration
echo "5. Testing nginx configuration..."
sudo nginx -t
echo ""

# Reload nginx
echo "6. Reloading nginx..."
sudo systemctl reload nginx
echo "Nginx reloaded"
echo ""

# Wait a moment
sleep 2

# Test the endpoint
echo "7. Testing products endpoint..."
curl -s http://localhost/api/products | head -20
echo ""

echo "=== Fix Complete ==="
echo ""
echo "The nginx configuration has been updated to proxy to port 5000"
echo "Please test the products endpoint:"
echo "  https://coorgmasala.com/api/products"
echo ""
echo "If you still see issues, check:"
echo "  1. Backend is running: pm2 list"
echo "  2. Backend logs: pm2 logs backend"
echo "  3. Nginx error logs: sudo tail -f /var/log/nginx/error.log"
