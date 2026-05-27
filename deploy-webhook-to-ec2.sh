#!/bin/bash

# Deploy Webhook Integration to EC2
# This script pulls the latest code and restarts services

echo "=========================================="
echo "Deploying Webhook Integration to EC2"
echo "=========================================="

# Navigate to project directory
cd /home/ubuntu/coorgmasala || exit 1

echo ""
echo "Step 1: Pulling latest code from production branch..."
git pull origin coorgmasala_prod

echo ""
echo "Step 2: Installing backend dependencies..."
cd backend
npm install

echo ""
echo "Step 3: Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "Step 4: Building frontend..."
npm run build

echo ""
echo "Step 5: Restarting PM2 services..."
cd ..
pm2 restart all

echo ""
echo "Step 6: Checking PM2 status..."
pm2 status

echo ""
echo "Step 7: Setting up webhook in MongoDB..."
cd backend
node setup-webhook.js

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check PM2 logs: pm2 logs"
echo "2. Test webhook endpoint: curl https://coorgmasala.com/api/webhooks/receive/nimbuspost/test"
echo "3. Copy the webhook secret from the output above"
echo "4. Configure NimbusPost with the webhook URL and secret"
echo ""
