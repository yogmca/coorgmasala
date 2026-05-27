# NimbusPost Webhook Configuration

## 🔗 Webhook Details to Provide to NimbusPost

### Production Configuration

**Webhook Name:** Coorg Masala NimbusPost Webhook

**Delivery URL (Webhook Endpoint):**
```
https://your-domain.com/api/webhooks/receive/nimbuspost
```

**Secret Key:**
```
your-generated-secret-key-here
```

---

## 📋 Setup Instructions

### Step 1: Generate a Strong Secret Key

Generate a secure random secret key (minimum 32 characters). You can use one of these methods:

**Option A: Using Node.js**
```javascript
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
console.log('Secret Key:', secret);
```

**Option B: Using OpenSSL (Terminal)**
```bash
openssl rand -hex 32
```

**Option C: Using Online Generator**
Visit: https://www.random.org/strings/ and generate a 64-character string

**Example Generated Secret:**
```
a7f3e9d2c8b4f6a1e5d9c3b7f2a6e8d4c9b5f1a7e3d9c6b2f8a4e1d7c3b9f5a2
```

### Step 2: Create Webhook Configuration in Your System

Login as admin and create the webhook configuration:

```bash
curl -X POST https://your-domain.com/api/webhooks \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coorg Masala NimbusPost Webhook",
    "deliveryUrl": "https://your-domain.com/api/webhooks/receive/nimbuspost",
    "secret": "a7f3e9d2c8b4f6a1e5d9c3b7f2a6e8d4c9b5f1a7e3d9c6b2f8a4e1d7c3b9f5a2"
  }'
```

### Step 3: Retrieve Configuration for NimbusPost

Get the webhook configuration to share with NimbusPost:

```bash
curl -X GET https://your-domain.com/api/webhooks/nimbuspost-config \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "message": "Provide these details to NimbusPost",
  "configuration": {
    "name": "Coorg Masala NimbusPost Webhook",
    "deliveryUrl": "https://your-domain.com/api/webhooks/receive/nimbuspost",
    "secret": "a7f3e9d2c8b4f6a1e5d9c3b7f2a6e8d4c9b5f1a7e3d9c6b2f8a4e1d7c3b9f5a2",
    "webhookEndpoint": "https://your-domain.com/api/webhooks/receive/nimbuspost",
    "testEndpoint": "https://your-domain.com/api/webhooks/receive/nimbuspost/test"
  }
}
```

### Step 4: Provide Details to NimbusPost

Share the following information with NimbusPost support or configure in their dashboard:

| Field | Value |
|-------|-------|
| **Name** | Coorg Masala NimbusPost Webhook |
| **Delivery URL** | `https://your-domain.com/api/webhooks/receive/nimbuspost` |
| **Secret** | `a7f3e9d2c8b4f6a1e5d9c3b7f2a6e8d4c9b5f1a7e3d9c6b2f8a4e1d7c3b9f5a2` |

---

## 🌐 Environment-Specific URLs

### Local Development
```
http://localhost:5000/api/webhooks/receive/nimbuspost
```

### Staging
```
https://staging.your-domain.com/api/webhooks/receive/nimbuspost
```

### Production
```
https://your-domain.com/api/webhooks/receive/nimbuspost
```

---

## 🔐 Security Considerations

1. **HTTPS Required:** Always use HTTPS in production
2. **Secret Key Security:**
   - Never commit the secret key to version control
   - Store it securely in environment variables or secrets manager
   - Use different secrets for staging and production
3. **Key Rotation:** Change the secret key periodically (every 90 days recommended)
4. **Access Control:** Only share the secret with NimbusPost

---

## 📝 Sample Webhook Payload from NimbusPost

NimbusPost will send payloads in this format:

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

**Headers:**
```
Content-Type: application/json
X-Hmac-SHA256: <base64-encoded-signature>
```

---

## 🧪 Testing the Webhook

### Test 1: Check Endpoint Availability
```bash
curl https://your-domain.com/api/webhooks/receive/nimbuspost/test
```

**Expected Response:**
```json
{
  "message": "NimbusPost webhook endpoint is active",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test 2: Send Test Webhook (Without Signature)

If you haven't configured a secret yet:

```bash
curl -X POST https://your-domain.com/api/webhooks/receive/nimbuspost \
  -H "Content-Type: application/json" \
  -d '{
    "awb_number": "TEST123456789",
    "status": "in transit",
    "event_time": "2024-01-15 10:30:00",
    "location": "Mumbai",
    "message": "Test shipment in transit",
    "rto_awb": ""
  }'
```

### Test 3: Send Test Webhook (With Signature)

Generate HMAC signature:

```javascript
const crypto = require('crypto');

