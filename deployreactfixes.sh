#!/bin/bash

# Deploy React flickering fixes to EC2
# This script uploads the fixed React files and rebuilds the frontend

echo "🚀 Deploying React flickering fixes to EC2..."

# Replace with your EC2 details
EC2_USER="ubuntu"
EC2_HOST="coorgmasala.com"  # or your EC2 IP address
EC2_PATH="~/coorg-spices"

# Files to upload
FILES=(
  "frontend/src/pages/AdminPanel.js"
  "frontend/src/pages/Home.js"
  "frontend/src/context/AuthContext.js"
  "backend/routes/products.js"
  "backend/package.json"
)

echo "📤 Uploading fixed files to EC2..."
for file in "${FILES[@]}"; do
  echo "  Uploading $file..."
  scp "$file" "${EC2_USER}@${EC2_HOST}:${EC2_PATH}/$file"
done

echo ""
echo "🔧 Running deployment commands on EC2..."
ssh "${EC2_USER}@${EC2_HOST}" << 'ENDSSH'
cd ~/coorg-spices

echo "📦 Installing backend dependencies..."
cd backend
npm install multer
pm2 restart coorg-backend

echo "🏗️  Rebuilding frontend..."
cd ../frontend
npm run build

echo "🔄 Restarting frontend..."
pm2 restart coorg-frontend

echo "✅ Deployment complete!"
pm2 status
ENDSSH

echo ""
echo "✅ All fixes deployed!"
echo ""
echo "🧹 Clear your browser cache (Ctrl+Shift+R) and reload the website"
echo "   The flickering should be gone and images should display correctly"
