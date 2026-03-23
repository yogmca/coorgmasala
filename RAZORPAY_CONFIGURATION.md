# Razorpay Configuration Guide

## 🔗 Adding Website and App Links in Razorpay

### Step 1: Login to Razorpay Dashboard
1. Go to https://dashboard.razorpay.com
2. Login with your credentials

---

### Step 2: Add Website URL

#### For Test Mode (Development):
1. Click on **Settings** (gear icon) in the left sidebar
2. Go to **Website and App Settings**
3. Under **Website Details**, add:
   - **Website URL**: `http://localhost:3000`
   - **Business Name**: `Coorg Spices`
   - **Business Type**: Select appropriate type (e.g., "E-commerce")
   - **Category**: `Food & Beverages` or `Retail`

#### For Live Mode (Production):
1. Go to **Settings** → **Website and App Settings**
2. Add your production URLs:
   - **Website URL**: `https://yourdomain.com`
   - **Webhook URL**: `https://yourdomain.com/api/webhook/razorpay`

---

### Step 3: Configure Webhook URLs

Webhooks notify your server about payment events in real-time.

1. Go to **Settings** → **Webhooks**
2. Click **+ Add New Webhook**
3. Add webhook details:

#### For Development (Local Testing):
- **Webhook URL**: Use ngrok or similar service
  ```bash
  # Install ngrok
  brew install ngrok
  
  # Start ngrok tunnel
  ngrok http 3001
  
  # Use the HTTPS URL provided by ngrok
  # Example: https://abc123.ngrok.io/api/webhook/razorpay
  ```

#### For Production:
- **Webhook URL**: `https://yourdomain.com/api/webhook/razorpay`

4. Select events to track:
   - ✅ `payment.authorized`
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `order.paid`
   - ✅ `refund.created`

5. **Secret**: Copy the webhook secret and add to your `.env`:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

---

### Step 4: Configure Checkout Settings

1. Go to **Settings** → **Checkout**
2. Configure checkout appearance:
   - **Brand Name**: `Coorg Spices`
   - **Brand Logo**: Upload your logo (recommended: 256x256px PNG)
   - **Brand Color**: Choose your brand color (e.g., `#4CAF50` for green)
   - **Theme**: Light or Dark

3. **Payment Methods**: Enable/disable payment methods
   - ✅ Cards (Credit/Debit)
   - ✅ UPI
   - ✅ Net Banking
   - ✅ Wallets (Paytm, PhonePe, etc.)
   - ✅ EMI (if applicable)

---

### Step 5: Add Authorized Domains

1. Go to **Settings** → **API Keys**
2. Under **Authorized Domains**, add:

#### For Development:
```
http://localhost:3000
http://localhost:3001
http://127.0.0.1:3000
```

#### For Production:
```
https://yourdomain.com
https://www.yourdomain.com
```

---

### Step 6: Configure CORS Settings

1. Go to **Settings** → **API Keys**
2. Under **CORS Settings**, add allowed origins:

#### Development:
```
http://localhost:3000
http://localhost:3001
```

#### Production:
```
https://yourdomain.com
```

---

### Step 7: Update Your Application Configuration

Update your [`backend/.env`](backend/.env) file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

Update your [`frontend/.env`](frontend/.env) file:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

---

### Step 8: Test Payment Integration

#### Test Card Details (Test Mode Only):
- **Card Number**: `4111 1111 1111 1111`
- **CVV**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/25`)
- **Name**: Any name

#### Test UPI (Test Mode Only):
- **UPI ID**: `success@razorpay`
- **OTP**: `123456`

#### Test Net Banking:
- Select any bank
- Use credentials: `test` / `test`

---

### Step 9: Enable Live Mode (Production)

Once testing is complete and KYC is approved:

1. Go to **Settings** → **API Keys**
2. Switch from **Test Mode** to **Live Mode**
3. Generate **Live API Keys**
4. Update your production `.env` with live keys:
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_live_secret_key
   ```

---

## 📱 Mobile App Configuration (Optional)

If you plan to create a mobile app:

### Android App:
1. Go to **Settings** → **Website and App Settings**
2. Under **Android App**, add:
   - **Package Name**: `com.coorgspices.app`
   - **SHA-256 Certificate Fingerprint**: Get from your keystore

