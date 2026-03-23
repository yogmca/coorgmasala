# EC2 Server Management Commands

## Server Information
- **EC2 IP**: 3.26.91.105
- **SSH Key**: ~/Downloads/coorgmasala.pem
- **Backend Port**: 3001
- **Frontend Port**: 3000

## Quick Start Commands

### 1. Connect to EC2
```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105
```

### 2. Start Both Servers (Run on EC2)
```bash
# Kill any existing node processes
killall node 2>/dev/null

# Start backend
cd ~/coorg-spices/backend
nohup npm start > backend.log 2>&1 &

# Start frontend
cd ~/coorg-spices/frontend
nohup npm start > frontend.log 2>&1 &

# Check status
sleep 10
ps aux | grep node | grep -v grep
```

### 3. Start Servers from Local Machine (One Command)
```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "killall node 2>/dev/null; cd ~/coorg-spices/backend && nohup npm start > backend.log 2>&1 & cd ~/coorg-spices/frontend && nohup npm start > frontend.log 2>&1 & sleep 10 && ps aux | grep node | grep -v grep"
```

## Environment Configuration

### Frontend .env (Already configured on EC2)
```
REACT_APP_API_URL=http://3.26.91.105:3001/api
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Backend .env (Already configured on EC2)
```
PORT=3001
MONGODB_URI=mongodb+srv://yogemca_db_user:IUsHwPUcgO2UL7LA@cluster0.lqzvstt.mongodb.net/?appName=Cluster0
JWT_SECRET=coorg_spices_production_secret_key_2024_ea94db4e323d352e9604250913fadac5
```

## Monitoring Commands

### Check Server Status
```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "ps aux | grep node | grep -v grep"
```

### Check Listening Ports
```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "ss -tlnp | grep -E ':(3000|3001)'"
```

### View Backend Logs
```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "tail -f ~/coorg-spices/backend/backend.log"
```

### View Frontend Logs
```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "tail -f ~/coorg-spices/frontend/frontend.log"
```

### View Last 50 Lines of Logs
```bash
# Backend
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "tail -50 ~/coorg-spices/backend/backend.log"

# Frontend
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "tail -50 ~/coorg-spices/frontend/frontend.log"
```

## Stop Servers

### Stop All Node Processes
```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "killall node"
```

### Stop Specific Server
```bash
# Stop backend only
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "lsof -ti:3001 | xargs kill -9"

# Stop frontend only
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "lsof -ti:3000 | xargs kill -9"
```

## Update and Restart

### Pull Latest Code and Restart
```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "cd ~/coorg-spices && git pull && killall node 2>/dev/null && cd backend && npm install && nohup npm start > backend.log 2>&1 & cd ../frontend && npm install && nohup npm start > frontend.log 2>&1 &"
```

## Access URLs

- **Frontend**: http://3.26.91.105:3000
- **Backend API**: http://3.26.91.105:3001/api
- **Products API**: http://3.26.91.105:3001/api/products
- **Auth API**: http://3.26.91.105:3001/api/auth

## Features Available

✅ Login/Signup pages
✅ User authentication with JWT
✅ Product catalog
✅ Shopping cart
✅ Checkout process
✅ Order management
✅ User profile

## Troubleshooting

### Frontend not showing Login/Signup
1. Ensure frontend .env has correct API URL
2. Clear browser cache or use incognito mode
3. Check frontend logs for compilation errors
4. Restart frontend server

### Cannot connect to backend
1. Check if backend is running on port 3001
2. Verify MongoDB connection
3. Check backend logs for errors
4. Ensure security group allows inbound traffic on ports 3000 and 3001

### Port already in use
```bash
# Find and kill process using the port
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "lsof -ti:3000 | xargs kill -9"
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105 "lsof -ti:3001 | xargs kill -9"
```
