#!/bin/bash

# Admin Panel Testing Guide
# This script helps you build and restart the application to test the admin panel

echo "🚀 Admin Panel - Build and Test Guide"
echo "======================================"
echo ""

# Step 1: Create Admin User
echo "📋 Step 1: Create Admin User"
echo "----------------------------"
echo "Running admin creation script..."
cd backend
node create-admin.js
cd ..
echo ""

# Step 2: Build Frontend
echo "📦 Step 2: Build Frontend"
echo "-------------------------"
echo "Building React frontend..."
cd frontend
npm run build
cd ..
echo "✅ Frontend build complete"
echo ""

# Step 3: Restart Backend
echo "🔄 Step 3: Restart Backend"
echo "--------------------------"
echo "Stopping any running backend processes..."
pkill -f "node.*server.js" || true
sleep 2

echo "Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..
echo "✅ Backend started (PID: $BACKEND_PID)"
echo ""

# Step 4: Instructions
echo "📝 Testing Instructions"
echo "----------------------"
echo ""
echo "1. Open browser: http://localhost:5000"
echo ""
echo "2. Click 'Login' and use these credentials:"
echo "   Email: admin@coorgmasala.com"
echo "   Password: Admin@123"
echo ""
echo "3. After login, click your profile dropdown"
echo ""
echo "4. Select 'Admin Panel'"
echo ""
echo "5. You should see the product management interface at:"
echo "   http://localhost:5000/admin"
echo ""
echo "✨ Admin Panel Features to Test:"
echo "   - View all products in table"
echo "   - Click 'Add New Product' button"
echo "   - Fill form and create a product"
echo "   - Click 'Edit' on any product"
echo "   - Modify and save changes"
echo "   - Click 'Delete' to remove a product"
echo ""
echo "⚠️  Note: Backend is running in background (PID: $BACKEND_PID)"
echo "   To stop: kill $BACKEND_PID"
echo ""
echo "======================================"
