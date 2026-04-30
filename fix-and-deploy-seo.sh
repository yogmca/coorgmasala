#!/bin/bash

# Fix Site and Deploy SEO Changes to EC2
# This script fixes the backend issues and deploys SEO implementation

echo "🔧 Fixing Site and Deploying SEO Changes to EC2..."
echo "================================================"

# EC2 connection details
EC2_USER="ubuntu"
EC2_HOST="13.233.110.166"

echo ""
echo "📦 Step 1: Connecting to EC2 and pulling latest changes..."
ssh "$EC2_USER@$EC2_HOST" << 'ENDSSH'
set -e

cd /home/ubuntu/coorg-spices

echo "✓ Pulling latest code from GitHub (includes SEO changes)..."
git pull origin main

echo ""
echo "📦 Step 2: Installing backend dependencies..."
cd backend
npm install

echo ""
echo "📦 Step 3: Installing frontend dependencies (including react-helmet-async)..."
cd ../frontend
npm install

echo ""
echo "🏗️ Step 4: Building React frontend with SEO optimizations..."
export NODE_OPTIONS=--max-old-space-size=2048
npm run build

echo ""
echo "✅ Build completed successfully!"

echo ""
echo "🔄 Step 5: Restarting PM2 services..."
cd ..
pm2 restart all

echo ""
echo "⏳ Waiting for services to stabilize..."
sleep 5

echo ""
echo "📊 Checking PM2 status..."
pm2 status

echo ""
echo "✅ Deployment complete!"
ENDSSH

echo ""
echo "================================================"
echo "✅ Site Fixed and SEO Deployed Successfully!"
echo ""
echo "📊 What was deployed:"
echo "  ✓ SEO configuration files"
echo "  ✓ SEO-optimized content for all pages"
echo "  ✓ Meta tags and structured data (Schema.org)"
echo "  ✓ robots.txt and sitemap.xml"
echo "  ✓ SEOHelmet component with react-helmet-async"
echo "  ✓ Updated Home and Export pages with SEO"
echo "  ✓ Backend fixes for JWT token issues"
echo ""
echo "🔍 Verify Deployment:"
echo "  1. Visit: http://13.233.110.166"
echo "  2. Check sitemap: http://13.233.110.166/sitemap.xml"
echo "  3. Check robots: http://13.233.110.166/robots.txt"
echo "  4. View page source to see SEO meta tags"
echo ""
echo "📈 Next Steps for SEO:"
echo "  1. Submit sitemap to Google Search Console"
echo "  2. Submit sitemap to Bing Webmaster Tools"
echo "  3. Add Google Analytics tracking code"
echo "  4. Monitor keyword rankings"
echo ""
echo "📚 Documentation:"
echo "  - SEO_IMPLEMENTATION_GUIDE.md (complete guide)"
echo "  - QUICK_SEO_SETUP.md (quick reference)"
echo ""
