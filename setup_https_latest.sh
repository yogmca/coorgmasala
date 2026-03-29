#!/bin/bash

# Setup HTTPS/SSL for coorgmasala.com
# This script installs and configures SSL certificate using Let's Encrypt

echo "=========================================="
echo "HTTPS/SSL Setup for coorgmasala.com"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

CURRENT_IP=$(curl -s ifconfig.me)
DOMAIN="coorgmasala.com"
WWW_DOMAIN="www.coorgmasala.com"

# ============================================
# PREREQUISITES CHECK
# ============================================
print_info "Step 1: Checking prerequisites..."
echo ""

# Check if domain points to this server
print_info "Checking DNS configuration..."
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)

if [ "$DOMAIN_IP" == "$CURRENT_IP" ]; then
    print_success "Domain $DOMAIN points to this server ($CURRENT_IP)"
else
    print_error "Domain $DOMAIN points to $DOMAIN_IP, but this server is $CURRENT_IP"
    echo ""
    echo "⚠️  IMPORTANT: Before continuing, you must:"
    echo "   1. Go to your domain registrar (GoDaddy, Namecheap, etc.)"
    echo "   2. Update DNS A record for $DOMAIN to point to: $CURRENT_IP"
    echo "   3. Update DNS A record for $WWW_DOMAIN to point to: $CURRENT_IP"
    echo "   4. Wait 5-60 minutes for DNS propagation"
    echo "   5. Then run this script again"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo ""

# ============================================
# INSTALL CERTBOT
# ============================================
print_info "Step 2: Installing Certbot..."

# Update package list
sudo apt-get update -qq

# Install certbot and nginx plugin
if ! command -v certbot &> /dev/null; then
    sudo apt-get install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
else
    print_success "Certbot already installed"
fi
echo ""

# ============================================
# CONFIGURE NGINX FOR HTTP (BEFORE SSL)
# ============================================
print_info "Step 3: Configuring Nginx for HTTP..."

# Detect backend port
BACKEND_PORT=3001
for port in 3001 4000 5000; do
    if curl -s http://localhost:$port/api/health 2>/dev/null | grep -q "success"; then
        BACKEND_PORT=$port
        break
    fi
done

print_info "Backend detected on port: $BACKEND_PORT"

# Create nginx config
sudo tee /etc/nginx/sites-available/coorg-spices > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN $CURRENT_IP;

    # Frontend
    location / {
        root /home/ubuntu/coorg-spices/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files
    location /images {
        alias /home/ubuntu/coorg-spices/backend/public/images;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/coorg-spices /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

if sudo nginx -t; then
    sudo systemctl reload nginx
    print_success "Nginx configured for HTTP"
else
    print_error "Nginx configuration error"
    sudo nginx -t
    exit 1
fi
echo ""

# ============================================
# OBTAIN SSL CERTIFICATE
# ============================================
print_info "Step 4: Obtaining SSL certificate from Let's Encrypt..."
echo ""

print_info "This will:"
echo "  • Verify domain ownership"
echo "  • Issue SSL certificate"
echo "  • Configure HTTPS automatically"
echo "  • Setup auto-renewal"
echo ""

# Run certbot
sudo certbot --nginx \
    -d $DOMAIN \
    -d $WWW_DOMAIN \
    --non-interactive \
    --agree-tos \
    --email admin@$DOMAIN \
    --redirect

if [ $? -eq 0 ]; then
    print_success "SSL certificate obtained and configured!"
else
    print_error "SSL certificate setup failed"
    echo ""
    echo "Common issues:"
    echo "  1. Domain doesn't point to this server yet"
    echo "  2. Port 80 is blocked by firewall"
    echo "  3. Nginx not running"
    echo ""
    echo "Try manual setup:"
    echo "  sudo certbot --nginx -d $DOMAIN -d $WWW_DOMAIN"
    exit 1
fi
echo ""

# ============================================
# UPDATE FRONTEND ENV FOR HTTPS
# ============================================
print_info "Step 5: Updating frontend for HTTPS..."
cd ~/coorg-spices/frontend

cat > .env << EOF
REACT_APP_API_URL=https://$DOMAIN/api
EOF

print_success "Frontend .env updated for HTTPS"
echo ""

# ============================================
# REBUILD FRONTEND
# ============================================
print_info "Step 6: Rebuilding frontend..."
rm -rf build
if npm run build; then
    print_success "Frontend rebuilt"
else
    print_error "Frontend build failed"
    exit 1
fi
echo ""

# ============================================
# RESTART FRONTEND
# ============================================
print_info "Step 7: Restarting frontend..."
pm2 delete coorg-frontend 2>/dev/null || true
pm2 serve build 5173 --name coorg-frontend --spa
pm2 save
print_success "Frontend restarted"
echo ""

# ============================================
# TEST AUTO-RENEWAL
# ============================================
print_info "Step 8: Testing SSL auto-renewal..."
if sudo certbot renew --dry-run; then
    print_success "SSL auto-renewal is configured correctly"
else
    print_error "SSL auto-renewal test failed"
fi
echo ""

# ============================================
# VERIFY HTTPS
# ============================================
print_info "Step 9: Verifying HTTPS setup..."
echo ""

print_info "Testing HTTP redirect to HTTPS:"
if curl -sI http://$DOMAIN | grep -q "301\|302"; then
    print_success "HTTP redirects to HTTPS"
else
    print_info "HTTP redirect check inconclusive"
fi

print_info "Testing HTTPS:"
if curl -sI https://$DOMAIN 2>/dev/null | grep -q "200"; then
    print_success "HTTPS is working"
else
    print_error "HTTPS not responding"
fi
echo ""

# ============================================
# SHOW CERTIFICATE INFO
# ============================================
print_info "Step 10: Certificate information..."
sudo certbot certificates
echo ""

# ============================================
# FINAL STATUS
# ============================================
echo "=========================================="
print_success "HTTPS Setup Complete!"
echo "=========================================="
echo ""

echo "Your site is now secured with HTTPS:"
echo ""
echo "  🔒 HTTPS Site:"
echo "     https://$DOMAIN"
echo "     https://$WWW_DOMAIN"
echo ""
echo "  🔄 HTTP Redirect:"
echo "     http://$DOMAIN → https://$DOMAIN"
echo ""
echo "  🔧 API Endpoint:"
echo "     https://$DOMAIN/api"
echo "     https://$DOMAIN/api/products"
echo ""
echo "  📱 Direct Access (for testing):"
echo "     http://$CURRENT_IP:5173 (frontend)"
echo "     http://$CURRENT_IP:$BACKEND_PORT/api (backend)"
echo ""

print_info "SSL Certificate Details:"
echo "  • Issuer: Let's Encrypt"
echo "  • Valid for: 90 days"
echo "  • Auto-renewal: Enabled (runs twice daily)"
echo "  • Domains: $DOMAIN, $WWW_DOMAIN"
echo ""

print_info "Important Notes:"
echo "  • Certificate auto-renews before expiration"
echo "  • Check renewal: sudo certbot renew --dry-run"
echo "  • View certificates: sudo certbot certificates"
echo "  • Nginx config: /etc/nginx/sites-available/coorg-spices"
echo ""

print_info "Security Headers (Optional Enhancement):"
echo "  Add these to nginx config for better security:"
echo "  • HSTS (HTTP Strict Transport Security)"
echo "  • X-Frame-Options"
echo "  • X-Content-Type-Options"
echo ""

echo "Test your SSL configuration:"
echo "  https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""

print_success "Your site is now live with HTTPS! 🎉"
echo ""
