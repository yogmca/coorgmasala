# Quick Start - AWS EC2 Deployment

This guide will help you quickly deploy the Coorg Spices application on AWS EC2.

## 🚀 One-Command Deployment

Once you have your EC2 instance running and connected via SSH:

```bash
curl -O https://raw.githubusercontent.com/yogmca/coorgmasala/main/deploy-ec2.sh && chmod +x deploy-ec2.sh && ./deploy-ec2.sh
```

This single command will:
- ✅ Install all required packages (Node.js, npm, Git, PM2, Nginx)
- ✅ Clone the repository from GitHub
- ✅ Install all dependencies
- ✅ Build the frontend for production
- ✅ Start both backend and frontend servers
- ✅ Configure Nginx as reverse proxy
- ✅ Set up firewall rules

## 📋 Prerequisites

### AWS EC2 Instance Requirements

**Minimum Specifications:**
- **Instance Type**: t2.small (1 vCPU, 2 GB RAM)
- **OS**: Ubuntu Server 22.04 LTS
- **Storage**: 20 GB
- **Security Group Rules**:
  - SSH (22) - Your IP
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0

### Required Services

- **MongoDB Atlas** account (free tier available)
- **Payment Gateway** accounts (optional):
  - Stripe account
  - Razorpay account

## 🔧 Step-by-Step Setup

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Ubuntu Server 22.04 LTS**
3. Select **t2.small** or larger
4. Configure security group with ports: 22, 80, 443
5. Download your key pair (.pem file)
6. Launch instance

### Step 2: Connect to EC2

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### Step 3: Run Deployment Script

```bash
# Download and run the deployment script
curl -O https://raw.githubusercontent.com/yogmca/coorgmasala/main/deploy-ec2.sh
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

### Step 4: Configure Environment Variables

#### Backend Configuration
```bash
nano /home/ubuntu/coorg-spices/backend/.env
```

Update these values:
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/coorg-spices
JWT_SECRET=your_secure_random_string
STRIPE_SECRET_KEY=sk_live_your_key
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_secret
```

#### Frontend Configuration
```bash
nano /home/ubuntu/coorg-spices/frontend/.env
```

Update these values:
```env
REACT_APP_API_URL=http://your-ec2-ip/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_key
REACT_APP_RAZORPAY_KEY_ID=rzp_live_your_key
```

### Step 5: Seed Database (First Time Only)

```bash
cd /home/ubuntu/coorg-spices/backend
node seed.js
```

### Step 6: Rebuild and Restart

```bash
cd /home/ubuntu/coorg-spices/frontend
npm run build
pm2 restart all
```

### Step 7: Access Your Application

Open browser: `http://<EC2-PUBLIC-IP>`

## 🔄 Updating the Application

To update with latest code from GitHub:

```bash
curl -O https://raw.githubusercontent.com/yogmca/coorgmasala/main/update-app.sh
chmod +x update-app.sh
./update-app.sh
```

Or manually:
```bash
cd /home/ubuntu/coorg-spices
git pull origin main
cd backend && npm install --production
cd ../frontend && npm install --production && npm run build
pm2 restart all
```

## 📊 Monitoring

### Check Application Status
```bash
pm2 status
pm2 logs
pm2 monit
```

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t
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

## 🔒 Setup SSL (Recommended)

### Prerequisites
- Domain name pointing to your EC2 IP

### Install Certbot
```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

### Obtain Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically configure Nginx for HTTPS.

## 🛠️ Useful Commands

### PM2 Commands
```bash
pm2 list                    # List all processes
pm2 restart all            # Restart all processes
pm2 stop all               # Stop all processes
pm2 delete all             # Delete all processes
pm2 logs                   # View logs
pm2 monit                  # Monitor resources
pm2 save                   # Save process list
```

### System Commands
```bash
df -h                      # Check disk space
free -h                    # Check memory
top                        # Check CPU usage
sudo systemctl restart nginx  # Restart Nginx
```

## 🐛 Troubleshooting

### Application Not Accessible
1. Check security group allows port 80
2. Verify Nginx is running: `sudo systemctl status nginx`
3. Check PM2 processes: `pm2 status`
4. View logs: `pm2 logs`

### MongoDB Connection Failed
1. Verify MONGODB_URI in `.env`
2. Check MongoDB Atlas IP whitelist
3. Test connection from EC2

### Port Already in Use
```bash
sudo lsof -i :3001
sudo kill -9 <PID>
pm2 restart all
```

### Out of Memory
Create swap file:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 💰 Cost Estimation

### EC2 Instance Costs (Monthly)
- **t2.micro** (Free Tier): $0 (first 12 months)
- **t2.small**: ~$17/month
- **t2.medium**: ~$34/month

### Additional Costs
- **Data Transfer**: First 1 GB free, then $0.09/GB
- **EBS Storage**: $0.10/GB-month
- **Elastic IP**: Free when attached to running instance

### MongoDB Atlas
- **Free Tier**: 512 MB storage (sufficient for small apps)
- **Shared Cluster**: Starting at $9/month

## 📚 Documentation

- [Full AWS EC2 Deployment Guide](AWS_EC2_DEPLOYMENT.md)
- [General Deployment Guide](DEPLOYMENT_GUIDE.md)
- [API Documentation](API_DOCUMENTATION.md)
- [README](README.md)

## 🔗 Links

- **GitHub Repository**: https://github.com/yogmca/coorgmasala
- **Deployment Package**: Available in releases

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section

## ✅ Checklist

Before going live:
- [ ] EC2 instance launched and accessible
- [ ] Deployment script executed successfully
- [ ] Environment variables configured
- [ ] Database seeded
- [ ] Application accessible via browser
- [ ] SSL certificate installed (recommended)
- [ ] Payment gateways configured (if using)
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Security group properly configured

## 🎉 Success!

Your Coorg Spices e-commerce application should now be running on AWS EC2!

Access it at: `http://<your-ec2-ip>` or `https://<your-domain>` (if SSL configured)
