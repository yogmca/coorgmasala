# EC2 Deployment Instructions for Webhook Integration

## 📦 Code Pushed Successfully

✅ Code has been pushed to both **main** and **coorgmasala_prod** branches

## 🔧 Manual Steps Required on EC2

### Step 1: Pull Latest Code on EC2

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to project directory
cd /path/to/coorgmasala

# Pull latest code from production branch
git pull origin coorgmasala_prod
```

### Step 2: Install Dependencies

```bash
# Install backend dependencies (if any new packages)
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Setup Webhook in MongoDB

Run the webhook setup script on EC2 to create the webhook configuration in your production MongoDB:

```bash
cd backend
node setup-webhook.js
```

**Important:** This will generate a NEW secret key for production. Copy and save it securely.

### Step 4: Configure NimbusPost

After running the setup script, you'll get:
- Webhook URL: `https://coorgmasala.com/api/webhooks/receive/nimbuspost`
- Secret Key: (will be displayed by the script)

Use these to configure NimbusPost webhook in their dashboard.

### Step 5: Restart Services

```bash
# Restart backend with PM2
pm2 restart backend

# Rebuild and restart frontend
cd /path/to/coorgmasala/frontend
npm run build
pm2 restart frontend

# Or restart all
pm2 restart all
```

### Step 6: Verify Deployment

```bash
# Check if services are running
pm2 status

# Check backend logs
pm2 logs backend

# Test webhook endpoint
curl https://coorgmasala.com/api/webhooks/receive/nimbuspost/test
```

Expected response:
```json
{
  "message": "NimbusPost webhook endpoint is active",
  "timestamp": "2026-05-27T04:37:30.000Z"
}
```

## 📝 Environment Variables

### ⚠️ NO .env CHANGES REQUIRED

The webhook secret is **NOT stored in .env** - it's stored in MongoDB. No manual .env updates are needed.

Your current [`backend/.env`](backend/.env:1) file is sufficient:
- ✅ MongoDB URI is already configured
- ✅ All other environment variables are in place
- ✅ No new environment variables needed for webhooks

## 🔍 Verify Webhook Configuration

After deployment, you can verify the webhook configuration:

```bash
# On EC2, run this to see the webhook secret
cd /path/to/coorgmasala/backend
node get-webhook-secret.js
```

This will display:
- Active webhook configuration
- Secret key for NimbusPost
- Webhook URL

## 📊 New Features Deployed

1. **Webhook Models**
   - [`backend/models/Webhook.js`](backend/models/Webhook.js) - Webhook configuration storage
   - [`backend/models/WebhookPayload.js`](backend/models/WebhookPayload.js) - Webhook payload logging

2. **Webhook Routes**
   - [`backend/routes/webhooks.js`](backend/routes/webhooks.js) - Webhook receiver and management endpoints

3. **Shipment Tracking UI**
   - [`frontend/src/components/ShipmentTracking.js`](frontend/src/components/ShipmentTracking.js) - Tracking component
   - [`frontend/src/pages/ShipmentTracking.js`](frontend/src/pages/ShipmentTracking.js) - Tracking page

4. **Utility Scripts**
   - [`backend/setup-webhook.js`](backend/setup-webhook.js) - Setup webhook configuration
   - [`backend/get-webhook-secret.js`](backend/get-webhook-secret.js) - Retrieve webhook secret

5. **Updated Models**
   - [`backend/models/Order.js`](backend/models/Order.js) - Added webhook events tracking

## 🔐 Security Notes

- Webhook uses HMAC-SHA256 signature verification
- Secret key is 64 characters (32 bytes hex)
- All webhook payloads are logged for auditing
- Invalid signatures are rejected with 401 Unauthorized

## 🐛 Troubleshooting

### If webhook endpoint returns 404:
```bash
# Check if webhook route is registered
pm2 logs backend | grep webhook
```

### If signature verification fails:
1. Verify the secret key matches in NimbusPost
2. Check webhook logs in MongoDB
3. Run `node get-webhook-secret.js` to confirm the secret

### If orders aren't updating:
1. Check if AWB number is correctly stored in orders
2. Verify webhook payloads in database
3. Check backend logs for errors

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check MongoDB for webhook payloads
3. Test endpoint: `curl https://coorgmasala.com/api/webhooks/receive/nimbuspost/test`
4. Review [`NIMBUSPOST_WEBHOOK_SECRET.md`](NIMBUSPOST_WEBHOOK_SECRET.md) for detailed documentation
