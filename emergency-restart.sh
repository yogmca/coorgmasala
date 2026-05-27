#!/bin/bash

# Emergency Restart Script for EC2
# Run this after EC2 reboot to get services back online

echo "=========================================="
echo "Emergency EC2 Recovery"
echo "=========================================="

cd /home/ubuntu/coorgmasala || exit 1

echo ""
echo "Step 1: Killing hung processes..."
pkill -9 npm 2>/dev/null || echo "No npm processes to kill"
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "Port 3001 clear"
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Port 3000 clear"

echo ""
echo "Step 2: Cleaning PM2..."
pm2 stop all 2>/dev/null
pm2 delete all 2>/dev/null

echo ""
echo "Step 3: Pulling latest code..."
git pull origin coorgmasala_prod

echo ""
echo "Step 4: Starting backend..."
cd backend
pm2 start npm --name backend -- start

echo ""
echo "Step 5: Waiting for backend..."
sleep 5

echo ""
echo "Step 6: Checking backend logs..."
pm2 logs backend --lines 15 --nostream

echo ""
echo "Step 7: Testing backend API..."
curl -s http://localhost:3001/api/products | head -n 30

echo ""
echo "Step 8: Starting frontend (using existing build)..."
cd ../frontend
pm2 start npm --name frontend -- start

echo ""
echo "Step 9: Saving PM2 config..."
pm2 save

echo ""
echo "Step 10: Final status..."
pm2 status

echo ""
echo "=========================================="
echo "Recovery Complete!"
echo "=========================================="
echo ""
echo "✅ Backend should be running on port 3001"
echo "✅ Frontend should be running on port 3000"
echo ""
echo "Next steps:"
echo "1. Test website: https://coorgmasala.com"
echo "2. Setup webhook: cd backend && node setup-webhook.js"
echo "3. Check logs: pm2 logs"
echo ""
