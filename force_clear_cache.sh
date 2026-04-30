#!/bin/bash
# Force clear Node.js require cache by stopping PM2, clearing cache, and restarting

echo "🔧 Force clearing Node.js require cache..."

# Stop PM2 processes
echo "⏹️  Stopping PM2..."
pm2 stop all

# Delete PM2 processes
echo "🗑️  Deleting PM2 processes..."
pm2 delete all

# Kill all node processes to clear memory
echo "🔪 Killing all node processes..."
sudo killall -9 node 2>/dev/null || true

# Clear PM2 logs and cache
echo "🧹 Clearing PM2 logs..."
pm2 flush
rm -rf ~/.pm2/logs/*

# Wait for everything to clear
echo "⏳ Waiting for processes to clear..."
sleep 5

# Verify port 5000 is free
echo "🔍 Verifying port 5000 is free..."
if sudo lsof -i :5000 > /dev/null 2>&1; then
    echo "⚠️  Port still in use, force killing..."
    sudo kill -9 $(sudo lsof -t -i:5000) 2>/dev/null || true
    sleep 2
fi

# Start backend with NODE_ENV to force fresh load
echo "🚀 Starting backend with fresh Node.js instance..."
cd /home/ubuntu/coorg-spices/backend
NODE_ENV=production pm2 start server.js --name coorg-backend --time --no-autorestart

# Wait and check if it started
sleep 3

# Check if backend is running
if pm2 list | grep -q "coorg-backend.*online"; then
    echo "✅ Backend started successfully!"
    
    # Enable autorestart now
    pm2 restart coorg-backend --autorestart
    
    # Start frontend
    echo "🚀 Starting frontend..."
    cd /home/ubuntu/coorg-spices/frontend
    pm2 serve build 5173 --name coorg-frontend --spa
    
    # Save PM2 config
    pm2 save
    
    echo ""
    echo "📊 PM2 Status:"
    pm2 list
    
    echo ""
    echo "📋 Backend logs:"
    pm2 logs coorg-backend --lines 30 --nostream
    
    echo ""
    echo "✅ Done! Check https://coorgmasala.com"
else
    echo "❌ Backend failed to start!"
    pm2 logs coorg-backend --lines 50 --nostream
fi
