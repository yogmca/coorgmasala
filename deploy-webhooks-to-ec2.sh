#!/bin/bash

# Deploy Webhook Functionality to EC2
# This script deploys the webhook routes and models to production

echo "🚀 Deploying Webhook Functionality to EC2..."

# EC2 connection details
EC2_USER="ubuntu"
EC2_HOST="16.176.23.246"
KEY_PATH="$HOME/.ssh/coorg-spices-key.pem"

# Check if key exists
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ SSH key not found at $KEY_PATH"
    echo "Please ensure your SSH key is in the correct location"
    exit 1
fi

echo "📦 Creating deployment package..."

# Create temporary directory for deployment
TEMP_DIR=$(mktemp -d)
echo "Using temp directory: $TEMP_DIR"

# Copy webhook files
mkdir -p "$TEMP_DIR/backend/routes"
mkdir -p "$TEMP_DIR/backend/models"

cp backend/routes/webhooks.js "$TEMP_DIR/backend/routes/"
cp backend/models/Webhook.js "$TEMP_DIR/backend/models/"
cp backend/models/WebhookPayload.js "$TEMP_DIR/backend/models/"

echo "✅ Files copied to deployment package"

# Create deployment script for EC2
cat > "$TEMP_DIR/deploy.sh" << 'DEPLOY_SCRIPT'
#!/bin/bash

echo "📥 Deploying webhook files..."

# Backup existing files
cd /home/ubuntu/coorg-spices
mkdir -p backups/$(date +%Y%m%d_%H%M%S)
[ -f backend/routes/webhooks.js ] && cp backend/routes/webhooks.js backups/$(date +%Y%m%d_%H%M%S)/
[ -f backend/models/Webhook.js ] && cp backend/models/Webhook.js backups/$(date +%Y%m%d_%H%M%S)/
[ -f backend/models/WebhookPayload.js ] && cp backend/models/WebhookPayload.js backups/$(date +%Y%m%d_%H%M%S)/

# Copy new files
cp -f /tmp/webhook-deploy/backend/routes/webhooks.js backend/routes/
cp -f /tmp/webhook-deploy/backend/models/Webhook.js backend/models/
cp -f /tmp/webhook-deploy/backend/models/WebhookPayload.js backend/models/

echo "✅ Files deployed"

# Check if webhook routes are registered in server.js
if ! grep -q "webhooks" backend/server.js; then
    echo "⚠️  WARNING: Webhook routes not registered in server.js"
    echo "You need to add this line to backend/server.js:"
    echo "app.use('/api/webhooks', require('./routes/webhooks'));"
    echo ""
    echo "Adding webhook routes to server.js..."
    
    # Backup server.js
    cp backend/server.js backend/server.js.backup.$(date +%Y%m%d_%H%M%S)
    
    # Add webhook routes before the catch-all route
    sed -i '/app.use.*\/api\/reviews/a app.use('"'"'/api/webhooks'"'"', require('"'"'./routes/webhooks'"'"'));' backend/server.js
    
    echo "✅ Webhook routes added to server.js"
fi

# Restart backend server
echo "🔄 Restarting backend server..."
pm2 restart backend

echo "⏳ Waiting for server to restart..."
sleep 5

# Check if server is running
if pm2 list | grep -q "backend.*online"; then
    echo "✅ Backend server restarted successfully"
    
    # Test webhook endpoint
    echo "🧪 Testing webhook endpoint..."
    sleep 2
    RESPONSE=$(curl -s http://localhost:3001/api/webhooks/receive/nimbuspost/test)
    
    if echo "$RESPONSE" | grep -q "NimbusPost webhook endpoint is active"; then
        echo "✅ Webhook endpoint is working!"
        echo "Response: $RESPONSE"
    else
        echo "⚠️  Webhook endpoint test failed"
        echo "Response: $RESPONSE"
        echo "Check PM2 logs: pm2 logs backend"
    fi
else
    echo "❌ Backend server failed to restart"
    echo "Check PM2 logs: pm2 logs backend"
    exit 1
fi

# Cleanup
rm -rf /tmp/webhook-deploy

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test webhook endpoint: curl https://coorgmasala.com/api/webhooks/receive/nimbuspost/test"
echo "2. View webhook config: curl -H 'Authorization: Bearer YOUR_TOKEN' https://coorgmasala.com/api/webhooks/nimbuspost-config"
echo "3. View payloads: curl -H 'Authorization: Bearer YOUR_TOKEN' https://coorgmasala.com/api/webhooks/payloads"
DEPLOY_SCRIPT

chmod +x "$TEMP_DIR/deploy.sh"

echo "📤 Uploading files to EC2..."

# Upload files to EC2
scp -i "$KEY_PATH" -r "$TEMP_DIR" "$EC2_USER@$EC2_HOST:/tmp/webhook-deploy"

if [ $? -ne 0 ]; then
    echo "❌ Failed to upload files to EC2"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "✅ Files uploaded successfully"

echo "🔧 Running deployment script on EC2..."

# Execute deployment script on EC2
ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" "bash /tmp/webhook-deploy/deploy.sh"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ =========================================="
    echo "✅ Webhook deployment completed successfully!"
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
    echo "📖 Full documentation: WEBHOOK_API_DOCUMENTATION.md"
else
    echo "❌ Deployment failed. Check the error messages above."
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Cleanup local temp directory
rm -rf "$TEMP_DIR"

echo ""
echo "🧪 Testing production endpoint..."
sleep 2
curl -s https://coorgmasala.com/api/webhooks/receive/nimbuspost/test | jq . || curl -s https://coorgmasala.com/api/webhooks/receive/nimbuspost/test

echo ""
echo "✅ Deployment complete!"
