#!/bin/bash

echo "🔍 Fixing port 3001 conflict on EC2 server..."
echo ""

# SSH into EC2 and fix the port conflict
ssh -i "coorg-spices-key.pem" ubuntu@ec2-54-177-136-15.us-west-1.compute.amazonaws.com << 'ENDSSH'

echo "📍 Checking what's running on port 3001..."
sudo lsof -i :3001

echo ""
echo "🛑 Killing process on port 3001..."
sudo kill -9 $(sudo lsof -t -i:3001) 2>/dev/null || echo "No process found or already killed"

echo ""
echo "✅ Port 3001 is now free"
echo ""
echo "🚀 Starting backend server..."
cd /home/ubuntu/coorg-spices/backend

# Start the backend server
npm start

ENDSSH

echo ""
echo "✅ Done! Backend should now be running on port 3001"
