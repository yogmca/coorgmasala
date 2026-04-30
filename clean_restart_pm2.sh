#!/bin/bash
# Clean restart of PM2 - removes all duplicates and starts fresh

echo "🧹 Cleaning up PM2 and restarting..."

# Stop and delete all PM2 processes
echo "⏹️  Deleting all PM2 processes..."
pm2 delete all

# Kill any remaining node processes
echo "🔪 Killing all node processes..."
sudo killall -9 node 2>/dev/null || true

# Wait for processes to die
echo "⏳ Waiting for processes to terminate..."
sleep 3

# Verify port 5000 is free
echo "🔍 Checking if port 5000 is free..."
if sudo lsof -i :5000 > /dev/null 2>&1; then
    echo "⚠️  Port 5000 still in use, force killing..."
    sudo kill -9 $(sudo lsof -t -i:5000) 2>/dev/null || true
    sleep 2
fi

# Start backend
echo "🚀 Starting backend..."
cd /home/ubuntu/coorg-spices/backend
pm2 start server.js --name coorg-backend --time

# Wait a moment
sleep 2

# Start frontend
echo "🚀 Starting frontend..."
cd /home/ubuntu/coorg-spices/frontend
pm2 serve build 5173 --name coorg-frontend --spa

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Show status
echo ""
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "📋 Backend logs (last 30 lines):"
pm2 logs coorg-backend --lines 30 --nostream

echo ""
echo "✅ Done! Site should be accessible at: https://coorgmasala.com"
echo ""
echo "If you see 'Token expired at:' in logs instead of crashes, the fix is working!"
