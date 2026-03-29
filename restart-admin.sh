#!/bin/bash

echo "🔄 Restarting Application with Admin Panel"
echo "==========================================="
echo ""

# Step 1: Stop existing processes
echo "🛑 Step 1: Stopping existing processes..."
echo "----------------------------------------"

# Kill backend on port 3001
echo "Stopping backend (port 3001)..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No process on port 3001"

# Kill any node server.js processes
pkill -f "node.*server.js" 2>/dev/null || echo "No server.js processes found"

sleep 2
echo "✅ Processes stopped"
echo ""

# Step 2: Create admin user
echo "👤 Step 2: Creating admin user..."
echo "---------------------------------"
cd backend
node create-admin.js
cd ..
echo ""

# Step 3: Start backend
echo "🚀 Step 3: Starting backend..."
echo "------------------------------"
cd backend
npm start &
BACKEND_PID=$!
cd ..
echo "✅ Backend started (PID: $BACKEND_PID)"
sleep 3
echo ""

# Step 4: Build frontend
echo "📦 Step 4: Building frontend..."
echo "-------------------------------"
cd frontend
npm run build
cd ..
echo "✅ Frontend built"
echo ""

# Step 5: Testing instructions
echo "✨ Admin Panel Ready!"
echo "===================="
echo ""
echo "🌐 Access the application:"
echo "   http://localhost:5000"
echo ""
echo "🔐 Admin Login Credentials:"
echo "   Email: admin@coorgmasala.com"
echo "   Password: Admin@123"
echo ""
echo "📋 Steps to test:"
echo "   1. Open http://localhost:5000 in browser"
echo "   2. Click 'Login'"
echo "   3. Enter admin credentials above"
echo "   4. Click profile dropdown (top right)"
echo "   5. Select 'Admin Panel'"
echo "   6. Manage products at /admin"
echo ""
echo "🎯 Features to test:"
echo "   ✓ View all products"
echo "   ✓ Add new product"
echo "   ✓ Edit existing product"
echo "   ✓ Delete product"
echo "   ✓ Update stock levels"
echo ""
echo "⚠️  Backend PID: $BACKEND_PID"
echo "   To stop: kill $BACKEND_PID"
echo ""
echo "==========================================="
