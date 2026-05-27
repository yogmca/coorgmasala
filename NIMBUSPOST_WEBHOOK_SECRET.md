# NimbusPost Webhook Configuration

## 🔑 Production Secret Key

```
f3f880f2e181117b0be0e726deecfc077935c155a40a893dec229fb1ef7c1db5
```

## 📍 Webhook Endpoint

```
https://coorgmasala.com/api/webhooks/receive/nimbuspost
```

## 🔧 Configuration Details

- **Webhook ID**: `6a1674151860a37915013744`
- **Name**: NimbusPost Shipment Tracking
- **Status**: Active ✅
- **Created**: May 27, 2026
- **Signature Algorithm**: HMAC-SHA256

## 📋 NimbusPost Setup Instructions

1. **Log in to NimbusPost Dashboard**
   - Go to [https://ship.nimbuspost.com](https://ship.nimbuspost.com)
   - Sign in with your credentials

2. **Navigate to Webhooks Settings**
   - Go to Settings → Webhooks (or API Settings)

3. **Create New Webhook**
   - Click "Add Webhook" or "Create New Webhook"

4. **Enter Configuration Details**
   - **Webhook URL**: `https://coorgmasala.com/api/webhooks/receive/nimbuspost`
   - **Secret Key**: `f3f880f2e181117b0be0e726deecfc077935c155a40a893dec229fb1ef7c1db5`
   - **Method**: POST
   - **Content Type**: application/json

5. **Select Events to Track**
   - ✅ Shipment Created
   - ✅ In Transit
   - ✅ Out for Delivery
   - ✅ Delivered
   - ✅ RTO (Return to Origin)
   - ✅ Cancelled
   - ✅ All Status Updates

6. **Save Configuration**
   - Click "Save" or "Create Webhook"
   - Test the webhook using NimbusPost's test feature

## 🔒 Security

- The webhook uses **HMAC-SHA256** signature verification
- All incoming webhooks are verified using the secret key
- The signature is sent in the `x-hmac-sha256` header
- Invalid signatures are rejected with a 401 Unauthorized response

## 🧪 Testing the Webhook

### Test Endpoint Availability
```bash
curl https://coorgmasala.com/api/webhooks/receive/nimbuspost/test
```

Expected Response:
```json
{
  "message": "NimbusPost webhook endpoint is active",
  "timestamp": "2026-05-27T04:33:25.000Z"
}
```

### Test Webhook with Sample Payload
```bash
curl -X POST https://coorgmasala.com/api/webhooks/receive/nimbuspost \
  -H "Content-Type: application/json" \
  -H "x-hmac-sha256: YOUR_SIGNATURE_HERE" \
  -d '{
    "awb_number": "TEST123456",
    "status": "in transit",
    "location": "Mumbai Hub",
    "message": "Package in transit",
    "event_time": "2026-05-27T10:00:00Z"
  }'
```

## 📊 Monitoring Webhooks

### View Webhook Logs
- Log in to the Admin Panel at `https://coorgmasala.com/admin`
- Navigate to the Webhooks section
- View all received webhook payloads with their processing status

### Check Webhook Status via API
```bash
# Requires admin authentication
curl https://coorgmasala.com/api/webhooks \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🔄 Webhook Payload Format

NimbusPost will send webhooks in this format:

```json
{
  "awb_number": "AWBXXXXXXXX",
  "status": "in transit",
  "location": "City Name",
  "message": "Status description",
  "event_time": "2026-05-27T10:00:00Z",
  "rto_awb": "RTOXXXXXXXX"
}
```

## 📝 What Happens When a Webhook is Received

1. **Signature Verification**: The webhook signature is verified using HMAC-SHA256
2. **Order Lookup**: The system finds the order using the AWB number
3. **Status Update**: The order status is updated based on the webhook data
4. **Event Logging**: The webhook event is logged in the order's webhook history
5. **Delivery Info Update**: Tracking information is updated with location and status
6. **Audit Trail**: The raw webhook payload is saved for auditing

## 🛠️ Utility Scripts

### Retrieve Current Secret
```bash
cd backend && node get-webhook-secret.js
```

### Setup New Webhook (if needed)
```bash
cd backend && node setup-webhook.js
```

## ⚠️ Important Notes

- **Keep the secret key secure** - Do not commit it to version control
- **The secret is stored in MongoDB** - Not in environment variables
- **Only one active webhook** - The system uses the first active webhook configuration
- **Signature verification is mandatory** - Webhooks without valid signatures are rejected
- **All webhooks are logged** - Check the database for webhook history and debugging

## 🔗 Related Files

- Webhook Routes: [`backend/routes/webhooks.js`](backend/routes/webhooks.js)
- Webhook Model: [`backend/models/Webhook.js`](backend/models/Webhook.js)
- Webhook Payload Model: [`backend/models/WebhookPayload.js`](backend/models/WebhookPayload.js)
- Order Model: [`backend/models/Order.js`](backend/models/Order.js)

## 📞 Support

If you encounter issues:
1. Check the webhook logs in the Admin Panel
2. Verify the secret key matches in NimbusPost
3. Test the endpoint using the test URL
4. Check server logs for error messages
5. Ensure the webhook URL is accessible from NimbusPost servers
