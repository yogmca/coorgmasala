# SEO Deployment Instructions for EC2

## ✅ Changes Already Pushed to GitHub

All SEO changes have been committed and pushed to the `main` branch on GitHub. The changes include:

### Files Added:
- `frontend/src/seo/seo-config.js` - SEO configuration
- `frontend/src/seo/content.js` - SEO-optimized content
- `frontend/src/seo/keywords.js` - Keyword strategy
- `frontend/src/components/SEOHelmet.js` - SEO component
- `frontend/public/robots.txt` - Search engine instructions
- `frontend/public/sitemap.xml` - Site structure for search engines
- `SEO_IMPLEMENTATION_GUIDE.md` - Complete documentation
- `QUICK_SEO_SETUP.md` - Quick reference guide

### Files Modified:
- `frontend/package.json` - Added react-helmet-async
- `frontend/public/index.html` - Added comprehensive meta tags
- `frontend/src/App.js` - Added HelmetProvider
- `frontend/src/pages/Home.js` - Integrated SEO
- `frontend/src/pages/Export.js` - Integrated SEO

---

## 🚀 Manual Deployment Steps

### Option 1: SSH into EC2 and Deploy

```bash
# 1. SSH into your EC2 instance
ssh ubuntu@13.233.110.166

# 2. Navigate to project directory
cd /home/ubuntu/coorg-spices

# 3. Pull latest changes from GitHub
git pull origin main

# 4. Install backend dependencies (if needed)
cd backend
npm install

# 5. Install frontend dependencies (includes react-helmet-async)
cd ../frontend
npm install

# 6. Build the frontend with SEO changes
npm run build

# 7. Restart PM2 services
cd ..
pm2 restart all

# 8. Check status
pm2 status

# 9. View logs to ensure everything is working
pm2 logs --lines 50
```

### Option 2: Use the Deployment Script

I've created a deployment script for you. Run it from your local machine:

```bash
# Make it executable (already done)
chmod +x fix-and-deploy-seo.sh

# Run the script
./fix-and-deploy-seo.sh
```

---

## 🔍 Verify Deployment

After deployment, verify the SEO implementation:

### 1. Check the Website
Visit: `http://13.233.110.166`

### 2. Check Sitemap
Visit: `http://13.233.110.166/sitemap.xml`

You should see an XML file with all your pages listed.

### 3. Check Robots.txt
Visit: `http://13.233.110.166/robots.txt`

You should see:
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
...
Sitemap: https://coorgmasala.com/sitemap.xml
```

### 4. View Page Source
1. Visit your homepage
2. Right-click → "View Page Source"
3. Look for meta tags in the `<head>` section:
   - `<meta name="description" content="Export premium organic Indian spices...">`
   - `<meta name="keywords" content="organic Indian spices, Coorg coffee...">`
   - `<meta property="og:title" content="...">`
   - `<script type="application/ld+json">` (structured data)

### 5. Test SEO Meta Tags
Use these tools to verify:
- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator

---

## 📊 What's Been Deployed

### SEO Features:
✅ **Meta Tags**
- Title tags optimized for search engines
- Meta descriptions with keywords
- Open Graph tags for social media
- Twitter cards
- Geo tags for Coorg, Karnataka

✅ **Structured Data (Schema.org)**
- Organization schema
- LocalBusiness schema
- Product schemas
- OfferCatalog schema

✅ **Technical SEO**
- robots.txt for search engine crawlers
- sitemap.xml with all pages
- Canonical URLs
- Hreflang tags for international targeting

✅ **Keywords Optimized For:**
- Organic Indian spices
- Coorg coffee
- Premium spices exporter
- Export to Germany, Europe, USA, Dubai
- Coorg masala
- Individual products (cardamom, black pepper, turmeric, etc.)

---

## 🐛 Troubleshooting

### If the site is still down:

1. **Check PM2 logs:**
```bash
ssh ubuntu@13.233.110.166
pm2 logs
```

2. **Restart services:**
```bash
pm2 restart all
```

3. **Check if build succeeded:**
```bash
cd /home/ubuntu/coorg-spices/frontend
ls -la build/
```

4. **Rebuild if necessary:**
```bash
cd /home/ubuntu/coorg-spices/frontend
npm run build
pm2 restart all
```

### If you see JWT errors:
The JWT token errors in the logs are normal - they occur when users have expired tokens. The site should still work for new visitors.

---

## 📈 Next Steps After Deployment

### 1. Submit to Search Engines

**Google Search Console:**
1. Go to: https://search.google.com/search-console
2. Add your property (website)
3. Verify ownership
4. Submit sitemap: `https://yoursite.com/sitemap.xml`

**Bing Webmaster Tools:**
1. Go to: https://www.bing.com/webmasters
2. Add your site
3. Verify ownership
4. Submit sitemap

### 2. Add Google Analytics

Add this code to `frontend/public/index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

Replace `GA_MEASUREMENT_ID` with your actual Google Analytics ID.

### 3. Monitor SEO Performance

Track these metrics:
- Organic traffic (Google Analytics)
- Keyword rankings (Google Search Console)
- Click-through rates
- Impressions in search results
- Backlinks

### 4. Optimize Images

Add descriptive alt text to all product images:
```html
<img src="..." alt="Organic green cardamom from Coorg India for export" />
```

### 5. Create Content

Consider adding:
- Blog posts about spices and coffee
- Customer testimonials
- Export guides
- Product usage guides

---

## 📞 Support

### Documentation Files:
- **Complete Guide**: `SEO_IMPLEMENTATION_GUIDE.md`
- **Quick Setup**: `QUICK_SEO_SETUP.md`
- **This File**: `DEPLOYMENT_INSTRUCTIONS.md`

### Configuration Files:
- **SEO Config**: `frontend/src/seo/seo-config.js`
- **SEO Content**: `frontend/src/seo/content.js`
- **Keywords**: `frontend/src/seo/keywords.js`

### Deployment Scripts:
- `fix-and-deploy-seo.sh` - Complete deployment script
- `deploy-seo-to-ec2.sh` - Alternative deployment script

---

## ✨ Summary

**Status**: ✅ All SEO changes are committed and pushed to GitHub

**To Deploy**: SSH into EC2 and run:
```bash
cd /home/ubuntu/coorg-spices
git pull origin main
cd frontend
npm install
npm run build
cd ..
pm2 restart all
```

**To Verify**: Visit your site and check:
- Homepage has SEO meta tags
- `/sitemap.xml` is accessible
- `/robots.txt` is accessible
- Page source shows structured data

**Expected Results**:
- Better search engine rankings
- Improved visibility in Google, Bing
- Rich snippets in search results
- Better social media sharing
- International market targeting (Germany, Europe, USA, Dubai)

---

**Last Updated**: April 30, 2026
**Git Status**: ✅ Pushed to main branch
**Ready to Deploy**: ✅ Yes
