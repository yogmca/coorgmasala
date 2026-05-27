# 🔗 Webhook API Documentation - Coorg Masala

## 📌 NimbusPost Webhook Configuration

### Active Webhook Details
- **Name:** NimbusPost Shipment Tracking
- **Delivery URL:** `https://coorgmasala.com/api/webhooks/receive/nimbuspost`
- **Secret Key:** `f3f880f2e181117b0be0e726deecfc077935c155a40a893dec229fb1ef7c1db5`
- **Status:** ✅ Active
- **Security:** HMAC-SHA256 Signature Verification ENABLED

---

## 🌐 Production API Endpoints

### 1. Webhook Receiver (Public - for NimbusPost)
**Endpoint:** `POST https://coorgmasala.com/api/webhooks/receive/nimbuspost`

**Purpose:** Receives shipment tracking updates from NimbusPost

**Headers:**
```
Content-Type: application/json
x-hmac-sha256: <signature>
```

**Sample Payload:**
```json
{
  "awb_number": "AWB123456789",
  "status": "in transit",
  "event_time": "2026-05-27T10:30:00Z",
  "location": "Mumbai Hub",
  "message": "Package received at sorting facility",
  "rto_awb": ""
}
```

**Response:**
```json
{
  "message": "Webhook processed successfully",
  "orderId": "ORD-1234567890",
  "status": "shipped"
}
```

---

### 2. View All Webhook Payloads (Admin Only)
**Endpoint:** `GET https://coorgmasala.com/api/webhooks/payloads`

**Purpose:** Retrieve all webhook payloads received from NimbusPost

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 50)
- `skip` (optional): Number of records to skip for pagination (default: 0)

**Response:**
```json
{
  "payloads": [
    {
      "_id": "...",
      "webhookId": "...",
      "orderId": "...",
      "awbNumber": "AWB123456789",
      "status": "in transit",
      "eventTime": "2026-05-27T10:30:00Z",
      "location": "Mumbai Hub",
      "message": "Package received at sorting facility",
      "rtoAwb": "",
      "signature": "...",
      "signatureVerified": true,
      "rawPayload": { ... },
      "rawHeaders": { ... },
      "processed": true,
      "processingError": "",
      "receivedAt": "2026-05-27T10:30:05Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "skip": 0
}
```

---

### 3. Filter Webhook Payloads (Admin Only)

#### By AWB Number
**Endpoint:** `GET https://coorgmasala.com/api/webhooks/payloads?awbNumber=<AWB>`

**Example:**
```bash
curl -H "Authorization: Bearer <admin_token>" \
  "https://coorgmasala.com/api/webhooks/payloads?awbNumber=AWB123456789"
```

#### By Order ID
**Endpoint:** `GET https://coorgmasala.com/api/webhooks/payloads?orderId=<ORDER_ID>`

**Example:**
```bash
curl -H "Authorization: Bearer <admin_token>" \
  "https://coorgmasala.com/api/webhooks/payloads?orderId=6745a1b2c3d4e5f6g7h8i9j0"
```

#### By Processing Status
**Endpoint:** `GET https://coorgmasala.com/api/webhooks/payloads?processed=true`

**Example:**
```bash
curl -H "Authorization: Bearer <admin_token>" \
  "https://coorgmasala.com/api/webhooks/payloads?processed=false"
```

#### Combined Filters with Pagination
**Example:**
```bash
curl -H "Authorization: Bearer <admin_token>" \
  "https://coorgmasala.com/api/webhooks/payloads?processed=true&limit=20&skip=40"
```

---

### 4. Get NimbusPost Configuration (Admin Only)
**Endpoint:** `GET https://coorgmasala.com/api/webhooks/nimbuspost-config`

**Purpose:** Get webhook configuration details for NimbusPost setup

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "Provide these details to NimbusPost",
  "configuration": {
    "name": "NimbusPost Shipment Tracking",
    "deliveryUrl": "https://coorgmasala.com/api/webhooks/receive/nimbuspost",
    "secret": "f3f880f2e181117b0be0e726deecfc077935c155a40a893dec229fb1ef7c1db5",
    "webhookEndpoint": "https://coorgmasala.com/api/webhooks/receive/nimbuspost",
    "testEndpoint": "https://coorgmasala.com/api/webhooks/receive/nimbuspost/test"
  },
  "instructions": [...]
}
```

---

### 5. Test Webhook Endpoint (Public)
**Endpoint:** `GET https://coorgmasala.com/api/webhooks/receive/nimbuspost/test`

**Purpose:** Verify webhook endpoint is accessible

**Response:**
```json
{
  "message": "NimbusPost webhook endpoint is active",
  "timestamp": "2026-05-27T10:30:00.000Z"
}
```

---

