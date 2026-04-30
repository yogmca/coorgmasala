#!/bin/bash
# Fix nginx 403 Forbidden error

echo "🔧 Fixing nginx 403 Forbidden error..."

# Check nginx status
echo "📊 Checking nginx status..."
sudo systemctl status nginx --no-pager | head -20

# Check nginx error logs
echo ""
echo "📋 Recent nginx error logs:"
sudo tail -50 /var/log/nginx/error.log

# Check nginx configuration
echo ""
echo "🔍 Checking nginx configuration..."
sudo nginx -t

# Check if nginx is running
if ! sudo systemctl is-active --quiet nginx; then
    echo "⚠️  Nginx is not running! Starting it..."
    sudo systemctl start nginx
fi

# Restart nginx
echo ""
echo "🔄 Restarting nginx..."
sudo systemctl restart nginx

# Check PM2 status
echo ""
echo "📊 PM2 Status:"
pm2 list

# Test local backend
echo ""
echo "🧪 Testing local backend (should return products):"
curl -s http://localhost:5000/api/products | head -20

# Test local frontend
echo ""
echo "🧪 Testing local frontend (should return HTML):"
curl -s http://localhost:5173 | head -20

# Check nginx config for the site
echo ""
echo "📋 Nginx site configuration:"
sudo cat /etc/nginx/sites-enabled/coorgmasala 2>/dev/null || sudo cat /etc/nginx/sites-enabled/default | head -50

echo ""
echo "✅ Done! Try accessing https://coorgmasala.com again"
