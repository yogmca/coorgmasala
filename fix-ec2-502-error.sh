#!/bin/bash

# Fix EC2 502 Error and Deploy Webhook Integration
# Run this script on EC2 server

echo "=========================================="
echo "Fixing 502 Error on EC2"
echo "=========================================="

# Navigate to project directory
cd /home/ubuntu/coorgmasala || exit 1

echo ""
echo "Step 1: Stopping all PM2 processes..."
pm2 stop all

echo ""
echo "Step 2: Killing any processes on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No process on port 3001"

echo ""
echo "Step 3: Pulling latest code..."
git pull origin coorgmasala_prod

echo ""
echo "Step 4: Installing backend dependencies..."
cd backend
npm install

echo ""
echo "Step 5: Checking MongoDB connection..."
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✅ MongoDB connected successfully'); process.exit(0); }).catch(err => { console.error('❌ MongoDB connection failed:', err.message); process.exit(1); });"

echo ""
echo "Step 6: Starting backend..."
pm2 restart backend || pm2 start npm --name backend -- start

echo ""
echo "Step 7: Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "Step 8: Building frontend..."
npm run build

echo ""
echo "Step 9: Starting frontend..."
pm2 restart frontend || pm2 start npm --name frontend -- start

echo ""
echo "Step 10: Checking PM2 status..."
pm2 status

echo ""
echo "Step 11: Checking backend logs for errors..."
pm2 logs backend --lines 20 --nostream

echo ""
echo "Step 12: Testing backend API..."
sleep 3
curl -s http://localhost:3001/api/products | head -n 20

echo ""
echo "=========================================="
echo "Fix Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check if products are loading: curl http://localhost:3001/api/products"
echo "2. Check PM2 logs: pm2 logs backend"
echo "3. Setup webhook: cd backend && node setup-webhook.js"
echo "4. Test webhook: curl https://coorgmasala.com/api/webhooks/receive/nimbuspost/test"
echo ""
