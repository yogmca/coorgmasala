# Google OAuth on EC2 Without Domain - Workaround Guide

## Problem
Google OAuth requires authorized origins to end with a public top-level domain (.com, .org, etc.), which means raw IP addresses like `3.26.91.105` won't work directly.

## Solutions (Choose One)

### Solution 1: Use Free Domain Services (RECOMMENDED)

#### Option A: AWS Route 53 + Free Domain
1. Register a cheap domain ($3-12/year):
   - Namecheap.com
   - GoDaddy.com
   - Google Domains
   
2. Point domain to your EC2 IP:
   - Go to AWS Route 53
   - Create hosted zone for your domain
   - Add A record pointing to `3.26.91.105`
   - Update nameservers at your domain registrar

3. Update Google OAuth settings:
   ```
   Authorized JavaScript origins:
   http://yourdomain.com
   https://yourdomain.com
   
   Authorized redirect URIs:
   http://yourdomain.com
   https://yourdomain.com
   ```

#### Option B: Free Subdomain Services
Use services that provide free subdomains:

1. **FreeDNS (afraid.org)**
   - Go to https://freedns.afraid.org/
   - Register for free
   - Create subdomain: `coorgspices.mooo.com` (or similar)
   - Point to your EC2 IP: `3.26.91.105`
   - Use in Google OAuth: `http://coorgspices.mooo.com`

2. **No-IP.com**
   - Free dynamic DNS service
   - Create hostname: `coorgspices.ddns.net`
   - Point to EC2 IP
   - Use in Google OAuth

3. **DuckDNS.org**
   - Free subdomain service
   - Create: `coorgspices.duckdns.org`
   - Point to EC2 IP

### Solution 2: Use nip.io (Quick Testing - Not for Production)

nip.io is a wildcard DNS service that maps IPs to domains:

1. Your EC2 IP: `3.26.91.105`
2. Use domain: `3.26.91.105.nip.io`
3. This resolves to your IP automatically

**Google OAuth Settings:**
```
Authorized JavaScript origins:
http://3.26.91.105.nip.io
http://3.26.91.105.nip.io:3000

Authorized redirect URIs:
http://3.26.91.105.nip.io
http://3.26.91.105.nip.io:3000
```

**Update your frontend .env on EC2:**
```env
REACT_APP_API_URL=http://3.26.91.105.nip.io:5000
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Note:** nip.io is great for testing but not recommended for production as it's a third-party service.

### Solution 3: Disable Google OAuth on EC2 (Temporary)

For now, you can:
1. Use Google OAuth only on localhost for development
2. Use regular email/password login on EC2
3. Add Google OAuth later when you get a domain

**Steps:**
1. Don't set `REACT_APP_GOOGLE_CLIENT_ID` in EC2's frontend .env
2. The app will show a message that Google Sign-In is not configured
3. Users can still register/login with email and password

### Solution 4: Use Cloudflare Tunnel (Advanced)

Cloudflare Tunnel provides a free domain:

1. Install cloudflared on EC2
2. Create tunnel: `cloudflared tunnel create coorg-spices`
3. Get free subdomain: `coorg-spices.trycloudflare.com`
4. Use in Google OAuth

## Recommended Approach for Your Project

**For Development (Now):**
- Use `http://localhost:3000` in Google OAuth
- Test locally

**For EC2 Deployment (Short-term):**
- Option 1: Use nip.io (`3.26.91.105.nip.io`)
- Option 2: Disable Google OAuth, use email/password only

**For Production (Long-term):**
- Get a real domain ($3-12/year)
- Set up SSL with Let's Encrypt (free)
- Use HTTPS for security

## Quick Setup with nip.io

### 1. Update Google OAuth Console
```
Authorized JavaScript origins:
http://3.26.91.105.nip.io
http://3.26.91.105.nip.io:3000

Authorized redirect URIs:
http://3.26.91.105.nip.io
http://3.26.91.105.nip.io:3000
```

### 2. Update EC2 Frontend .env
```bash
# SSH to EC2
ssh -i ~/Downloads/coorgmasala.pem ubuntu@3.26.91.105

# Edit frontend .env
cd ~/coorg-spices/frontend
nano .env

# Add/Update:
REACT_APP_API_URL=http://3.26.91.105.nip.io:5000
REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com

# Rebuild frontend
npm run build

# Restart services
pm2 restart all
```

### 3. Update Nginx (if using)
```nginx
server {
    listen 80;
    server_name 3.26.91.105.nip.io;
    
    # ... rest of config
}
```

### 4. Test
Visit: `http://3.26.91.105.nip.io`

## Free Domain Recommendations

If you want to get a domain:

**Cheapest Options:**
1. **Namecheap** - .xyz domains for $1-2/year
2. **Porkbun** - .com domains for $9/year
3. **Google Domains** - .com for $12/year

**Free Options (with limitations):**
1. **Freenom** - Free .tk, .ml, .ga domains (may be unreliable)
2. **InfinityFree** - Free subdomain with hosting

## Summary

**Best for you right now:**
1. Use `localhost` for development and testing
2. Use `3.26.91.105.nip.io` for EC2 deployment (temporary)
3. Plan to get a real domain for production ($3-12/year)

This way you can test everything now and upgrade to a proper domain later!
