#!/bin/bash

# Emergency Site Fix Script
# Kills all PM2 processes, clears ports, and restarts cleanly

echo "=========================================="
echo "EMERGENCY SITE FIX"
echo "=========================================="

# Step 1: Kill PM2 completely
echo ""
echo "Step 1: Killing PM2..."
pm2 kill

# Step 2: Kill anything on ports
echo ""
echo "Step 2: Clearing ports..."
sudo fuser -k 5000/tcp 2>/dev/null || echo "Port 5000 clear"
sudo fuser -k 3000/tcp 2>/dev/null || echo "Port 3000 clear"
sudo fuser -k 5173/tcp 2>/dev/null || echo "Port 5173 clear"

# Step 3: Wait a moment
sleep 2

# Step 4: Verify ports are free
echo ""
echo "Step 3: Verifying ports are free..."
lsof -i:5000 || echo "✅ Port 5000 is free"
lsof -i:3000 || echo "✅ Port 3000 is free"

# Step 5: Start backend
echo ""
echo "Step 4: Starting backend..."
cd /home/ubuntu/coorg-spices/backend
pm2 start server.js --name coorg-backend

# Step 6: Wait for backend
sleep 3

# Step 7: Check backend
echo ""
echo "Step 5: Checking backend..."
pm2 logs coorg-backend --lines 5 --nostream

# Step 8: Test backend
echo ""
echo "Step 6: Testing backend API..."
curl -s http://localhost:5000/api/products | head -n 20

# Step 9: Build frontend if needed
echo ""
echo "Step 7: Checking frontend build..."
cd /home/ubuntu/coorg-spices/frontend
if [ ! -d "build" ]; then
    echo "Building frontend..."
    npm run build
else
    echo "✅ Frontend build exists"
fi

# Step 10: Start frontend
echo ""
echo "Step 8: Starting frontend..."
pm2 start npm --name coorg-frontend -- start

# Step 11: Save PM2
echo ""
echo "Step 9: Saving PM2 configuration..."
pm2 save

# Step 12: Final status
echo ""
echo "Step 10: Final status..."
pm2 status

echo ""
echo "=========================================="
echo "FIX COMPLETE!"
echo "=========================================="
echo ""
echo "Check your site: https://coorgmasala.com"
echo ""
echo "If site is up, setup webhook:"
echo "cd /home/ubuntu/coorg-spices/backend"
echo "node setup-webhook.js"
echo ""
