#!/bin/bash

#############################################
# Coorg Spices - AWS EC2 Deployment Script
# This script automates the deployment of the Coorg Spices application on AWS EC2
#############################################

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="coorg-spices"
GITHUB_REPO="https://github.com/yogmca/coorgmasala.git"
APP_DIR="/home/ubuntu/$APP_NAME"
BACKEND_PORT=3001
FRONTEND_PORT=3000

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Coorg Spices - EC2 Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to print status messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then 
    print_warning "Please do not run this script as root. Run as ubuntu user."
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Node.js and npm
print_status "Installing Node.js and npm..."
if ! command -v node &> /dev/null; then
    # Install Node.js 18.x LTS
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_status "Node.js $(node -v) installed successfully"
    print_status "npm $(npm -v) installed successfully"
else
    print_status "Node.js $(node -v) already installed"
    print_status "npm $(npm -v) already installed"
fi

# Install Git
print_status "Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git
    print_status "Git installed successfully"
else
    print_status "Git already installed"
fi

# Install PM2 globally
print_status "Installing PM2 process manager..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_status "PM2 installed successfully"
else
    print_status "PM2 already installed"
fi

# Install Nginx
print_status "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx
    print_status "Nginx installed successfully"
else
    print_status "Nginx already installed"
fi

# Clone or update the repository
if [ -d "$APP_DIR" ]; then
    print_status "Application directory exists. Pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main
else
    print_status "Cloning repository from GitHub..."
    git clone "$GITHUB_REPO" "$APP_DIR"
    cd "$APP_DIR"
fi

# Setup Backend
print_status "Setting up backend..."
cd "$APP_DIR/backend"

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install --production

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_warning "Please update the .env file with your actual credentials:"
    print_warning "  - MONGODB_URI"
    print_warning "  - JWT_SECRET"
    print_warning "  - Payment gateway credentials"
    read -p "Press enter to continue after updating .env file..."
fi

# Setup Frontend
print_status "Setting up frontend..."
cd "$APP_DIR/frontend"

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install --production

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_warning "Please update the .env file with your actual credentials"
    read -p "Press enter to continue after updating .env file..."
fi

# Build frontend for production
print_status "Building frontend for production..."
npm run build

# Stop existing PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 delete coorg-backend 2>/dev/null || true
pm2 delete coorg-frontend 2>/dev/null || true

# Start backend with PM2
print_status "Starting backend server with PM2..."
cd "$APP_DIR/backend"
pm2 start server.js --name coorg-backend --time

# Install serve for frontend
print_status "Installing serve package..."
sudo npm install -g serve

# Start frontend with PM2
print_status "Starting frontend server with PM2..."
cd "$APP_DIR/frontend"
pm2 start "serve -s build -l $FRONTEND_PORT" --name coorg-frontend

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on system boot
print_status "Setting up PM2 to start on system boot..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save

# Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
print_status "Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configure firewall (UFW)
print_status "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable || true

# Display status
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${GREEN}Application Status:${NC}"
pm2 status

echo -e "\n${GREEN}Access your application:${NC}"
echo -e "  Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo -e "  Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/api"

echo -e "\n${GREEN}Useful Commands:${NC}"
echo -e "  View logs: ${YELLOW}pm2 logs${NC}"
echo -e "  Restart app: ${YELLOW}pm2 restart all${NC}"
echo -e "  Stop app: ${YELLOW}pm2 stop all${NC}"
echo -e "  Monitor: ${YELLOW}pm2 monit${NC}"

echo -e "\n${GREEN}Next Steps:${NC}"
echo -e "  1. Update environment variables in:"
echo -e "     - $APP_DIR/backend/.env"
echo -e "     - $APP_DIR/frontend/.env"
echo -e "  2. Restart the application: ${YELLOW}pm2 restart all${NC}"
echo -e "  3. (Optional) Setup SSL with Let's Encrypt"
echo -e "\n${GREEN}========================================${NC}"