const payload = {
  "awb_number": "TEST123456789",
  "status": "in transit",
  "event_time": "2024-01-15 10:30:00",
  "location": "Mumbai",
  "message": "Test shipment in transit",
  "rto_awb": ""
};

const secret = "a7f3e9d2c8b4f6a1e5d9c3b7f2a6e8d4c9b5f1a7e3d9c6b2f8a4e1d7c3b9f5a2";
const signature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(payload))
  .digest('base64');

console.log('X-Hmac-SHA256:', signature);
```

Then send the request:

```bash
curl -X POST https://your-domain.com/api/webhooks/receive/nimbuspost \
  -H "Content-Type: application/json" \
  -H "X-Hmac-SHA256: YOUR_CALCULATED_SIGNATURE" \
  -d '{
    "awb_number": "TEST123456789",
    "status": "in transit",
    "event_time": "2024-01-15 10:30:00",
    "location": "Mumbai",
    "message": "Test shipment in transit",
    "rto_awb": ""
  }'
```

---

## 📊 Monitoring Webhooks

### View All Webhook Payloads
```bash
curl -X GET "https://your-domain.com/api/webhooks/payloads?limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### View Payloads for Specific AWB
```bash
curl -X GET "https://your-domain.com/api/webhooks/payloads?awbNumber=4152912381315" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### View Failed Payloads
```bash
curl -X GET "https://your-domain.com/api/webhooks/payloads?processed=false" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🔄 Updating Orders with AWB Numbers

Before NimbusPost can send webhooks, orders must have AWB numbers:

```javascript
// When shipping an order, update it with the AWB number
const order = await Order.findById(orderId);
order.deliveryInfo.awbNumber = "4152912381315";
order.deliveryInfo.carrier = "NimbusPost";
order.orderStatus = "shipped";
await order.save();
```

---

## 📱 Customer Tracking Page

Customers can track their shipments at:
```
https://your-domain.com/track/:orderId
```

Example:
```
https://your-domain.com/track/ORD-1234567890
```

This page displays:
- Current shipment status
- Location tracking
- Delivery timeline
- Complete shipment history
- Visual progress indicator

---

## 🆘 Troubleshooting

### Issue: Webhook Not Received

**Possible Causes:**
1. Firewall blocking NimbusPost IPs
2. SSL certificate issues
3. Incorrect URL provided to NimbusPost

**Solution:**
- Verify URL is accessible from internet
- Check server logs for incoming requests
- Test endpoint using curl from external server

### Issue: Signature Verification Failed

**Possible Causes:**
1. Secret key mismatch
2. Payload modification in transit
3. Incorrect signature calculation

**Solution:**
- Verify secret key matches what was provided to NimbusPost
- Check webhook payload logs in database
- Review signature calculation method

### Issue: Order Not Updated

**Possible Causes:**
1. AWB number not set in order
2. AWB number mismatch
3. Database connection issues

**Solution:**
- Verify order has correct AWB number
- Check webhook payload logs
- Review server error logs

---

## 📞 Support Contacts

**For Webhook Issues:**
- Check logs: `/api/webhooks/payloads`
- Review documentation: `NIMBUSPOST_WEBHOOK_SETUP.md`

**For NimbusPost Integration:**
- Contact NimbusPost support
- Provide webhook endpoint URL and secret key
- Share any error messages from their system

---

## 🔒 Security Checklist

- [ ] Generated strong secret key (32+ characters)
- [ ] Stored secret key securely (not in code)
- [ ] Using HTTPS for webhook endpoint
- [ ] Verified signature verification is enabled
- [ ] Tested webhook with sample payload
- [ ] Configured different secrets for staging/production
- [ ] Set up monitoring for failed webhooks
- [ ] Documented secret key location for team

---

## 📅 Maintenance

### Monthly Tasks
- Review webhook payload logs
- Check for failed deliveries
- Monitor signature verification failures

### Quarterly Tasks
- Rotate secret key
- Update NimbusPost with new secret
- Review and optimize webhook processing

### Annual Tasks
- Security audit of webhook implementation
- Performance review
- Update documentation

---

## 📄 Quick Reference

**Webhook Endpoint:**
```
POST https://your-domain.com/api/webhooks/receive/nimbuspost
```

**Test Endpoint:**
```
GET https://your-domain.com/api/webhooks/receive/nimbuspost/test
```

**Admin Config Endpoint:**
```
GET https://your-domain.com/api/webhooks/nimbuspost-config
```

**Payload Logs:**
```
GET https://your-domain.com/api/webhooks/payloads
```

---

**Last Updated:** 2024-01-15
**Version:** 1.0
**Status:** Production Ready ✅
