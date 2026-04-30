#!/bin/bash

# Apply JWT Token Expiry Fix - Run this ON the EC2 server
# This script pulls the latest changes from GitHub and restarts services

echo "🔧 Applying JWT Token Expiry Fix on EC2 Server..."
echo ""

# Navigate to project directory
cd /home/ubuntu/coorg-spices

echo "📥 Step 1: Pulling latest changes from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to pull from GitHub"
    exit 1
fi

echo ""
echo "🔄 Step 2: Restarting backend service..."
cd /home/ubuntu/coorg-spices/backend
pm2 restart coorg-backend
pm2 save

echo ""
echo "🏗️ Step 3: Rebuilding frontend..."
cd /home/ubuntu/coorg-spices/frontend
npm run build

echo ""
echo "🔄 Step 4: Restarting frontend service..."
pm2 restart coorg-frontend
pm2 save

echo ""
echo "✅ Fix Applied Successfully!"
echo ""
echo "📋 Service Status:"
pm2 status

echo ""
echo "📋 Recent Backend Logs:"
pm2 logs coorg-backend --lines 15 --nostream

echo ""
echo "🌐 Site should now be working at: https://coorgmasala.com"
echo ""
echo "Changes applied:"
echo "  ✅ JWT tokens now expire after 30 days (was 7 days)"
echo "  ✅ Graceful handling of expired tokens"
echo "  ✅ Clear error messages for users"
echo "  ✅ Auto-logout and redirect on token expiration"
