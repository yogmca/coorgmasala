#!/bin/bash

# Deploy JWT Token Expiry Fix
# This script updates both backend and frontend, then restarts services

echo "🔧 Deploying JWT Token Expiry Fix..."

# SSH connection details
EC2_USER="ubuntu"
EC2_HOST="13.127.222.61"
KEY_PATH="$HOME/.ssh/coorg-spices-key.pem"

# Check if key exists
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ Error: SSH key not found at $KEY_PATH"
    exit 1
fi

echo ""
echo "📤 Step 1: Uploading backend fixes..."
scp -i "$KEY_PATH" backend/middleware/auth.js ${EC2_USER}@${EC2_HOST}:/home/ubuntu/coorg-spices/backend/middleware/auth.js
scp -i "$KEY_PATH" backend/routes/auth.js ${EC2_USER}@${EC2_HOST}:/home/ubuntu/coorg-spices/backend/routes/auth.js

echo ""
echo "📤 Step 2: Uploading frontend fixes..."
scp -i "$KEY_PATH" frontend/src/services/api.js ${EC2_USER}@${EC2_HOST}:/home/ubuntu/coorg-spices/frontend/src/services/api.js
scp -i "$KEY_PATH" frontend/src/context/AuthContext.js ${EC2_USER}@${EC2_HOST}:/home/ubuntu/coorg-spices/frontend/src/context/AuthContext.js

echo ""
echo "🔄 Step 3: Restarting backend..."
ssh -i "$KEY_PATH" ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
cd /home/ubuntu/coorg-spices/backend
pm2 restart coorg-backend
pm2 save
echo "✅ Backend restarted"
ENDSSH

echo ""
echo "🏗️ Step 4: Rebuilding and restarting frontend..."
ssh -i "$KEY_PATH" ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
cd /home/ubuntu/coorg-spices/frontend
npm run build
pm2 restart coorg-frontend
pm2 save
echo "✅ Frontend rebuilt and restarted"
ENDSSH

echo ""
echo "✅ JWT Token Expiry Fix Deployed Successfully!"
echo ""
echo "📋 Changes deployed:"
echo "  Backend:"
echo "    ✅ Auth middleware handles TokenExpiredError gracefully"
echo "    ✅ Clear error messages for expired/invalid tokens"
echo "    ✅ Token expiration extended from 7 to 30 days"
echo ""
echo "  Frontend:"
echo "    ✅ API interceptor auto-detects expired tokens"
echo "    ✅ Auto-logout and redirect to login on expiry"
echo "    ✅ Better error handling in AuthContext"
echo ""
echo "🔍 Checking service status..."
ssh -i "$KEY_PATH" ${EC2_USER}@${EC2_HOST} "pm2 status"

echo ""
echo "📋 Recent logs:"
echo ""
echo "Backend logs:"
ssh -i "$KEY_PATH" ${EC2_USER}@${EC2_HOST} "pm2 logs coorg-backend --lines 10 --nostream"
echo ""
echo "Frontend logs:"
ssh -i "$KEY_PATH" ${EC2_USER}@${EC2_HOST} "pm2 logs coorg-frontend --lines 10 --nostream"

echo ""
echo "🌐 Site should be accessible at: https://coorgmasala.com"
