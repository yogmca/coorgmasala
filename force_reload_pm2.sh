#!/bin/bash
# Force PM2 to reload the updated code by clearing Node.js require cache

echo "🔧 Force reloading PM2 with updated code..."

cd /home/ubuntu/coorg-spices/backend

# Stop PM2
echo "⏹️  Stopping PM2..."
pm2 stop coorg-backend
pm2 delete coorg-backend

# Clear PM2 logs
echo "🗑️  Clearing old logs..."
pm2 flush

# Verify the updated file exists
echo "✅ Verifying updated auth.js..."
if grep -q "TokenExpiredError" middleware/auth.js; then
    echo "✅ Updated code found in auth.js"
else
    echo "❌ ERROR: auth.js doesn't have the fix!"
    exit 1
fi

# Start fresh with explicit path
echo "🚀 Starting backend with fresh PM2 instance..."
pm2 start /home/ubuntu/coorg-spices/backend/server.js \
    --name coorg-backend \
    --cwd /home/ubuntu/coorg-spices/backend \
    --node-args="--max-old-space-size=2048" \
    --time

# Save PM2 config
pm2 save

# Wait a moment
sleep 3

# Show status
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 Recent logs (should show new error handling):"
pm2 logs coorg-backend --lines 30 --nostream

echo ""
echo "✅ Done! Check if site is up: https://coorgmasala.com"
