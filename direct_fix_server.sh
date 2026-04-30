#!/bin/bash
# Direct fix - manually copy the correct auth.js to server and restart

echo "🔧 Directly fixing auth.js on server..."

cd /home/ubuntu/coorg-spices

# First, let's see what's actually in the server's auth.js at line 18
echo "📋 Current line 18 in server's auth.js:"
sed -n '18p' backend/middleware/auth.js

# Pull latest from GitHub
echo ""
echo "📥 Pulling latest code from GitHub..."
git fetch origin main
git reset --hard origin/main

# Verify the file is now correct
echo ""
echo "✅ Verifying line 36 (should have 'TokenExpiredError'):"
sed -n '36p' backend/middleware/auth.js

# If line 36 doesn't have TokenExpiredError, manually download it
if ! grep -q "TokenExpiredError" backend/middleware/auth.js; then
    echo "❌ File still not updated! Downloading directly from GitHub..."
    curl -o backend/middleware/auth.js https://raw.githubusercontent.com/yogmca/coorgmasala/main/backend/middleware/auth.js
fi

# Also update auth routes for 30-day token
echo ""
echo "📥 Updating auth routes..."
curl -o backend/routes/auth.js https://raw.githubusercontent.com/yogmca/coorgmasala/main/backend/routes/auth.js

# Now force restart PM2
echo ""
echo "🔄 Force restarting PM2..."
pm2 delete coorg-backend 2>/dev/null || true
pm2 flush

cd backend
pm2 start server.js --name coorg-backend --time
pm2 save

# Wait a moment
sleep 3

echo ""
echo "✅ Done! Checking logs..."
pm2 logs coorg-backend --lines 20 --nostream

echo ""
echo "🌐 Site should be up at: https://coorgmasala.com"