## 🔐 Security - HMAC Signature Verification

### How It Works
1. NimbusPost sends webhook payload with `x-hmac-sha256` header
2. Server computes HMAC-SHA256 hash using the secret key
3. Server compares computed hash with received signature
4. If match: payload is processed
5. If mismatch: request is rejected with 401 Unauthorized

### Secret Key
```
f3f880f2e181117b0be0e726deecfc077935c155a40a893dec229fb1ef7c1db5
```

### Signature Generation (for testing)
```javascript
const crypto = require('crypto');

const payload = { /* your webhook payload */ };
const secret = 'f3f880f2e181117b0be0e726deecfc077935c155a40a893dec229fb1ef7c1db5';

const signature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(payload))
  .digest('base64');

console.log('x-hmac-sha256:', signature);
```

---

## 📊 Webhook Payload Structure

### Stored Fields
Each webhook payload is stored with the following information:

| Field | Type | Description |
|-------|------|-------------|
| `webhookId` | ObjectId | Reference to webhook configuration |
| `orderId` | ObjectId | Reference to the order (if found) |
| `awbNumber` | String | AWB tracking number from NimbusPost |
| `status` | String | Delivery status from NimbusPost |
| `eventTime` | Date | Event timestamp from NimbusPost |
| `location` | String | Current location of shipment |
| `message` | String | Status message from NimbusPost |
| `rtoAwb` | String | RTO AWB number (if applicable) |
| `signature` | String | HMAC signature received in headers |
| `signatureVerified` | Boolean | Whether signature was verified |
| `rawPayload` | Object | Complete raw payload from NimbusPost |
| `rawHeaders` | Object | Request headers received |
| `processed` | Boolean | Whether webhook was processed successfully |
| `processingError` | String | Error message if processing failed |
| `receivedAt` | Date | When webhook was received |

---

## 🎯 Status Mapping

NimbusPost statuses are mapped to order statuses:

| NimbusPost Status | Order Status |
|-------------------|--------------|
| pending | pending |
| confirmed | confirmed |
| in transit | shipped |
| out for delivery | out_for_delivery |
| delivered | delivered |
| cancelled | cancelled |
| rto | cancelled |

---

## 📱 Where to View Webhook Payloads

### Option 1: API Calls (Current)
Use the API endpoints above with your admin token to retrieve webhook payloads.

**Get Admin Token:**
1. Login to https://coorgmasala.com
2. Open browser DevTools (F12)
3. Go to Application/Storage → Local Storage
4. Copy the `token` value

**Example API Call:**
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "https://coorgmasala.com/api/webhooks/payloads?limit=10"
```

### Option 2: Order Details Page
Webhook events are automatically displayed on individual order pages:
- Navigate to: `https://coorgmasala.com/order/<orderId>`
- Scroll to "Shipment Tracking" section
- View all webhook events for that order

### Option 3: Admin Panel (Coming Soon)
A dedicated "Webhooks" tab will be added to the Admin Panel at:
- `https://coorgmasala.com/admin`
- Tab: "Webhooks"
- Features: View all payloads, filter, search, and inspect raw data

---

## 🧪 Testing Webhooks

### Test Endpoint Availability
```bash
curl https://coorgmasala.com/api/webhooks/receive/nimbuspost/test
```

### Send Test Webhook (with signature)
```bash
# Generate signature first using the script above
curl -X POST https://coorgmasala.com/api/webhooks/receive/nimbuspost \
  -H "Content-Type: application/json" \
  -H "x-hmac-sha256: YOUR_GENERATED_SIGNATURE" \
  -d '{
    "awb_number": "TEST123456789",
    "status": "in transit",
    "event_time": "2026-05-27T10:30:00Z",
    "location": "Test Location",
    "message": "Test webhook message"
  }'
```

---

## 📝 Notes

1. **All webhook payloads are stored** in the database for auditing purposes
2. **Signature verification is enabled** - NimbusPost must send valid HMAC signature
3. **Orders are automatically updated** when matching AWB number is found
4. **Webhook events are visible** on order detail pages for customers
5. **Admin access required** for viewing all webhook payloads via API

---

## 🔧 Troubleshooting

### Webhook Not Processing
1. Check if signature verification is passing
2. Verify AWB number matches an order in the database
3. Check `processingError` field in webhook payload record

### View Failed Webhooks
```bash
curl -H "Authorization: Bearer <admin_token>" \
  "https://coorgmasala.com/api/webhooks/payloads?processed=false"
```

### Check Signature Verification Failures
```bash
curl -H "Authorization: Bearer <admin_token>" \
  "https://coorgmasala.com/api/webhooks/payloads" | grep "signatureVerified.*false"
```

---

**Last Updated:** May 27, 2026
**Version:** 1.0
