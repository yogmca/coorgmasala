#!/bin/bash

# Deploy Webhooks - Run this directly on EC2 server
# No SSH needed - for direct execution on the server
# NO NPM INSTALL - just git pull and PM2 restart

echo "🚀 Deploying Webhook Routes..."

cd /home/ubuntu/coorg-spices

echo "📥 Pulling latest code..."
git pull origin main

echo "🔧 Checking if webhook routes are registered in server.js..."

if ! grep -q "app.use('/api/webhooks'" backend/server.js; then
    echo "⚠️  Webhook routes not found. Adding them now..."
    
    # Backup server.js
    cp backend/server.js backend/server.js.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup created"
    
    # Find the line with reviews route and add webhooks after it
    sed -i "/app.use('\/api\/reviews'/a app.use('/api/webhooks', require('./routes/webhooks'));" backend/server.js
    
    echo "✅ Webhook routes added to server.js"
else
    echo "✅ Webhook routes already registered in server.js"
fi

echo ""
echo "🔄 Restarting backend server..."
pm2 restart backend

echo "⏳ Waiting for server to start..."
sleep 5

echo ""
echo "🧪 Testing webhook endpoint..."
RESPONSE=$(curl -s http://localhost:3001/api/webhooks/receive/nimbuspost/test)

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "NimbusPost webhook endpoint is active"; then
    echo ""
    echo "✅ =========================================="
    echo "✅ Webhook deployment successful!"
    echo "✅ =========================================="
    echo ""
    echo "🔗 Your webhook endpoints are now live:"
    echo ""
    echo "📍 Webhook Receiver (for NimbusPost):"
    echo "   POST https://coorgmasala.com/api/webhooks/receive/nimbuspost"
    echo ""
    echo "📍 Test Endpoint:"
    echo "   GET https://coorgmasala.com/api/webhooks/receive/nimbuspost/test"
    echo ""
    echo "📍 View Payloads (Admin):"
    echo "   GET https://coorgmasala.com/api/webhooks/payloads"
    echo ""
    echo "🔐 Secret Key:"
    echo "   f3f880f2e181117b0be0e726deecfc077935c155a40a893dec229fb1ef7c1db5"
    echo ""
    echo "🧪 Test from outside:"
    echo "   curl https://coorgmasala.com/api/webhooks/receive/nimbuspost/test"
    echo ""
else
    echo ""
    echo "⚠️  Webhook endpoint test returned unexpected response"
    echo "Response: $RESPONSE"
    echo ""
    echo "📋 Check PM2 logs for errors:"
    echo "   pm2 logs backend --lines 50"
    echo ""
    echo "📋 Check if routes file exists:"
    echo "   ls -la backend/routes/webhooks.js"
    echo ""
fi

echo ""
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "✅ Deployment script completed!"
