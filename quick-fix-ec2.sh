#!/bin/bash

# Quick Fix for EC2 - Check .env and restart services
echo "=========================================="
echo "Quick Fix for EC2"
echo "=========================================="

cd /home/ubuntu/coorgmasala || exit 1

echo ""
echo "Step 1: Checking .env file location..."
if [ -f backend/.env ]; then
    echo "✅ backend/.env exists"
    echo "Checking MONGODB_URI..."
    if grep -q "MONGODB_URI" backend/.env; then
        echo "✅ MONGODB_URI found in backend/.env"
    else
        echo "❌ MONGODB_URI not found in backend/.env"
        echo "Please add MONGODB_URI to backend/.env"
        exit 1
    fi
else
    echo "❌ backend/.env not found"
    echo ""
    echo "Please create backend/.env with the required environment variables."
    echo "Refer to backend/.env.example for the template."
    echo ""
    echo "Required variables:"
    echo "  - PORT"
    echo "  - MONGODB_URI"
    echo "  - JWT_SECRET"
    echo "  - NODE_ENV"
    echo "  - RAZORPAY_KEY_ID"
    echo "  - RAZORPAY_KEY_SECRET"
    echo "  - GOOGLE_CLIENT_ID"
    echo "  - GOOGLE_CLIENT_SECRET"
    echo "  - SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS"
    echo "  - ADMIN_BCC_EMAIL"
    echo "  - FRONTEND_URL"
    exit 1
fi

echo ""
echo "Step 2: Stopping PM2 processes..."
pm2 stop all

echo ""
echo "Step 3: Deleting old PM2 processes..."
pm2 delete all

echo ""
echo "Step 4: Starting backend..."
cd backend
pm2 start npm --name backend -- start

echo ""
echo "Step 5: Waiting for backend to start..."
sleep 5

echo ""
echo "Step 6: Checking backend status..."
pm2 logs backend --lines 10 --nostream

echo ""
echo "Step 7: Testing backend API..."
curl -s http://localhost:3001/api/products | head -n 50

echo ""
echo "Step 8: Starting frontend..."
cd ../frontend
pm2 start npm --name frontend -- start

echo ""
echo "Step 9: PM2 Status..."
pm2 status

echo ""
echo "Step 10: Saving PM2 configuration..."
pm2 save

echo ""
echo "=========================================="
echo "Fix Complete!"
echo "=========================================="
echo ""
echo "Check logs: pm2 logs backend"
echo "Test API: curl http://localhost:3001/api/products"
echo ""
