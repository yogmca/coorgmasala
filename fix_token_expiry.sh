#!/bin/bash

# Fix JWT Token Expiry Issue
# This script updates the backend auth middleware and routes, then restarts the backend

echo "🔧 Fixing JWT Token Expiry Issue..."

# SSH connection details
EC2_USER="ubuntu"
EC2_HOST="13.127.222.61"
KEY_PATH="$HOME/.ssh/coorg-spices-key.pem"

# Check if key exists
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ Error: SSH key not found at $KEY_PATH"
    exit 1
fi

echo "📤 Uploading updated auth middleware..."
scp -i "$KEY_PATH" backend/middleware/auth.js ${EC2_USER}@${EC2_HOST}:/home/ubuntu/coorg-spices/backend/middleware/auth.js

echo "📤 Uploading updated auth routes..."
scp -i "$KEY_PATH" backend/routes/auth.js ${EC2_USER}@${EC2_HOST}:/home/ubuntu/coorg-spices/backend/routes/auth.js

echo "🔄 Restarting backend server..."
ssh -i "$KEY_PATH" ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
cd /home/ubuntu/coorg-spices/backend
pm2 restart coorg-backend
pm2 save
echo "✅ Backend restarted"
ENDSSH

echo ""
echo "✅ JWT Token Expiry Fix Deployed!"
echo ""
echo "Changes made:"
echo "1. ✅ Auth middleware now handles TokenExpiredError gracefully"
echo "2. ✅ Returns clear error messages for expired tokens"
echo "3. ✅ Token expiration extended to 30 days"
echo "4. ✅ Frontend will auto-logout on expired tokens"
echo ""
echo "🔍 Checking backend status..."
ssh -i "$KEY_PATH" ${EC2_USER}@${EC2_HOST} "pm2 status"

echo ""
echo "📋 Recent backend logs:"
ssh -i "$KEY_PATH" ${EC2_USER}@${EC2_HOST} "pm2 logs coorg-backend --lines 20 --nostream"
