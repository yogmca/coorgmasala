# Fix Flickering and Missing Images

## Problem Summary

Your admin panel and home page are experiencing:
1. **Products flickering** - Infinite re-renders causing products to flash
2. **Missing images** - Products showing placeholder URLs instead of actual images

## Root Causes

1. **Flickering**: Functions in `useEffect` dependencies causing infinite loops
2. **Missing Images**: Database has placeholder URLs like `via.placeholder.com` instead of actual image paths

## Solution

### Files Changed

1. **[`frontend/src/pages/AdminPanel.js`](frontend/src/pages/AdminPanel.js)** - Wrapped `fetchProducts` in `useCallback` + added image upload
2. **[`frontend/src/pages/Home.js`](frontend/src/pages/Home.js)** - Wrapped `loadProducts` in `useCallback`
3. **[`frontend/src/context/AuthContext.js`](frontend/src/context/AuthContext.js)** - Fixed API URL to use relative paths
4. **[`backend/routes/products.js`](backend/routes/products.js)** - Added multer for image uploads
5. **[`backend/package.json`](backend/package.json)** - Added multer dependency
6. **[`backend/fix-product-images.js`](backend/fix-product-images.js)** - Script to fix database images

## Deployment Steps

### Option 1: Automated Script (Recommended)

1. **Upload files to EC2**:
```bash
# From your local machine
scp -i "coorg-spices-key.pem" backend/fix-product-images.js ubuntu@YOUR_EC2_IP:/home/ubuntu/coorg-spices/backend/
scp -i "coorg-spices-key.pem" backend/routes/products.js ubuntu@YOUR_EC2_IP:/home/ubuntu/coorg-spices/backend/routes/
scp -i "coorg-spices-key.pem" backend/package.json ubuntu@YOUR_EC2_IP:/home/ubuntu/coorg-spices/backend/
scp -i "coorg-spices-key.pem" frontend/src/pages/AdminPanel.js ubuntu@YOUR_EC2_IP:/home/ubuntu/coorg-spices/frontend/src/pages/
scp -i "coorg-spices-key.pem" frontend/src/pages/Home.js ubuntu@YOUR_EC2_IP:/home/ubuntu/coorg-spices/frontend/src/pages/
scp -i "coorg-spices-key.pem" frontend/src/context/AuthContext.js ubuntu@YOUR_EC2_IP:/home/ubuntu/coorg-spices/frontend/src/context/
scp -i "coorg-spices-key.pem" fix-flickering-and-images.sh ubuntu@YOUR_EC2_IP:/home/ubuntu/
```

2. **SSH into EC2 and run script**:
```bash
ssh -i "coorg-spices-key.pem" ubuntu@YOUR_EC2_IP
chmod +x ~/fix-flickering-and-images.sh
./fix-flickering-and-images.sh
```

### Option 2: Manual Steps

1. **SSH into EC2**:
```bash
ssh -i "coorg-spices-key.pem" ubuntu@YOUR_EC2_IP
```

2. **Update backend**:
```bash
cd ~/coorg-spices/backend
npm install multer
node fix-product-images.js
pm2 restart coorg-backend
```

3. **Update frontend**:
```bash
cd ~/coorg-spices/frontend
rm -rf build node_modules/.cache
npm run build
pm2 restart coorg-frontend
```

4. **Verify**:
```bash
pm2 status
pm2 logs coorg-backend --lines 20
pm2 logs coorg-frontend --lines 20
```

## Verification

After deployment:

1. **Clear browser cache**: Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Check home page**: Products should load once without flickering
3. **Check admin panel**: Products should load once without flickering
4. **Check images**: Should show actual product images, not placeholders

## What Was Fixed

### 1. Flickering Fix
**Before**:
```javascript
useEffect(() => {
  fetchProducts(); // Function recreated every render
}, [fetchProducts]); // Causes infinite loop
```

**After**:
```javascript
const fetchProducts = useCallback(async () => {
  // ... fetch logic
}, []); // Memoized, won't change

useEffect(() => {
  fetchProducts();
}, [fetchProducts]); // Safe now
```

### 2. Image Fix
**Before** (in database):
```
image: "via.placeholder.com/300x300?text=Coffee%20Powder"
```

**After** (in database):
```
image: "/images/coffee.jpg"
```

### 3. Image Upload Feature
Now admins can upload actual image files instead of just URLs. The image is automatically uploaded when saving a product.

## Troubleshooting

### If flickering persists:
```bash
# Check browser console for errors
# Clear cache again: Ctrl+Shift+R
# Check if frontend rebuilt: ls -la ~/coorg-spices/frontend/build
```

### If images still missing:
```bash
# Check database was updated
cd ~/coorg-spices/backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); const Product = require('./models/Product'); mongoose.connect(process.env.MONGODB_URI).then(async () => { const p = await Product.findOne(); console.log(p.image); process.exit(); });"

# Should show: /images/something.jpg
# Not: via.placeholder.com or placeholder.jpg
```

### If upload fails:
```bash
# Check multer installed
cd ~/coorg-spices/backend
npm list multer

# Check backend logs
pm2 logs coorg-backend --err
```

## Next Steps

After fixing:
1. Test adding a new product with image upload
2. Test editing existing products
3. Verify all images display correctly on home page
4. Check admin panel loads smoothly without flickering
