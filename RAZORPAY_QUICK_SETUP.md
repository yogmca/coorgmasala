# Razorpay Quick Setup Guide

## 🚀 Quick 5-Minute Setup

### Step 1: Create Razorpay Account (2 minutes)
1. Go to https://dashboard.razorpay.com/signup
2. Sign up with your email
3. Verify your email address
4. Login to the dashboard

### Step 2: Get API Keys (1 minute)
1. In the Razorpay Dashboard, click on **Settings** (gear icon)
2. Go to **API Keys** in the left sidebar
3. Click **Generate Test Key** (for development)
4. You'll see:
   - **Key ID**: `rzp_test_xxxxxxxxxxxxx` (starts with `rzp_test_`)
   - **Key Secret**: Click "Show" to reveal it

⚠️ **Important**: Copy both keys immediately!

### Step 3: Configure Backend (1 minute)
1. Open `backend/.env` file
2. Add your Razorpay keys:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_secret_key_here
   ```
3. Save the file

### Step 4: Configure Frontend (1 minute)
1. Open `frontend/.env` file
2. Add your Razorpay Key ID:
   ```env
   REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   ```
3. Save the file

### Step 5: Restart Servers (30 seconds)
```bash
# Stop both servers (Ctrl+C in each terminal)

# Restart backend
cd backend
npm start

# Restart frontend (in new terminal)
cd frontend
npm start
```

## ✅ Test Your Setup

### Test Payment Details (Test Mode Only):
- **Card Number**: `4111 1111 1111 1111`
- **CVV**: `123`
- **Expiry**: `12/25` (any future date)
- **Name**: Any name

### Test UPI:
- **UPI ID**: `success@razorpay`

## 🔧 Troubleshooting

### Error: "Request failed with status code 400"
**Solution**: Make sure you've:
1. Added both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `backend/.env`
2. Added `REACT_APP_RAZORPAY_KEY_ID` to `frontend/.env`
3. Restarted both servers after updating `.env` files

### Error: "Invalid API Key"
**Solution**: 
1. Verify you copied the correct keys from Razorpay dashboard
2. Make sure there are no extra spaces in the `.env` file
3. Use **Test Mode** keys (starting with `rzp_test_`)

### Payment Not Working
**Solution**:
1. Check browser console for errors (F12)
2. Verify you're using test card details correctly
3. Make sure both servers are running

## 📝 Example .env Files

### backend/.env
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/coorg-spices

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

### frontend/.env
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

## 🎯 Next Steps

Once testing is complete:
1. Submit KYC documents in Razorpay dashboard
2. Wait for approval (1-2 business days)
3. Switch to **Live Mode** and generate live keys
4. Update `.env` files with live keys for production

## 📚 Full Documentation

For detailed configuration including webhooks, domain setup, and production deployment, see:
- [`RAZORPAY_CONFIGURATION.md`](RAZORPAY_CONFIGURATION.md) - Complete configuration guide
- [`PAYMENT_SETUP_GUIDE.md`](PAYMENT_SETUP_GUIDE.md) - Payment integration guide

## 🆘 Need Help?

- **Razorpay Support**: support@razorpay.com
- **Documentation**: https://razorpay.com/docs
- **Test Mode**: Unlimited free test transactions
