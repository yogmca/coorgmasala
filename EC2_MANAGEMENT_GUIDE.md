# EC2 Deployment Quick Reference

## 🚀 Your EC2 Instance

- **Instance Name**: CoorgMasala
- **Instance ID**: i-0bd02c0c2253f93d3
- **Public IP**: 3.26.91.105
- **Region**: ap-southeast-2 (Sydney)

## 🌐 Access URLs

- **Frontend**: http://3.26.91.105
- **Backend API**: http://3.26.91.105/api
- **Products API**: http://3.26.91.105/api/products
- **Health Check**: http://3.26.91.105/api/health

## 📦 Deployment Commands

### Deploy from Local Machine

```bash
# Deploy latest code to EC2
./deploy-to-ec2.sh
```

This script will:
1. Upload your local code to EC2
2. Install dependencies
3. Build frontend
4. Seed database
5. Start all servers with PM2
6. Configure Nginx

### Manual Deployment on EC2

```bash
# Connect to EC2
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105

# Run deployment script
cd ~/coorg-spices
./start-ec2-servers.sh
```

## 🔧 Server Management

### PM2 Commands (on EC2)

```bash
# View all processes
pm2 status

# View logs
pm2 logs                    # All logs
pm2 logs coorg-backend      # Backend only
pm2 logs coorg-frontend     # Frontend only

# Restart services
pm2 restart all             # Restart everything
pm2 restart coorg-backend   # Restart backend only
pm2 restart coorg-frontend  # Restart frontend only

# Stop services
pm2 stop all
pm2 stop coorg-backend
pm2 stop coorg-frontend

# Delete processes
pm2 delete all

# Monitor resources
pm2 monit

# Save configuration
pm2 save
```

### Nginx Commands (on EC2)

```bash
# Check status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Test configuration
sudo nginx -t

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### MongoDB Commands (on EC2)

```bash
# Check status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Stop MongoDB
sudo systemctl stop mongod

# Restart MongoDB
sudo systemctl restart mongod

# Connect to MongoDB shell
mongosh

# View databases
mongosh --eval "show dbs"

# View collections in coorg-spices database
mongosh coorg-spices --eval "show collections"

# Count products
mongosh coorg-spices --eval "db.products.countDocuments()"
```

## 🗄️ Database Management

### Seed Database

```bash
# On EC2
cd ~/coorg-spices/backend
node seed.js
```

### Backup Database

```bash
# On EC2
mongodump --db coorg-spices --out ~/backups/$(date +%Y%m%d)
```

### Restore Database

```bash
# On EC2
mongorestore --db coorg-spices ~/backups/20260323/coorg-spices
```

## ⚙️ Configuration Files

### Backend Environment Variables

```bash
# Edit backend .env
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105
nano ~/coorg-spices/backend/.env
```

Required variables:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/coorg-spices
JWT_SECRET=your_secure_jwt_secret
```

After editing:
```bash
pm2 restart coorg-backend
```

### Frontend Environment Variables

```bash
# Edit frontend .env
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105
nano ~/coorg-spices/frontend/.env
```

Required variables:
```env
REACT_APP_API_URL=http://3.26.91.105/api
```

After editing:
```bash
cd ~/coorg-spices/frontend
npm run build
pm2 restart coorg-frontend
```

## 🔄 Update Application

### Quick Update (from local machine)

```bash
# Deploy latest code
./deploy-to-ec2.sh
```

### Manual Update (on EC2)

```bash
# Connect to EC2
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105

# Pull latest code (if using git)
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

## 📊 Monitoring

### Check Application Health

```bash
# From your local machine
curl http://3.26.91.105/api/products

# Check if frontend is accessible
curl -I http://3.26.91.105
```

### System Resources (on EC2)

```bash
# Disk usage
df -h

# Memory usage
free -h

# CPU usage
top

# Running processes
ps aux | grep node

# Network connections
sudo netstat -tlnp | grep -E ':(80|3000|3001|27017)'
```

### View Logs

```bash
# Application logs
pm2 logs

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u mongod -f
```

## 🐛 Troubleshooting

### Application Not Accessible

```bash
# Check if PM2 processes are running
pm2 status

# Check if Nginx is running
sudo systemctl status nginx

# Check if ports are listening
sudo netstat -tlnp | grep -E ':(80|3000|3001)'

# Restart everything
pm2 restart all
sudo systemctl restart nginx
```

### Database Connection Issues

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check MongoDB logs
sudo journalctl -u mongod -n 50

# Restart MongoDB
sudo systemctl restart mongod

# Test connection
mongosh --eval "db.adminCommand('ping')"
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

### Out of Memory

```bash
# Check memory
free -h

# Create swap file (if needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 🔐 Security

### Update System

```bash
# On EC2
sudo apt-get update
sudo apt-get upgrade -y
```

### Firewall Status

```bash
# Check UFW status
sudo ufw status

# Enable firewall
sudo ufw enable

# Allow ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
```

## 📝 Common Tasks

### Add New Product

```bash
# Connect to MongoDB
mongosh coorg-spices

# Insert product
db.products.insertOne({
  name: "New Product",
  description: "Product description",
  price: 299,
  category: "spices",
  stock: 100,
  image: "/images/product.jpg"
})
```

### View All Orders

```bash
mongosh coorg-spices --eval "db.orders.find().pretty()"
```

### Clear Cart Data

```bash
mongosh coorg-spices --eval "db.carts.deleteMany({})"
```

## 🆘 Emergency Commands

### Restart Everything

```bash
# On EC2
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart mongod
```

### Stop Everything

```bash
# On EC2
pm2 stop all
sudo systemctl stop nginx
```

### Check All Services

```bash
# On EC2
echo "=== PM2 Status ==="
pm2 status
echo ""
echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager
echo ""
echo "=== MongoDB Status ==="
sudo systemctl status mongod --no-pager
```

## 📚 Useful Links

- **AWS EC2 Console**: https://ap-southeast-2.console.aws.amazon.com/ec2/
- **Your Instance**: https://ap-southeast-2.console.aws.amazon.com/ec2/home?region=ap-southeast-2#InstanceDetails:instanceId=i-0bd02c0c2253f93d3
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **MongoDB Documentation**: https://www.mongodb.com/docs/

## 💡 Tips

1. **Always save PM2 configuration**: `pm2 save` after making changes
2. **Rebuild frontend after env changes**: `npm run build` in frontend directory
3. **Check logs first**: Most issues can be diagnosed from logs
4. **Backup database regularly**: Use `mongodump` for backups
5. **Monitor disk space**: Run `df -h` regularly
6. **Keep system updated**: Run `sudo apt-get update && sudo apt-get upgrade` monthly

---

**Quick Connect**: `ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105`

**Quick Deploy**: `./deploy-to-ec2.sh`
