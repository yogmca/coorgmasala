#!/bin/bash

# Deploy SEO Changes to EC2 Production
# This script deploys the SEO implementation to your EC2 server

echo "🚀 Deploying SEO Changes to EC2 Production..."
echo "================================================"

# EC2 connection details
EC2_USER="ubuntu"
EC2_HOST="13.233.110.166"
KEY_PATH="coorg-spices-key.pem"
REMOTE_DIR="/home/ubuntu/coorg-spices"

echo ""
echo "📦 Step 1: Connecting to EC2 and pulling latest changes..."
ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
cd /home/ubuntu/coorg-spices

echo "Pulling latest code from GitHub..."
git pull origin main

echo ""
echo "📦 Step 2: Installing frontend dependencies..."
cd frontend
npm install

echo ""
echo "🏗️ Step 3: Building React frontend with SEO..."
npm run build

echo ""
echo "✅ Build completed successfully!"
ENDSSH

echo ""
echo "🔄 Step 4: Restarting services..."
ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
# Restart PM2 processes
pm2 restart all

echo ""
echo "✅ Services restarted!"
ENDSSH

echo ""
echo "================================================"
echo "✅ SEO Deployment Complete!"
echo ""
echo "📊 What was deployed:"
echo "  ✓ SEO configuration files"
echo "  ✓ SEO-optimized content"
echo "  ✓ Meta tags and structured data"
echo "  ✓ robots.txt and sitemap.xml"
echo "  ✓ SEOHelmet component"
echo "  ✓ Updated Home and Export pages"
echo ""
echo "🔍 Next Steps:"
echo "  1. Visit your site and verify SEO meta tags"
echo "  2. Check https://yoursite.com/sitemap.xml"
echo "  3. Check https://yoursite.com/robots.txt"
echo "  4. Submit sitemap to Google Search Console"
echo "  5. Submit sitemap to Bing Webmaster Tools"
echo ""
echo "📚 Documentation:"
echo "  - SEO_IMPLEMENTATION_GUIDE.md"
echo "  - QUICK_SEO_SETUP.md"
echo ""
