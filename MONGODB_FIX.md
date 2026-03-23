# MongoDB Atlas Connection Fix

## Problem
Products are not displaying because the backend cannot connect to MongoDB Atlas. The error indicates:
```
Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Solution Options

### Option 1: Whitelist Your IP Address in MongoDB Atlas (Recommended for Production)

1. **Go to MongoDB Atlas Dashboard**
   - Visit: https://cloud.mongodb.com/
   - Log in with your credentials

2. **Navigate to Network Access**
   - Click on "Network Access" in the left sidebar
   - Click "Add IP Address" button

3. **Add Your Current IP**
   - Click "Add Current IP Address" (recommended)
   - OR click "Allow Access from Anywhere" (0.0.0.0/0) for development only
   - Click "Confirm"

4. **Wait for Changes to Apply**
   - It may take 1-2 minutes for the changes to propagate

5. **Restart Backend Server**
   ```bash
   cd backend
   node server.js
   ```

6. **Seed the Database**
   ```bash
   cd backend
   node seed.js
   ```

### Option 2: Allow Access from Anywhere (Quick Fix for Development)

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
4. Enter `0.0.0.0/0` in the IP Address field
5. Click "Confirm"
6. Restart backend and run seed script

**⚠️ Warning:** This option is less secure and should only be used for development.

### Option 3: Use Local MongoDB (Alternative)

If you prefer to use a local MongoDB instance:

1. **Install MongoDB Community Edition**
   ```bash
   # For macOS using Homebrew
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Start MongoDB
   brew services start mongodb-community
   ```

2. **Update backend/.env**
   ```env
   MONGODB_URI=mongodb://localhost:27017/coorg-spices
   ```

3. **Restart Backend and Seed**
   ```bash
   cd backend
   node server.js
   ```
   
   In another terminal:
   ```bash
   cd backend
   node seed.js
   ```

## Verification Steps

After applying any of the above solutions:

1. **Check if backend connects to MongoDB**
   - Look for "MongoDB connected successfully" in the backend terminal

2. **Seed the database**
   ```bash
   cd backend
   node seed.js
   ```
   - You should see: "Sample products added successfully"

3. **Test the API**
   ```bash
   curl http://localhost:3001/api/products
   ```
   - You should see a JSON response with products

4. **Check the frontend**
   - Open http://localhost:3000 in your browser
   - Products should now be displayed

## Current Status

- ✅ Backend server is running on port 3001
- ✅ Frontend is configured to connect to backend
- ❌ MongoDB Atlas connection is blocked (IP not whitelisted)
- ❌ Database is not seeded with products

## Next Steps

1. Choose one of the solution options above
2. Apply the fix
3. Restart the backend server
4. Run the seed script
5. Verify products are displaying on the frontend
