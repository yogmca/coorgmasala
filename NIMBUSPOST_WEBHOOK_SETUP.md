# NimbusPost Webhook Integration Guide

## Overview

This system integrates with NimbusPost delivery partner to receive real-time shipment tracking updates via webhooks. All webhook payloads are verified using HMAC-SHA256 signatures and stored in the database for auditing.

## Features

- ✅ Webhook configuration management (CRUD operations)
- ✅ HMAC-SHA256 signature verification
- ✅ Automatic order status updates
- ✅ Complete payload auditing and logging
- ✅ Delivery tracking with location and timestamps
- ✅ Order notes with event history

## Database Models

### 1. Webhook Model
Stores webhook configuration to be provided to NimbusPost.

**Fields:**
- `name` - Identifier for the webhook
- `deliveryUrl` - URL where NimbusPost sends payloads
- `secret` - Secret key for HMAC signature generation
- `isActive` - Whether this webhook is active

### 2. WebhookPayload Model
Stores all received webhook payloads for auditing.

**Fields:**
- `awbNumber` - AWB tracking number
- `status` - Delivery status
- `eventTime` - Event timestamp
- `location` - Current location
- `message` - Status message
- `rtoAwb` - RTO AWB if applicable
- `signature` - HMAC signature received
- `signatureVerified` - Verification status
- `rawPayload` - Complete payload
- `processed` - Processing status

### 3. Order Model Updates
Enhanced with webhook tracking fields:

**New fields in deliveryInfo:**
- `awbNumber` - AWB tracking number
- `currentStatus` - Latest delivery status
- `currentLocation` - Current location
- `lastEventTime` - Last event timestamp
- `rtoAwb` - RTO AWB number

**New array:**
- `webhookEvents[]` - Array of all webhook events received

## API Endpoints

### Admin Endpoints (Require Authentication)

#### 1. Create Webhook Configuration
```http
POST /api/webhooks
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "NimbusPost Production Webhook",
  "deliveryUrl": "https://yourdomain.com/api/webhooks/receive/nimbuspost",
  "secret": "your-secret-key-here"
}
```

**Response:**
```json
{
  "message": "Webhook created successfully",
  "webhook": {
    "_id": "...",
    "name": "NimbusPost Production Webhook",
    "deliveryUrl": "https://yourdomain.com/api/webhooks/receive/nimbuspost",
    "secret": "your-secret-key-here",
    "isActive": true
  }
}
```

#### 2. Get All Webhooks
```http
GET /api/webhooks
Authorization: Bearer <admin-token>
```

#### 3. Get Single Webhook
```http
GET /api/webhooks/:id
Authorization: Bearer <admin-token>
```

#### 4. Update Webhook
```http
PUT /api/webhooks/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "secret": "new-secret-key",
  "isActive": true
}
```

#### 5. Delete Webhook
```http
DELETE /api/webhooks/:id
Authorization: Bearer <admin-token>
```

#### 6. Get NimbusPost Configuration
Get the configuration details to provide to NimbusPost:

```http
GET /api/webhooks/nimbuspost-config
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "message": "Provide these details to NimbusPost",
  "configuration": {
    "name": "NimbusPost Production Webhook",
    "deliveryUrl": "https://yourdomain.com/api/webhooks/receive/nimbuspost",
    "secret": "your-secret-key-here",
    "webhookEndpoint": "https://yourdomain.com/api/webhooks/receive/nimbuspost",
    "testEndpoint": "https://yourdomain.com/api/webhooks/receive/nimbuspost/test"
  },
  "instructions": [...]
}
```

#### 7. Get Webhook Payload History
```http
GET /api/webhooks/payloads?awbNumber=4152912381315&limit=50&skip=0
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `awbNumber` - Filter by AWB number
- `orderId` - Filter by order ID
- `processed` - Filter by processing status (true/false)
- `limit` - Number of records (default: 50)
- `skip` - Skip records for pagination (default: 0)

### Public Endpoint (For NimbusPost)

#### Receive Webhook
```http
POST /api/webhooks/receive/nimbuspost
Content-Type: application/json
X-Hmac-SHA256: <base64-encoded-signature>

{
  "awb_number": "4152912381315",
  "status": "in transit",
  "event_time": "2021-02-26 16:19:59",
  "location": "Delhi",
  "message": "Reached at nearest hub",
  "rto_awb": ""
}
```

#### Test Endpoint
```http
GET /api/webhooks/receive/nimbuspost/test
```

## Setup Instructions

### Step 1: Create Webhook Configuration

1. Login as admin
2. Create a webhook configuration:

```bash
curl -X POST http://localhost:5000/api/webhooks \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "NimbusPost Webhook",
    "deliveryUrl": "https://yourdomain.com/api/webhooks/receive/nimbuspost",
    "secret": "your-strong-secret-key-here"
  }'
```

### Step 2: Get Configuration for NimbusPost

```bash
curl -X GET http://localhost:5000/api/webhooks/nimbuspost-config \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Step 3: Provide Details to NimbusPost

Provide the following to NimbusPost:
- **Name:** NimbusPost Webhook
- **Delivery URL:** https://yourdomain.com/api/webhooks/receive/nimbuspost
- **Secret:** your-strong-secret-key-here

### Step 4: Update Orders with AWB Numbers

When you ship an order, update it with the AWB number:

```javascript
// In your order processing code
order.deliveryInfo.awbNumber = "4152912381315";
order.deliveryInfo.carrier = "NimbusPost";
await order.save();
```

