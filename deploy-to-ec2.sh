#!/bin/bash

# Deploy Local Code to EC2 and Start Servers
# This script uploads your local code to EC2 and starts the application

set -e

echo "=========================================="
echo "Deploy Coorg Spices to EC2"
echo "=========================================="
echo ""

# Configuration
EC2_IP="3.26.91.105"
EC2_USER="ubuntu"
KEY_FILE="$HOME/Downloads/coorgmasala.pem"
LOCAL_DIR="$(pwd)"
REMOTE_DIR="/home/ubuntu/coorg-spices"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${YELLOW}→ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    print_error "SSH key not found: $KEY_FILE"
    echo "Please ensure coorgmasala.pem is in ~/Downloads/"
    exit 1
fi

# Fix key permissions
chmod 400 "$KEY_FILE"
print_success "SSH key permissions set"

# Test connection
print_info "Testing connection to EC2..."
if ssh -i "$KEY_FILE" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" "echo 'Connected'" &>/dev/null; then
    print_success "Connection successful"
else
    print_error "Cannot connect to EC2 instance"
    echo "Please check:"
    echo "  1. EC2 instance is running"
    echo "  2. Security group allows SSH from your IP"
    echo "  3. Key file is correct"
    exit 1
fi

# Create remote directory
print_info "Creating remote directory..."
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_IP" "mkdir -p $REMOTE_DIR"
print_success "Remote directory ready"

# Create .rsyncignore file
cat > /tmp/.rsyncignore << 'EOF'
node_modules/
.git/
.env
*.log
.DS_Store
build/
dist/
coverage/
.vscode/
.idea/
*.pem
*.tar.gz
payload-discovery-results/
*.pptx
EOF

# Upload code to EC2
print_info "Uploading code to EC2 (this may take a minute)..."
rsync -avz --progress \
    --exclude-from=/tmp/.rsyncignore \
    -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
    "$LOCAL_DIR/" "$EC2_USER@$EC2_IP:$REMOTE_DIR/"
print_success "Code uploaded successfully"

# Upload deployment script
print_info "Uploading deployment script..."
scp -i "$KEY_FILE" -o StrictHostKeyChecking=no \
    "$LOCAL_DIR/start-ec2-servers.sh" \
    "$EC2_USER@$EC2_IP:$REMOTE_DIR/"
print_success "Deployment script uploaded"

# Run deployment on EC2
print_info "Running deployment on EC2..."
echo ""
echo "=========================================="
echo "EC2 Deployment Output:"
echo "=========================================="
echo ""

ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" << 'ENDSSH'
cd ~/coorg-spices
chmod +x start-ec2-servers.sh
./start-ec2-servers.sh
ENDSSH

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
print_success "Your application is now running on EC2"
echo ""
echo "Access URLs:"
echo "  Frontend:    http://$EC2_IP"
echo "  Backend API: http://$EC2_IP/api"
echo "  Products:    http://$EC2_IP/api/products"
echo ""
print_info "To view logs:"
echo "  ssh -i $KEY_FILE $EC2_USER@$EC2_IP"
echo "  pm2 logs"
echo ""
print_info "To update environment variables:"
echo "  ssh -i $KEY_FILE $EC2_USER@$EC2_IP"
echo "  nano ~/coorg-spices/backend/.env"
echo "  nano ~/coorg-spices/frontend/.env"
echo "  cd ~/coorg-spices/frontend && npm run build"
echo "  pm2 restart all"
echo ""
