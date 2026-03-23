# Connect to Your EC2 Instance - CoorgMasala

## Your Instance Details

- **Instance Name**: CoorgMasala
- **Instance ID**: i-0bd02c0c2253f93d3
- **Public IP**: 3.26.91.105
- **SSH Key**: coorgmasala.pem
- **Username**: ubuntu
- **Region**: ap-southeast-2 (Sydney - based on IP)

## ✅ Connection Status

**Good News**: Your EC2 instance is properly configured!
- ✅ SSH port 22 is OPEN
- ✅ HTTP port 80 is OPEN
- ✅ Security group is configured correctly
- ✅ SSH key file found: `coorgmasala.pem`

## 🔐 Connect via SSH

### Step 1: Fix Key Permissions (One-time setup)

```bash
chmod 400 ~/Downloads/coorgmasala.pem
```

### Step 2: Connect to EC2

```bash
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105
```

### Quick Connect (Copy & Paste)

```bash
# Fix permissions and connect in one command
chmod 400 ~/Downloads/coorgmasala.pem && ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105
```

## 🌐 Alternative: EC2 Instance Connect (Browser)

If SSH doesn't work from your network:

1. Go to: https://ap-southeast-2.console.aws.amazon.com/ec2/home?region=ap-southeast-2#Instances:
2. Select instance: **CoorgMasala** (i-0bd02c0c2253f93d3)
3. Click **Connect** button (top right, orange)
4. Select **EC2 Instance Connect** tab
5. Username: `ubuntu`
6. Click **Connect**

This opens a browser-based terminal - no SSH key needed!

## 🚀 After Connecting - Deploy Application

Once you're connected to the EC2 instance, run these commands:

### Option 1: Automated Deployment (Recommended)

```bash
# Download and run deployment script
curl -O https://raw.githubusercontent.com/yogmca/coorgmasala/main/deploy-ec2.sh
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

### Option 2: Manual Deployment

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install other dependencies
sudo apt-get install -y git nginx

# Install PM2 globally
sudo npm install -g pm2

# Clone repository
cd ~
git clone https://github.com/yogmca/coorgmasala.git coorg-spices
cd coorg-spices

# Install backend dependencies
cd backend
npm install --production

# Install frontend dependencies
cd ../frontend
npm install --production

# Build frontend
npm run build

# Configure environment variables (see below)
```

## ⚙️ Configure Environment Variables

### Backend Configuration

```bash
nano ~/coorg-spices/backend/.env
```

Add these values:

```env
PORT=3001
MONGODB_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/coorg-spices
JWT_SECRET=your_secure_random_string_here

# Payment Gateway (Optional)
STRIPE_SECRET_KEY=sk_live_your_stripe_key
RAZORPAY_KEY_ID=rzp_live_your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Bank Details (Optional)
BANK_ACCOUNT_NUMBER=your_account_number
BANK_IFSC_CODE=your_ifsc_code
BANK_NAME=your_bank_name
```

### Frontend Configuration

```bash
nano ~/coorg-spices/frontend/.env
```

Add these values:

```env
REACT_APP_API_URL=http://3.26.91.105/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
REACT_APP_RAZORPAY_KEY_ID=rzp_live_your_razorpay_key
```

## 🗄️ Setup Database

### Seed Initial Data

```bash
cd ~/coorg-spices/backend
node seed.js
```

## 🚦 Start Application

### Using PM2 (Recommended)

```bash
# Start backend
cd ~/coorg-spices/backend
pm2 start server.js --name coorg-backend

# Start frontend (serve build)
cd ~/coorg-spices/frontend
pm2 serve build 3000 --name coorg-frontend --spa

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs
```

### Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/coorg-spices
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name 3.26.91.105;

    # Frontend
    location / {
        root /home/ubuntu/coorg-spices/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /images {
        alias /home/ubuntu/coorg-spices/backend/public/images;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/coorg-spices /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🌍 Access Your Application

Once deployed:

- **Frontend**: http://3.26.91.105
- **Backend API**: http://3.26.91.105/api
- **Health Check**: http://3.26.91.105/api/products

## 📊 Monitoring Commands

### Check Application Status

```bash
# PM2 status
pm2 status
pm2 logs
pm2 monit

# Nginx status
sudo systemctl status nginx

# Check ports
sudo netstat -tlnp | grep -E ':(80|3000|3001)'
```

### View Logs

```bash
# Application logs
pm2 logs coorg-backend
pm2 logs coorg-frontend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### System Resources

```bash
# Disk space
df -h

# Memory usage
free -h

# CPU usage
top

# Running processes
ps aux | grep node
```

## 🔄 Update Application

To update with latest code:

```bash
cd ~/coorg-spices
git pull origin main

# Update backend
cd backend
npm install --production
pm2 restart coorg-backend

# Update frontend
cd ../frontend
npm install --production
npm run build
pm2 restart coorg-frontend
```

## 🛠️ Troubleshooting

### Application Not Accessible

```bash
# Check if services are running
pm2 status

# Restart all services
pm2 restart all

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>

# Restart PM2
pm2 restart all
```

### MongoDB Connection Issues

```bash
# Test MongoDB connection
cd ~/coorg-spices/backend
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"

# Check if MongoDB Atlas allows your EC2 IP
# Add 3.26.91.105 to MongoDB Atlas IP whitelist
```

## 🔒 Security Recommendations

1. **Setup SSL/HTTPS** (Recommended for production)
2. **Restrict SSH access** to your IP only in security group
3. **Use strong passwords** for MongoDB
4. **Enable firewall** on EC2
5. **Regular backups** of database
6. **Keep system updated**: `sudo apt-get update && sudo apt-get upgrade`

## 📚 Additional Resources

- [EC2 Quick Start Guide](EC2_QUICK_START.md)
- [Full Deployment Guide](AWS_EC2_DEPLOYMENT.md)
- [Connection Troubleshooting](EC2_CONNECTION_FIX.md)
- [API Documentation](API_DOCUMENTATION.md)

## 💡 Quick Tips

- **Save your SSH command**: Add alias to `~/.zshrc`:
  ```bash
  echo "alias ec2-coorg='ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105'" >> ~/.zshrc
  source ~/.zshrc
  # Now just type: ec2-coorg
  ```

- **Keep connection alive**: Add to `~/.ssh/config`:
  ```
  Host 3.26.91.105
      HostName 3.26.91.105
      User ubuntu
      IdentityFile ~/Downloads/coorgmasala.pem
      ServerAliveInterval 60
      ServerAliveCountMax 3
  ```
  Then connect with: `ssh 3.26.91.105`

- **Transfer files to EC2**:
  ```bash
  scp -i ~/Downloads/coorgmasala.pem file.txt ubuntu@3.26.91.105:~/
  ```

---

**Your EC2 instance is ready to use!** 🎉

Start by connecting via SSH or EC2 Instance Connect, then run the deployment script.
