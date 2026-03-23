#!/bin/bash

# Coorg Spices EC2 Deployment Script
# This script deploys and starts the application on EC2

set -e  # Exit on any error

echo "=========================================="
echo "Coorg Spices EC2 Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if running on EC2
print_info "Checking environment..."
if [ ! -f /sys/hypervisor/uuid ] || ! grep -q ec2 /sys/hypervisor/uuid 2>/dev/null; then
    print_info "Note: This doesn't appear to be an EC2 instance, but continuing anyway..."
fi

# Update system packages
print_info "Updating system packages..."
sudo apt-get update -qq
print_success "System packages updated"

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    print_info "Installing Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_success "Node.js already installed: $(node --version)"
fi

# Install Git if not installed
if ! command -v git &> /dev/null; then
    print_info "Installing Git..."
    sudo apt-get install -y git
    print_success "Git installed"
else
    print_success "Git already installed"
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    print_info "Installing PM2..."
    sudo npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 already installed"
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    print_info "Installing Nginx..."
    sudo apt-get install -y nginx
    print_success "Nginx installed"
else
    print_success "Nginx already installed"
fi

# Install MongoDB if not installed
if ! command -v mongod &> /dev/null; then
    print_info "Installing MongoDB..."
    
    # Import MongoDB public GPG key
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # Create list file for MongoDB
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Update package database
    sudo apt-get update -qq
    
    # Install MongoDB
    sudo apt-get install -y mongodb-org
    
    # Start MongoDB
    sudo systemctl start mongod
    sudo systemctl enable mongod
    
    print_success "MongoDB installed and started"
else
    print_success "MongoDB already installed"
    
    # Ensure MongoDB is running
    if ! sudo systemctl is-active --quiet mongod; then
        print_info "Starting MongoDB..."
        sudo systemctl start mongod
        sudo systemctl enable mongod
        print_success "MongoDB started"
    else
        print_success "MongoDB is running"
    fi
fi

# Wait for MongoDB to be ready
print_info "Waiting for MongoDB to be ready..."
sleep 3
print_success "MongoDB is ready"

# Clone or update repository
APP_DIR="$HOME/coorg-spices"
if [ -d "$APP_DIR" ]; then
    print_info "Application directory exists, pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main || print_info "Could not pull latest changes (continuing with existing code)"
else
    print_info "Cloning repository..."
    git clone https://github.com/yogmca/coorgmasala.git "$APP_DIR" || {
        print_error "Failed to clone repository"
        print_info "Creating directory structure manually..."
        mkdir -p "$APP_DIR"
    }
    cd "$APP_DIR"
fi

print_success "Application directory ready: $APP_DIR"

# Install backend dependencies
print_info "Installing backend dependencies..."
cd "$APP_DIR/backend"
npm install --production
print_success "Backend dependencies installed"

# Install frontend dependencies (need all deps for build)
print_info "Installing frontend dependencies..."
cd "$APP_DIR/frontend"
npm install
print_success "Frontend dependencies installed"

# Create backend .env if it doesn't exist
if [ ! -f "$APP_DIR/backend/.env" ]; then
    print_info "Creating backend .env file..."
    cat > "$APP_DIR/backend/.env" << 'EOF'
PORT=3001
MONGODB_URI=mongodb://localhost:27017/coorg-spices
JWT_SECRET=your_jwt_secret_change_this_in_production

# Payment Gateway (Optional - configure if needed)
# STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
# RAZORPAY_KEY_ID=rzp_live_your_razorpay_key_id
# RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Bank Details (Optional)
# BANK_ACCOUNT_NUMBER=your_bank_account_number
# BANK_IFSC_CODE=your_bank_ifsc_code
# BANK_NAME=your_bank_name
EOF
    print_success "Backend .env created (please update with your values)"
    print_info "Edit: nano $APP_DIR/backend/.env"
else
    print_success "Backend .env already exists"
fi

# Create frontend .env if it doesn't exist
if [ ! -f "$APP_DIR/frontend/.env" ]; then
    print_info "Creating frontend .env file..."
    # Get EC2 public IP
    EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "YOUR_EC2_IP")
    cat > "$APP_DIR/frontend/.env" << EOF
REACT_APP_API_URL=http://${EC2_IP}/api
# REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
# REACT_APP_RAZORPAY_KEY_ID=rzp_live_your_razorpay_key_id
EOF
    print_success "Frontend .env created with API URL: http://${EC2_IP}/api"
else
    print_success "Frontend .env already exists"
fi

# Build frontend
print_info "Building frontend for production..."
cd "$APP_DIR/frontend"
npm run build
print_success "Frontend built successfully"

# Stop existing PM2 processes
print_info "Stopping existing PM2 processes..."
pm2 delete all 2>/dev/null || print_info "No existing PM2 processes to stop"

# Seed database with initial data
print_info "Seeding database with initial product data..."
cd "$APP_DIR/backend"
if node seed.js; then
    print_success "Database seeded successfully"
else
    print_info "Database seeding skipped (may already have data)"
fi

# Start backend with PM2
print_info "Starting backend server..."
cd "$APP_DIR/backend"
pm2 start server.js --name coorg-backend
print_success "Backend server started on port 3001"

# Start frontend with PM2 (serve build folder)
print_info "Starting frontend server..."
cd "$APP_DIR/frontend"
pm2 serve build 3000 --name coorg-frontend --spa
print_success "Frontend server started on port 3000"

# Save PM2 configuration
pm2 save
print_success "PM2 configuration saved"

# Setup PM2 to start on boot
print_info "Configuring PM2 to start on system boot..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
print_success "PM2 startup configured"

# Configure Nginx
print_info "Configuring Nginx..."
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "localhost")

sudo tee /etc/nginx/sites-available/coorg-spices > /dev/null << EOF
server {
    listen 80;
    server_name $EC2_IP;

    # Frontend
    location / {
        root $APP_DIR/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static images
    location /images {
        alias $APP_DIR/backend/public/images;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/coorg-spices /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_info "Testing Nginx configuration..."
sudo nginx -t
print_success "Nginx configuration is valid"

# Restart Nginx
print_info "Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx
print_success "Nginx restarted and enabled"

# Configure firewall (UFW)
print_info "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Frontend (optional)
sudo ufw allow 3001/tcp  # Backend (optional)
print_success "Firewall configured"

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
print_success "Application Status:"
echo ""
pm2 status
echo ""
print_success "Access your application:"
echo "  Frontend: http://$EC2_IP"
echo "  Backend API: http://$EC2_IP/api"
echo "  Health Check: http://$EC2_IP/api/products"
echo ""
print_info "Useful Commands:"
echo "  pm2 status          - Check application status"
echo "  pm2 logs            - View application logs"
echo "  pm2 restart all     - Restart all services"
echo "  pm2 monit           - Monitor resources"
echo "  sudo systemctl status nginx - Check Nginx status"
echo ""
print_info "Configuration Files:"
echo "  Backend .env: $APP_DIR/backend/.env"
echo "  Frontend .env: $APP_DIR/frontend/.env"
echo "  Nginx config: /etc/nginx/sites-available/coorg-spices"
echo ""
print_info "Next Steps:"
echo "  1. Update MongoDB URI in backend/.env"
echo "  2. Update payment gateway credentials (if needed)"
echo "  3. Seed database: cd $APP_DIR/backend && node seed.js"
echo "  4. Rebuild frontend if env changed: cd $APP_DIR/frontend && npm run build && pm2 restart coorg-frontend"
echo ""
