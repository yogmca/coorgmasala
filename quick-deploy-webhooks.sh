#!/bin/bash

# Quick Webhook Deployment Script
# Deploys only webhook routes to EC2 without full rebuild

echo "🚀 Quick Webhook Deployment to EC2..."

EC2_USER="ubuntu"
EC2_HOST="16.176.23.246"
KEY_PATH="$HOME/.ssh/coorg-spices-key.pem"

if [ ! -f "$KEY_PATH" ]; then
    echo "❌ SSH key not found at $KEY_PATH"
    exit 1
fi

echo "📤 Deploying webhook routes to production..."

# Deploy via SSH
ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
cd /home/ubuntu/coorg-spices

echo "📥 Pulling latest code..."
git pull origin main

echo "🔧 Checking if webhook routes are registered..."
if ! grep -q "app.use('/api/webhooks'" backend/server.js; then
    echo "⚠️  Adding webhook routes to server.js..."
    
    # Backup server.js
    cp backend/server.js backend/server.js.backup.$(date +%Y%m%d_%H%M%S)
    
    # Find the line with reviews route and add webhooks after it
    sed -i "/app.use('\/api\/reviews'/a app.use('/api/webhooks', require('./routes/webhooks'));" backend/server.js
    
    echo "✅ Webhook routes added"
else
    echo "✅ Webhook routes already registered"
fi

echo "🔄 Restarting backend..."
pm2 restart backend

echo "⏳ Waiting for server..."
sleep 5

echo "🧪 Testing webhook endpoint..."
RESPONSE=$(curl -s http://localhost:3001/api/webhooks/receive/nimbuspost/test)

if echo "$RESPONSE" | grep -q "NimbusPost webhook endpoint is active"; then
    echo "✅ Webhook endpoint is working!"
    echo "Response: $RESPONSE"
else
    echo "⚠️  Response: $RESPONSE"
    echo "Check logs: pm2 logs backend --lines 50"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Test your webhook:"
echo "curl https://coorgmasala.com/api/webhooks/receive/nimbuspost/test"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ =========================================="
    echo "✅ Webhook deployment successful!"
    echo "✅ =========================================="
    echo ""
    echo "🧪 Testing production endpoint..."
    sleep 2
    curl -s https://coorgmasala.com/api/webhooks/receive/nimbuspost/test
    echo ""
    echo ""
    echo "📋 Your webhook endpoints:"
    echo "  POST https://coorgmasala.com/api/webhooks/receive/nimbuspost"
    echo "  GET  https://coorgmasala.com/api/webhooks/payloads (Admin)"
    echo ""
    echo "🔐 Secret Key: f3f880f2e181117b0be0e726deecfc077935c155a40a893dec229fb1ef7c1db5"
else
    echo "❌ Deployment failed"
    exit 1
fi