### iOS App:
1. Under **iOS App**, add:
   - **Bundle ID**: `com.coorgspices.app`
   - **App Store URL**: Your app's App Store link

---

## 🔐 Security Best Practices

### 1. API Key Security
- ✅ Never expose secret keys in frontend code
- ✅ Only use publishable keys in frontend
- ✅ Store secret keys in environment variables
- ✅ Never commit `.env` files to Git

### 2. Webhook Security
- ✅ Always verify webhook signatures
- ✅ Use HTTPS for webhook URLs
- ✅ Implement IP whitelisting (Razorpay IPs)

### 3. Payment Verification
- ✅ Always verify payments on server-side
- ✅ Never trust client-side payment status
- ✅ Implement idempotency for payment processing

---

## 🌐 Domain Configuration for Production

### Step 1: Purchase Domain
- Use providers like GoDaddy, Namecheap, or Google Domains
- Example: `coorgspices.com`

### Step 2: Deploy Application
Popular hosting options:
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: Heroku, AWS EC2, DigitalOcean, Railway

### Step 3: Configure SSL Certificate
- Use Let's Encrypt (free) or your hosting provider's SSL
- Ensure HTTPS is enabled

### Step 4: Update Razorpay Settings
1. Add production domain to authorized domains
2. Update webhook URL with production domain
3. Switch to live API keys

### Step 5: Update Environment Variables
```env
# Production .env
FRONTEND_URL=https://coorgspices.com
BACKEND_URL=https://api.coorgspices.com
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret
```

---

## 📊 Monitoring and Analytics

### Razorpay Dashboard Features:
1. **Payments**: View all transactions
2. **Settlements**: Track bank settlements
3. **Refunds**: Manage refund requests
4. **Analytics**: View payment trends
5. **Reports**: Download transaction reports

### Enable Email Notifications:
1. Go to **Settings** → **Notifications**
2. Enable notifications for:
   - Payment success
   - Payment failure
   - Refund processed
   - Settlement completed

---

## 🆘 Troubleshooting

### Common Issues:

#### 1. "Invalid API Key" Error
- ✅ Verify you're using correct test/live keys
- ✅ Check if keys are properly set in `.env`
- ✅ Restart your server after updating `.env`

#### 2. "Domain Not Authorized" Error
- ✅ Add your domain to authorized domains
- ✅ Check CORS settings
- ✅ Verify protocol (http vs https)

#### 3. Webhook Not Receiving Events
- ✅ Verify webhook URL is accessible
- ✅ Check webhook secret is correct
- ✅ Use ngrok for local testing
- ✅ Check webhook logs in Razorpay dashboard

#### 4. Payment Failing
- ✅ Verify test card details
- ✅ Check if payment methods are enabled
- ✅ Review error logs in dashboard
- ✅ Ensure amount is in correct format (paise)

---

## 📞 Support

- **Razorpay Support**: support@razorpay.com
- **Documentation**: https://razorpay.com/docs
- **API Reference**: https://razorpay.com/docs/api
- **Community**: https://community.razorpay.com

---

## ✅ Configuration Checklist

- [ ] Razorpay account created
- [ ] Website URL added in settings
- [ ] Webhook URL configured
- [ ] Authorized domains added
- [ ] CORS settings configured
- [ ] API keys added to `.env` files
- [ ] Checkout appearance customized
- [ ] Payment methods enabled
- [ ] Test payment successful
- [ ] KYC documents submitted
- [ ] Bank account linked
- [ ] Production domain configured (when ready)
- [ ] SSL certificate installed (when ready)
- [ ] Live mode enabled (when ready)

---

## 🚀 Quick Start Commands

```bash
# 1. Update environment variables
# Edit backend/.env and frontend/.env with your Razorpay keys

# 2. Start backend
cd backend
npm start

# 3. Start frontend (in new terminal)
cd frontend
npm start

# 4. Test payment
# Visit http://localhost:3000
# Add products to cart
# Proceed to checkout
# Use test card: 4111 1111 1111 1111
```

---

## 📝 Notes

- Test mode allows unlimited test transactions
- Live mode requires KYC approval (1-2 business days)
- Settlement to bank account takes 2-7 days
- Transaction fees: ~2% + GST
- Minimum settlement amount: ₹100
- Maximum transaction limit: ₹1,00,000 (can be increased)
