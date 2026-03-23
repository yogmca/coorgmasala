# Payment Gateway & Database Setup Guide

## 🗄️ Step 1: Install and Start MongoDB

### Option A: Install MongoDB using Homebrew (Recommended for macOS)
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify MongoDB is running
mongosh --eval "db.version()"
```

### Option B: Use MongoDB Atlas (Cloud - Free Tier Available)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster (free tier)
4. Get your connection string
5. Update `backend/.env` with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coorg-spices
   ```

---

## 📦 Step 2: Seed Products to Database

Once MongoDB is running, add sample products:

```bash
cd backend
node seed.js
```

This will add 8 products including:
- Black Pepper (100g & 500g)
- Cinnamon Sticks
- Green Cardamom
- Turmeric Powder
- Dried Ginger
- Coffee Powder (250g & 1kg)

---

## 💳 Step 3: Setup Payment Gateways

Your application supports two payment gateways:

### A. Razorpay (Recommended for India - UPI, Net Banking, Cards)

#### 1. Create Razorpay Account
- Go to https://razorpay.com
- Sign up for a business account
- Complete KYC verification with your business documents

#### 2. Get API Keys
- Login to Razorpay Dashboard
- Go to Settings → API Keys
- Generate Test Keys (for development)
- Generate Live Keys (for production after KYC approval)

#### 3. Link Your Bank Account
- Go to Settings → Bank Account
- Add your bank account details:
  - Account Number
  - IFSC Code
  - Account Holder Name
  - Bank Name
- Upload cancelled cheque or bank statement
- Wait for verification (1-2 business days)

#### 4. Update `.env` file
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

#### 5. Settlement Details
- Razorpay automatically settles payments to your bank account
- Test mode: Instant settlement
- Live mode: T+2 to T+7 days (configurable)
- Settlement charges: 2% + GST per transaction

---

### B. Stripe (International Payments)

#### 1. Create Stripe Account
- Go to https://stripe.com
- Sign up for an account
- Complete business verification

#### 2. Get API Keys
- Login to Stripe Dashboard
- Go to Developers → API Keys
- Copy your Secret Key

#### 3. Link Your Bank Account
- Go to Settings → Bank accounts and scheduling
- Add bank account details:
  - Account Number
  - Routing Number (for US) or IFSC (for India)
  - Account Holder Name
- Verify with micro-deposits or instant verification

#### 4. Update `.env` file
```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

#### 5. Settlement Details
- Automatic payouts to your bank account
- Default: 2-day rolling basis
- Transaction fees: 2.9% + ₹2 per transaction (India)

---

## 🏦 Step 4: Update Your Bank Details in `.env`

Edit `backend/.env` file:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/coorg-spices
JWT_SECRET=your_jwt_secret_key_here

# Payment Gateway Credentials
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_key
RAZORPAY_KEY_ID=rzp_test_your_actual_razorpay_key_id
RAZORPAY_KEY_SECRET=your_actual_razorpay_secret

# Bank Account Details (for reference)
BANK_ACCOUNT_NUMBER=1234567890
BANK_IFSC_CODE=SBIN0001234
BANK_NAME=State Bank of India
```

---

## 🧪 Step 5: Test Payment Integration

### Test with Razorpay (Test Mode)
Use these test card details:
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **OTP**: 123456

### Test with Stripe (Test Mode)
Use these test card details:
- **Card Number**: 4242 4242 4242 4242
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **ZIP**: Any 5 digits

---

## 🚀 Step 6: Start Your Application

### Terminal 1 - Backend
```bash
cd backend
npm start
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

Visit http://localhost:3000 to see your store with products!

---

## 📋 Checklist

- [ ] MongoDB installed and running
- [ ] Products seeded to database
- [ ] Razorpay account created
- [ ] Razorpay KYC completed
- [ ] Bank account linked to Razorpay
- [ ] Razorpay API keys added to `.env`
- [ ] Stripe account created (optional)
- [ ] Bank account linked to Stripe (optional)
- [ ] Stripe API keys added to `.env` (optional)
- [ ] Test payment successful
- [ ] Backend server running
- [ ] Frontend server running

---

## 💡 Important Notes

### For Production (Going Live):

1. **Switch to Live Keys**
   - Replace test keys with live keys in `.env`
   - Never commit `.env` file to Git

2. **Complete KYC**
   - Both Razorpay and Stripe require business verification
   - Prepare documents: PAN, GST, Business registration, Bank statements

3. **Bank Account Verification**
   - Ensure bank account is in the same name as business
   - Keep cancelled cheque ready for verification

4. **Settlement Timeline**
   - Razorpay: 2-7 days after successful payment
   - Stripe: 2-7 days after successful payment
   - Can be configured in dashboard settings

5. **Transaction Fees**
   - Razorpay: ~2% + GST
   - Stripe: ~2.9% + ₹2 per transaction
   - Fees are automatically deducted from settlements

6. **Webhooks** (Recommended)
   - Set up webhooks for payment confirmations
   - Razorpay: Dashboard → Webhooks
   - Stripe: Dashboard → Developers → Webhooks

---

## 🆘 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
brew services list

# Restart MongoDB
brew services restart mongodb-community

# Check MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Payment Gateway Issues
- Verify API keys are correct
- Check if using test/live mode correctly
- Ensure bank account is verified
- Check webhook URLs are accessible

---

## 📞 Support

- **Razorpay Support**: support@razorpay.com
- **Stripe Support**: https://support.stripe.com
- **MongoDB Support**: https://www.mongodb.com/support

---

## 🔐 Security Best Practices

1. Never commit `.env` file to version control
2. Use environment variables for all sensitive data
3. Enable 2FA on payment gateway accounts
4. Regularly rotate API keys
5. Monitor transactions for suspicious activity
6. Use HTTPS in production
7. Implement rate limiting on payment endpoints