## Webhook Signature Verification

NimbusPost sends webhooks with an `X-Hmac-SHA256` header containing a base64-encoded HMAC signature.

### Verification Process:

1. Receive webhook payload
2. Get signature from `X-Hmac-SHA256` header
3. Calculate HMAC using the secret key:
   ```javascript
   const hash = crypto
     .createHmac('sha256', secret)
     .update(JSON.stringify(payload))
     .digest('base64');
   ```
4. Compare calculated hash with received signature
5. Process webhook only if signatures match

### PHP Example (from NimbusPost):
```php
$hash = base64_encode(hash_hmac('sha256', 'webhook_data_here', 'your_secret_here', true));
```

## Sample Payload from NimbusPost

```json
{
  "awb_number": "4152912381315",
  "status": "in transit",
  "event_time": "2021-02-26 16:19:59",
  "location": "Delhi",
  "message": "Reached at nearest hub",
  "rto_awb": ""
}
```

## Status Mapping

NimbusPost statuses are mapped to internal order statuses:

| NimbusPost Status | Order Status |
|------------------|--------------|
| pending | pending |
| confirmed | confirmed |
| in transit | shipped |
| out for delivery | out_for_delivery |
| delivered | delivered |
| cancelled | cancelled |
| rto | cancelled |
| (other) | processing |

## Order Updates

When a webhook is received, the following updates occur:

### 1. Delivery Info Updates
- `currentStatus` - Latest status from NimbusPost
- `currentLocation` - Current location
- `lastEventTime` - Event timestamp
- `rtoAwb` - RTO AWB if applicable
- `shippedAt` - Set when status becomes "shipped"
- `deliveredAt` - Set when status becomes "delivered"

### 2. Order Status Update
- `orderStatus` - Mapped from NimbusPost status

### 3. Delivery Notes
Each webhook event adds a timestamped note:
```
[26 Feb 2021, 4:19 pm] Delhi: Reached at nearest hub
```

### 4. Webhook Events Array
Complete event history stored in `order.webhookEvents[]`

### 5. Webhook Payload Record
All payloads saved to `WebhookPayload` collection for auditing

## Testing

### Test Webhook Endpoint
```bash
curl http://localhost:5000/api/webhooks/receive/nimbuspost/test
```

### Send Test Webhook
```bash
# Without signature (if no secret configured)
curl -X POST http://localhost:5000/api/webhooks/receive/nimbuspost \
  -H "Content-Type: application/json" \
  -d '{
    "awb_number": "4152912381315",
    "status": "in transit",
    "event_time": "2021-02-26 16:19:59",
    "location": "Delhi",
    "message": "Reached at nearest hub",
    "rto_awb": ""
  }'
```

### Generate HMAC Signature (Node.js)
```javascript
const crypto = require('crypto');

const payload = {
  "awb_number": "4152912381315",
  "status": "in transit",
  "event_time": "2021-02-26 16:19:59",
  "location": "Delhi",
  "message": "Reached at nearest hub",
  "rto_awb": ""
};

const secret = "your-secret-key-here";
const signature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(payload))
  .digest('base64');

console.log('X-Hmac-SHA256:', signature);
```

### Send Test Webhook with Signature
```bash
curl -X POST http://localhost:5000/api/webhooks/receive/nimbuspost \
  -H "Content-Type: application/json" \
  -H "X-Hmac-SHA256: YOUR_CALCULATED_SIGNATURE" \
  -d '{
    "awb_number": "4152912381315",
    "status": "in transit",
    "event_time": "2021-02-26 16:19:59",
    "location": "Delhi",
    "message": "Reached at nearest hub",
    "rto_awb": ""
  }'
```

## Monitoring and Debugging

### View All Webhook Payloads
```bash
curl -X GET "http://localhost:5000/api/webhooks/payloads?limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### View Payloads for Specific AWB
```bash
curl -X GET "http://localhost:5000/api/webhooks/payloads?awbNumber=4152912381315" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### View Failed Payloads
```bash
curl -X GET "http://localhost:5000/api/webhooks/payloads?processed=false" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Environment Variables

Add to your `.env` file:

```env
# Optional: Base URL for webhook endpoint
WEBHOOK_BASE_URL=https://yourdomain.com
```

If not set, the system will auto-detect from the request.

## Security Considerations

1. **Always use HTTPS** in production for the delivery URL
2. **Use a strong secret key** (minimum 32 characters, random)
3. **Keep the secret key confidential** - only share with NimbusPost
4. **Monitor webhook payloads** regularly for suspicious activity
5. **Verify signatures** - never disable signature verification in production

## Troubleshooting

### Webhook Not Received
1. Check NimbusPost configuration
2. Verify delivery URL is accessible from internet
3. Check firewall/security group settings
4. Test endpoint: `GET /api/webhooks/receive/nimbuspost/test`

### Signature Verification Failed
1. Verify secret key matches what was provided to NimbusPost
2. Check payload format (must be exact JSON)
3. Review webhook payload logs in database

### Order Not Updated
1. Verify order has correct AWB number in `deliveryInfo.awbNumber`
2. Check webhook payload logs for processing errors
3. Review server logs for error messages

## Support

For issues or questions:
1. Check webhook payload logs: `GET /api/webhooks/payloads`
2. Review server logs for error messages
3. Verify webhook configuration: `GET /api/webhooks/nimbuspost-config`
4. Contact NimbusPost support for delivery partner issues
