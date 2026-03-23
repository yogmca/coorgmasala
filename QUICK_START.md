# 🚀 Quick Start Guide - Coorg Spices

## Prerequisites Check
- [ ] Node.js installed (v14+)
- [ ] MongoDB installed or MongoDB Atlas account
- [ ] Terminal/Command Prompt access

## 5-Minute Setup

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Backend
```bash
# Copy environment file
cp .env.example .env

# Edit .env and set:
# - MONGODB_URI (use mongodb://localhost:27017/coorg-spices for local)
# - Keep other defaults for testing
```

### Step 3: Seed Database
```bash
node seed.js
```
✅ This adds 8 sample spice products to your database

### Step 4: Start Backend Server
```bash
npm start
```
✅ Backend running at http://localhost:5000

### Step 5: Install Frontend Dependencies (New Terminal)
```bash
cd frontend
npm install
```

### Step 6: Configure Frontend
```bash
# Copy environment file
cp .env.example .env

# Edit .env and set:
# REACT_APP_API_URL=http://localhost:5000/api
```

### Step 7: Start Frontend
```bash
npm start
```
✅ Frontend running at http://localhost:3000

## 🎉 You're Ready!

Open http://localhost:3000 in your browser and:
1. Browse spices
2. Add items to cart
3. Go through checkout
4. Test payment flow (demo mode)

## 📝 Quick Test Checklist

- [ ] Can see 8 products on home page
- [ ] Can filter by Spices/Coffee
- [ ] Can add items to cart
- [ ] Cart badge shows item count
- [ ] Can update quantities in cart
- [ ] Can proceed to checkout
- [ ] Can fill customer information
- [ ] Can enter shipping address
- [ ] Can select payment method
- [ ] Order success page shows after payment

## 🔧 Troubleshooting

### Backend won't start?
- Check if MongoDB is running
- Verify port 5000 is not in use
- Check .env file configuration

### Frontend won't start?
- Check if port 3000 is available
- Verify backend is running
- Check REACT_APP_API_URL in .env

### No products showing?
- Run `node seed.js` in backend directory
- Check MongoDB connection
- Check browser console for errors

### Payment not working?
- This is demo mode - payment is simulated
- For real payments, add Stripe/Razorpay keys to .env

## 📱 Next Steps

1. **Add Real Images**: Place product images in `backend/public/images/`
2. **Configure Payments**: Add real Stripe/Razorpay credentials
3. **Customize Products**: Edit products in MongoDB or via API
4. **Deploy**: Follow deployment guide in README.md

## 🆘 Need Help?

- Check [README.md](./README.md) for detailed documentation
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API reference
- Review error messages in terminal/console
- Ensure all environment variables are set

---

**Happy Coding! 🌶️**
