# AWS EC2 Deployment Guide for Coorg Spices

This guide provides step-by-step instructions to deploy the Coorg Spices application on AWS EC2.

## Prerequisites

- AWS Account
- Basic knowledge of AWS EC2
- SSH client installed on your local machine
- MongoDB Atlas account (for database)

## Step 1: Launch EC2 Instance

### 1.1 Create EC2 Instance

1. Log in to AWS Console
2. Navigate to EC2 Dashboard
3. Click "Launch Instance"
4. Configure the instance:

   **Instance Details:**
   - **Name**: coorg-spices-app
   - **AMI**: Ubuntu Server 22.04 LTS (HVM), SSD Volume Type
   - **Instance Type**: t2.small or t2.medium (minimum recommended)
   - **Key Pair**: Create new or select existing key pair (download and save the .pem file)

   **Network Settings:**
   - **VPC**: Default VPC
   - **Auto-assign Public IP**: Enable
   - **Security Group**: Create new security group with the following rules:

   | Type | Protocol | Port Range | Source | Description |
   |------|----------|------------|--------|-------------|
   | SSH | TCP | 22 | Your IP | SSH access |
   | HTTP | TCP | 80 | 0.0.0.0/0 | Web access |
   | HTTPS | TCP | 443 | 0.0.0.0/0 | Secure web access |
   | Custom TCP | TCP | 3000 | 0.0.0.0/0 | Frontend (optional) |
   | Custom TCP | TCP | 3001 | 0.0.0.0/0 | Backend API (optional) |

   **Storage:**
   - **Size**: 20 GB (minimum)
   - **Volume Type**: gp3

5. Click "Launch Instance"

### 1.2 Connect to EC2 Instance

Once the instance is running, connect via SSH:

```bash
# Change permissions on your key file
chmod 400 your-key-pair.pem

# Connect to EC2 instance
ssh -i your-key-pair.pem ubuntu@<EC2-PUBLIC-IP>
```

Replace `<EC2-PUBLIC-IP>` with your instance's public IP address.

## Step 2: Deploy Application

### 2.1 Download and Run Deployment Script

Once connected to your EC2 instance:

```bash
# Download the deployment script
curl -O https://raw.githubusercontent.com/yogmca/coorgmasala/main/deploy-ec2.sh

# Make it executable
chmod +x deploy-ec2.sh

# Run the deployment script
./deploy-ec2.sh
```

The script will:
- Install Node.js, npm, Git, PM2, and Nginx
- Clone the repository from GitHub
- Install all dependencies
- Build the frontend
- Configure and start both backend and frontend servers
- Set up Nginx as a reverse proxy
- Configure the firewall

### 2.2 Configure Environment Variables

After the script completes, update the environment variables:

#### Backend Configuration
```bash
nano /home/ubuntu/coorg-spices/backend/.env
```

Update with your actual values:
```env
PORT=3001
MONGODB_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/coorg-spices
JWT_SECRET=your_secure_jwt_secret_key

# Payment Gateway Credentials
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
RAZORPAY_KEY_ID=rzp_live_your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Bank Account Details
BANK_ACCOUNT_NUMBER=your_bank_account_number
BANK_IFSC_CODE=your_bank_ifsc_code
BANK_NAME=your_bank_name
```

#### Frontend Configuration
```bash
nano /home/ubuntu/coorg-spices/frontend/.env
```

Update with your actual values:
```env
REACT_APP_API_URL=http://your-ec2-public-ip/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
REACT_APP_RAZORPAY_KEY_ID=rzp_live_your_razorpay_key_id
```

### 2.3 Seed the Database (First Time Only)

```bash
cd /home/ubuntu/coorg-spices/backend
node seed.js
```

### 2.4 Restart the Application

After updating environment variables:

```bash
# Rebuild frontend with new environment variables
cd /home/ubuntu/coorg-spices/frontend
npm run build

# Restart all services
pm2 restart all
```

## Step 3: Verify Deployment

### 3.1 Check Application Status

```bash
# Check PM2 processes
pm2 status

# View logs
pm2 logs

# Monitor in real-time
pm2 monit
```

### 3.2 Access the Application

Open your browser and navigate to:
- **Frontend**: `http://<EC2-PUBLIC-IP>`
- **Backend API**: `http://<EC2-PUBLIC-IP>/api`

## Step 4: Setup SSL (Optional but Recommended)

### 4.1 Install Certbot

```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

### 4.2 Obtain SSL Certificate

First, point your domain to your EC2 instance's public IP, then:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts to complete the SSL setup.

### 4.3 Auto-renewal

Certbot automatically sets up auto-renewal. Test it with:

```bash
sudo certbot renew --dry-run
```

## Step 5: Monitoring and Maintenance

### Useful PM2 Commands

```bash
# View all processes
pm2 list

# View logs
pm2 logs
pm2 logs coorg-backend
pm2 logs coorg-frontend

# Restart services
pm2 restart all
pm2 restart coorg-backend
pm2 restart coorg-frontend

# Stop services
pm2 stop all

# Delete processes
pm2 delete all

# Monitor resources
pm2 monit

# Save current process list
pm2 save
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

### System Monitoring

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check running processes
ps aux | grep node
```

## Step 6: Updating the Application

To update the application with new code:

```bash
# Navigate to app directory
cd /home/ubuntu/coorg-spices

# Pull latest changes
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

## Troubleshooting

### Application Not Accessible

1. Check security group rules in AWS Console
2. Verify Nginx is running: `sudo systemctl status nginx`
3. Check PM2 processes: `pm2 status`
4. View logs: `pm2 logs`

### MongoDB Connection Issues

1. Verify MongoDB URI in `.env` file
2. Check MongoDB Atlas IP whitelist (add EC2 public IP or allow 0.0.0.0/0)
3. Test connection: `cd backend && node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"`

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3001
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Restart PM2
pm2 restart all
```

### Out of Memory

If the instance runs out of memory, create a swap file:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Cost Optimization

### EC2 Instance Types

- **Development/Testing**: t2.micro (free tier eligible)
- **Small Production**: t2.small or t3.small
- **Medium Production**: t2.medium or t3.medium
- **High Traffic**: t3.large or higher

### Reserved Instances

For long-term deployments, consider Reserved Instances for cost savings.

### Auto Scaling (Advanced)

For high-traffic applications, set up Auto Scaling Groups with Load Balancers.

## Security Best Practices

1. **Keep System Updated**
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

2. **Use Environment Variables**: Never commit sensitive data to Git

3. **Enable HTTPS**: Always use SSL in production

4. **Restrict SSH Access**: Limit SSH to specific IP addresses

5. **Regular Backups**: Set up automated backups for your database

6. **Monitor Logs**: Regularly check application and system logs

7. **Use IAM Roles**: Instead of storing AWS credentials on EC2

## Support

For issues or questions:
- GitHub Repository: https://github.com/yogmca/coorgmasala
- Create an issue on GitHub for bug reports or feature requests

## Additional Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
