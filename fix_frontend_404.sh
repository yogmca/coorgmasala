#!/bin/bash
# Fix frontend 404 - rebuild and restart

echo "🔧 Fixing frontend 404 error..."

# Check if build directory exists
echo "🔍 Checking frontend build directory..."
if [ -d "/home/ubuntu/coorg-spices/frontend/build" ]; then
    echo "✅ Build directory exists"
    ls -la /home/ubuntu/coorg-spices/frontend/build | head -10
else
    echo "❌ Build directory missing!"
fi

# Check if index.html exists
if [ -f "/home/ubuntu/coorg-spices/frontend/build/index.html" ]; then
    echo "✅ index.html exists"
else
    echo "❌ index.html missing! Need to rebuild..."
fi

# Rebuild frontend
echo ""
echo "🏗️  Rebuilding frontend..."
cd /home/ubuntu/coorg-spices/frontend
npm run build

# Check build was successful
if [ -f "/home/ubuntu/coorg-spices/frontend/build/index.html" ]; then
    echo "✅ Build successful!"
    
    # Restart frontend PM2
    echo ""
    echo "🔄 Restarting frontend..."
    pm2 delete coorg-frontend 2>/dev/null || true
    pm2 serve build 5173 --name coorg-frontend --spa
    pm2 save
    
    # Wait a moment
    sleep 2
    
    # Test frontend
    echo ""
    echo "🧪 Testing frontend..."
    curl -s http://localhost:5173 | head -20
    
    # Restart nginx
    echo ""
    echo "🔄 Restarting nginx..."
    sudo systemctl restart nginx
    
    echo ""
    echo "📊 PM2 Status:"
    pm2 list
    
    echo ""
    echo "✅ Done! Try https://coorgmasala.com"
else
    echo "❌ Build failed! Check errors above"
fi
