#!/bin/bash

# Upload updated React files to EC2 and rebuild
# Run this from your LOCAL machine

EC2_USER="ubuntu"
EC2_HOST="coorgmasala.com"

echo "🚀 Uploading updated files to EC2..."

# Upload frontend files
echo "📤 Uploading AdminPanel.js..."
scp frontend/src/pages/AdminPanel.js ${EC2_USER}@${EC2_HOST}:~/coorg-spices/frontend/src/pages/AdminPanel.js

echo "📤 Uploading Home.js..."
scp frontend/src/pages/Home.js ${EC2_USER}@${EC2_HOST}:~/coorg-spices/frontend/src/pages/Home.js

echo "📤 Uploading AuthContext.js..."
scp frontend/src/context/AuthContext.js ${EC2_USER}@${EC2_HOST}:~/coorg-spices/frontend/src/context/AuthContext.js

# Upload backend files
echo "📤 Uploading products.js..."
scp backend/routes/products.js ${EC2_USER}@${EC2_HOST}:~/coorg-spices/backend/routes/products.js

echo "📤 Uploading package.json..."
scp backend/package.json ${EC2_USER}@${EC2_HOST}:~/coorg-spices/backend/package.json

echo ""
echo "🔧 Rebuilding on EC2..."

ssh ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
set -e

cd ~/coorg-spices

echo "📦 Installing backend dependencies..."
cd backend
npm install multer
pm2 restart coorg-backend

echo "🏗️  Rebuilding frontend..."
cd ../frontend
npm run build
pm2 restart coorg-frontend

echo ""
echo "✅ Deployment complete!"
pm2 status
ENDSSH

echo ""
echo "🎉 Done!"
echo ""
echo "⚠️  IMPORTANT: Clear your browser cache!"
echo "   - Press Ctrl+Shift+R (Windows/Linux)"
echo "   - Press Cmd+Shift+R (Mac)"
echo "   - Or clear cache in browser settings"
echo ""
echo "Then reload: https://coorgmasala.com"
