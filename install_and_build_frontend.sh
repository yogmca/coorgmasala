#!/bin/bash
# Install missing dependencies and rebuild frontend

echo "📦 Installing missing frontend dependencies..."

cd /home/ubuntu/coorg-spices/frontend

# Install missing dependencies
echo "Installing missing dependencies..."
npm install react-helmet-async jwt-decode

# Install all dependencies to be safe
echo "Installing all dependencies..."
npm install

# Build frontend
echo ""
echo "🏗️  Building frontend..."
npm run build

# Check if build was successful
if [ -f "/home/ubuntu/coorg-spices/frontend/build/index.html" ]; then
    echo ""
    echo "✅ Build successful!"
    
    # Restart frontend PM2
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
    echo "✅ Done! Site should be live at https://coorgmasala.com"
else
    echo ""
    echo "❌ Build failed! Check errors above"
    exit 1
fi
