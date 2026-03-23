# Step-by-Step: Deploy Coorg Spices on AWS EC2

## Complete Deployment Steps

Follow these exact steps to deploy the application on your AWS EC2 instance.

---

## STEP 1: Launch EC2 Instance on AWS

1. **Login to AWS Console**: https://console.aws.amazon.com
2. **Go to EC2 Dashboard**: Services → EC2
3. **Click "Launch Instance"**
4. **Configure Instance**:
   - **Name**: `coorg-spices-app`
   - **AMI**: Select **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type**
   - **Instance Type**: Select **t2.small** (or t2.medium for better performance)
   - **Key Pair**: 
     - Click "Create new key pair"
     - Name: `coorg-spices-key`
     - Type: RSA
     - Format: .pem
     - **Download and save the .pem file** (you'll need this!)
   
5. **Network Settings**:
   - Click "Edit"
   - **Auto-assign public IP**: Enable
   - **Firewall (Security Group)**: Create new
   - **Security group name**: `coorg-spices-sg`
   - **Add these rules**:
     - SSH | TCP | 22 | My IP (or 0.0.0.0/0)
     - HTTP | TCP | 80 | 0.0.0.0/0
     - HTTPS | TCP | 443 | 0.0.0.0/0

6. **Storage**: 
   - **Size**: 20 GB
   - **Type**: gp3

7. **Click "Launch Instance"**

8. **Wait for instance to start** (Status: Running)

9. **Note down your EC2 Public IP** (you'll see it in the instance details)

---

## STEP 2: Connect to Your EC2 Instance

### On Mac/Linux:

```bash
# 1. Open Terminal

# 2. Navigate to where you saved the .pem file
cd ~/Downloads

# 3. Set correct permissions on the key file
chmod 400 coorg-spices-key.pem

# 4. Connect to EC2 (replace <EC2-PUBLIC-IP> with your actual IP)
ssh -i coorg-spices-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### On Windows (using PowerShell or Git Bash):

```bash
# 1. Open PowerShell or Git Bash

# 2. Navigate to where you saved the .pem file
cd C:\Users\YourName\Downloads

# 3. Connect to EC2 (replace <EC2-PUBLIC-IP> with your actual IP)
ssh -i coorg-spices-key.pem ubuntu@<EC2-PUBLIC-IP>
```

**Example:**
```bash
ssh -i coorg-spices-key.pem ubuntu@54.123.45.67
```

When prompted "Are you sure you want to continue connecting?", type `yes` and press Enter.

---

## STEP 3: Pull Code from GitHub and Execute Deployment Script

Once connected to your EC2 instance, run these commands **one by one**:

### 3.1 Download the Deployment Script

```bash
curl -O https://raw.githubusercontent.com/yogmca/coorgmasala/main/deploy-ec2.sh
```

### 3.2 Make the Script Executable

```bash
chmod +x deploy-ec2.sh
```

### 3.3 Run the Deployment Script

```bash
./deploy-ec2.sh
```

**What this script does:**
- ✅ Updates Ubuntu system packages
- ✅ Installs Node.js 18.x and npm
- ✅ Installs Git
- ✅ Installs PM2 (process manager)
- ✅ Installs Nginx (web server)
- ✅ Clones your code from GitHub
- ✅ Installs all backend dependencies
- ✅ Installs all frontend dependencies
- ✅ Builds the frontend for production
- ✅ Starts backend server on port 3001
- ✅ Starts frontend server on port 3000
- ✅ Configures Nginx as reverse proxy
- ✅ Sets up firewall rules

**This will take 5-10 minutes to complete.**

---

## STEP 4: Configure Environment Variables

After the script completes, you need to configure your environment variables.

### 4.1 Configure Backend Environment

```bash
nano /home/ubuntu/coorg-spices/backend/.env
```

**Update these values** (use arrow keys to navigate, edit the values):

```env
PORT=3001
MONGODB_URI=mongodb+srv://yogemca_db_user:IUsHwPUcgO2UL7LA@cluster0.lqzvstt.mongodb.net/?appName=Cluster0
JWT_SECRET=coorg_spices_secret_key_2024_secure_random_string

# Payment Gateway Credentials (update with your actual keys)
STRIPE_SECRET_KEY=your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Bank Account Details
BANK_ACCOUNT_NUMBER=your_bank_account_number
BANK_IFSC_CODE=your_bank_ifsc_code
BANK_NAME=your_bank_name
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y` (to confirm)
- Press `Enter`

### 4.2 Configure Frontend Environment

```bash
nano /home/ubuntu/coorg-spices/frontend/.env
```

**Update these values** (replace `<EC2-PUBLIC-IP>` with your actual EC2 IP):

```env
REACT_APP_API_URL=http://<EC2-PUBLIC-IP>/api
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

**Example:**
```env
REACT_APP_API_URL=http://54.123.45.67/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_key
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

---

## STEP 5: Seed the Database

```bash
cd /home/ubuntu/coorg-spices/backend
node seed.js
```

You should see:
```
Connected to MongoDB
✅ 8 products added successfully
```

---

## STEP 6: Rebuild Frontend and Restart Application

```bash
# Rebuild frontend with new environment variables
cd /home/ubuntu/coorg-spices/frontend
npm run build

# Restart all services
pm2 restart all
```

---

## STEP 7: Verify Deployment

### Check if services are running:

```bash
pm2 status
```

You should see:
```
┌─────┬──────────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ status  │ restart │ uptime   │
├─────┼──────────────────┼─────────┼─────────┼──────────┤
│ 0   │ coorg-backend    │ online  │ 0       │ 10s      │
│ 1   │ coorg-frontend   │ online  │ 0       │ 5s       │
└─────┴──────────────────┴─────────┴─────────┴──────────┘
```

### Check logs:

```bash
pm2 logs
```

Press `Ctrl + C` to exit logs.

---

## STEP 8: Access Your Application

Open your web browser and go to:

```
http://<EC2-PUBLIC-IP>
```

**Example:** `http://54.123.45.67`

You should see the Coorg Spices e-commerce website! 🎉

---

## STEP 9: Test the Application

1. **Browse Products**: You should see 8 products (spices)
2. **Add to Cart**: Click "Add to Cart" on any product
3. **View Cart**: Click the cart icon in the header
4. **Test Checkout**: Try the checkout process

---

## Useful Commands

### View Application Logs
```bash
pm2 logs
```

### Restart Application
```bash
pm2 restart all
```

### Stop Application
```bash
pm2 stop all
```

### Check Nginx Status
```bash
sudo systemctl status nginx
```

### View System Resources
```bash
pm2 monit
```

---

## Updating the Application

When you push new code to GitHub, update your EC2 deployment:

```bash
# Download update script
curl -O https://raw.githubusercontent.com/yogmca/coorgmasala/main/update-app.sh
chmod +x update-app.sh

# Run update
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

---

## Troubleshooting

### Problem: Can't access the website

**Solution 1**: Check security group
- Go to AWS Console → EC2 → Security Groups
- Make sure port 80 is open to 0.0.0.0/0

**Solution 2**: Check if services are running
```bash
pm2 status
sudo systemctl status nginx
```

**Solution 3**: Check logs
```bash
pm2 logs
```

### Problem: MongoDB connection error

**Solution**: Verify MongoDB URI in backend/.env
```bash
nano /home/ubuntu/coorg-spices/backend/.env
```

### Problem: Port already in use

**Solution**: Kill the process and restart
```bash
sudo lsof -i :3001
sudo kill -9 <PID>
pm2 restart all
```

---

## Summary of Commands (Quick Reference)

```bash
# 1. Connect to EC2
ssh -i coorg-spices-key.pem ubuntu@<EC2-PUBLIC-IP>

# 2. Deploy application
curl -O https://raw.githubusercontent.com/yogmca/coorgmasala/main/deploy-ec2.sh
chmod +x deploy-ec2.sh
./deploy-ec2.sh

# 3. Configure environment
nano /home/ubuntu/coorg-spices/backend/.env
nano /home/ubuntu/coorg-spices/frontend/.env

# 4. Seed database
cd /home/ubuntu/coorg-spices/backend
node seed.js

# 5. Rebuild and restart
cd /home/ubuntu/coorg-spices/frontend
npm run build
pm2 restart all

# 6. Check status
pm2 status
pm2 logs
```

---

## Next Steps (Optional)

### Setup SSL Certificate (HTTPS)

If you have a domain name:

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Setup Custom Domain

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add an A record pointing to your EC2 Public IP
3. Wait for DNS propagation (5-30 minutes)
4. Access your site at `http://yourdomain.com`

---

## Support

- **GitHub**: https://github.com/yogmca/coorgmasala
- **Issues**: Create an issue on GitHub for help

---

## 🎉 Congratulations!

Your Coorg Spices e-commerce application is now live on AWS EC2!
