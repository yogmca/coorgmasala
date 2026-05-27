# EC2 Emergency Recovery Guide

## 🔴 Issue: Cannot Connect to EC2 After Script Hung

The EC2 instance is likely overloaded from the `npm install` process that hung during frontend dependencies installation.

## 🚨 Immediate Actions

### Option 1: Restart EC2 Instance (AWS Console)

1. **Go to AWS EC2 Console**
   - https://console.aws.amazon.com/ec2/

2. **Find Your Instance**
   - Look for the instance running coorgmasala

3. **Reboot Instance**
   - Select the instance
   - Click "Instance State" → "Reboot instance"
   - Wait 2-3 minutes for it to come back online

4. **Try Connecting Again**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

### Option 2: Stop and Start Instance (If Reboot Doesn't Work)

1. **Stop Instance**
   - Instance State → Stop instance
   - Wait until status shows "Stopped"

2. **Start Instance**
   - Instance State → Start instance
   - Wait until status shows "Running"
   - **Note:** Public IP may change if you don't have Elastic IP

3. **Connect**
   ```bash
   ssh -i your-key.pem ubuntu@NEW-IP-ADDRESS
   ```

## 🛠️ After Reconnecting to EC2

### Step 1: Check What's Running

```bash
# Check if any processes are hung
ps aux | grep npm

# Kill any hung npm processes
pkill -9 npm

# Check PM2 status
pm2 status

# Check system resources
top
# Press 'q' to quit
```

### Step 2: Clean Up and Restart

```bash
cd /home/ubuntu/coorgmasala

# Stop all PM2 processes
pm2 stop all
pm2 delete all

# Kill any processes on ports
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Pull latest code
git pull origin coorgmasala_prod

# Start backend only (skip frontend npm install for now)
cd backend
pm2 start npm --name backend -- start

# Wait and check logs
sleep 5
pm2 logs backend --lines 20 --nostream

# Test backend
curl http://localhost:3001/api/products
```

### Step 3: If Backend Works, Start Frontend

```bash
cd /home/ubuntu/coorgmasala/frontend

# Check if build directory exists
ls -la build/

# If build exists, just start it
pm2 start npm --name frontend -- start

# If build doesn't exist, build it (this may take time)
# Run this in a screen session to prevent hanging:
screen -S frontend-build
npm run build
# Press Ctrl+A then D to detach from screen
# Reconnect with: screen -r frontend-build

# After build completes
pm2 start npm --name frontend -- start
```

### Step 4: Save PM2 Configuration

```bash
pm2 save
pm2 startup
# Follow the command it gives you
```

## 🔍 Troubleshooting

### If Backend Still Won't Start

```bash
# Check .env file exists
ls -la /home/ubuntu/coorgmasala/backend/.env

# Verify MongoDB URI is set
cat /home/ubuntu/coorgmasala/backend/.env | grep MONGODB_URI

# Test MongoDB connection
cd /home/ubuntu/coorgmasala/backend
node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Missing');"

# Check for errors in backend
cd /home/ubuntu/coorgmasala/backend
npm start
# If errors appear, fix them before using PM2
```

### If Frontend Build Fails

```bash
# Skip frontend for now, use backend only
# Frontend can be built later when system is stable

# Or use the existing build if it exists
cd /home/ubuntu/coorgmasala/frontend
if [ -d "build" ]; then
    echo "Build exists, using it"
    pm2 start npm --name frontend -- start
fi
```

## 📊 Check System Resources

```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
top -bn1 | head -20

# If low on disk space, clean npm cache
npm cache clean --force
```

## 🔄 Alternative: Manual Restart Without Scripts

If scripts keep hanging, do it manually:

```bash
cd /home/ubuntu/coorgmasala

# 1. Update code
git pull origin coorgmasala_prod

# 2. Backend only
cd backend
pm2 delete backend 2>/dev/null
pm2 start npm --name backend -- start
pm2 logs backend

# 3. Test
curl http://localhost:3001/api/products

# 4. If backend works, setup webhook
node setup-webhook.js

# 5. Frontend (if needed)
cd ../frontend
pm2 delete frontend 2>/dev/null
pm2 start npm --name frontend -- start

# 6. Save
pm2 save
```

## 🆘 If Nothing Works

### Last Resort: Clean Reinstall

```bash
cd /home/ubuntu/coorgmasala

# Backup .env
cp backend/.env ~/backend.env.backup

# Remove node_modules
rm -rf backend/node_modules
rm -rf frontend/node_modules

# Fresh install backend only
cd backend
npm install --production
pm2 start npm --name backend -- start

# Test
curl http://localhost:3001/api/products
```

## 📞 Prevention for Next Time

1. **Always use `screen` or `tmux` for long-running commands**
   ```bash
   screen -S deployment
   ./your-script.sh
   # Ctrl+A then D to detach
   ```

2. **Monitor resources before running scripts**
   ```bash
   free -h
   df -h
   ```

3. **Use `--production` flag for npm install on production**
   ```bash
   npm install --production
   ```

4. **Build frontend locally and upload build folder**
   - Avoids heavy npm install on EC2
   - Faster deployment

## ✅ Once Everything is Running

```bash
# Setup webhook
cd /home/ubuntu/coorgmasala/backend
node setup-webhook.js

# Copy the secret key and configure NimbusPost
```
