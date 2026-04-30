# Deploy JWT Token Expiry Fix

## Issue Fixed
The backend was throwing `TokenExpiredError` for users with expired JWT tokens (older than 7 days), causing authentication failures.

## Changes Made

### Backend Changes

1. **[`backend/middleware/auth.js`](backend/middleware/auth.js)**
   - Added specific handling for `TokenExpiredError`
   - Returns clear error messages with `expired: true` flag
   - Differentiates between expired and invalid tokens
   - Better error logging

2. **[`backend/routes/auth.js`](backend/routes/auth.js)**
   - Extended JWT token expiration from 7 days to 30 days
   - Reduces frequency of token expiration issues

### Frontend Changes

1. **[`frontend/src/services/api.js`](frontend/src/services/api.js)**
   - Added response interceptor to detect expired tokens
   - Auto-clears localStorage on token expiration
   - Redirects to login page with `?expired=true` parameter

2. **[`frontend/src/context/AuthContext.js`](frontend/src/context/AuthContext.js)**
   - Better error handling for expired tokens
   - Auto-logout on token expiration

## Deployment Steps

### Option 1: Using the deployment script

```bash
# Update the KEY_PATH in deploy_token_fix.sh to match your SSH key location
# Then run:
chmod +x deploy_token_fix.sh
./deploy_token_fix.sh
```

### Option 2: Manual deployment

```bash
# Set your SSH key path
KEY_PATH="path/to/your/coorg-spices-key.pem"
EC2_USER="ubuntu"
EC2_HOST="13.127.222.61"

# 1. Upload backend files
scp -i "$KEY_PATH" backend/middleware/auth.js ${EC2_USER}@${EC2_HOST}:/home/ubuntu/coorg-spices/backend/middleware/auth.js
scp -i "$KEY_PATH" backend/routes/auth.js ${EC2_USER}@${EC2_HOST}:/home/ubuntu/coorg-spices/backend/routes/auth.js

# 2. Upload frontend files
scp -i "$KEY_PATH" frontend/src/services/api.js ${EC2_USER}@${EC2_HOST}:/home/ubuntu/coorg-spices/frontend/src/services/api.js
scp -i "$KEY_PATH" frontend/src/context/AuthContext.js ${EC2_USER}@${EC2_HOST}:/home/ubuntu/coorg-spices/frontend/src/context/AuthContext.js

# 3. SSH into server and restart services
ssh -i "$KEY_PATH" ${EC2_USER}@${EC2_HOST}

# Once connected, run:
cd /home/ubuntu/coorg-spices/backend
pm2 restart coorg-backend
pm2 save

cd /home/ubuntu/coorg-spices/frontend
npm run build
pm2 restart coorg-frontend
pm2 save

# Check status
pm2 status
pm2 logs coorg-backend --lines 20
```

### Option 3: Quick backend-only fix (if site is down)

```bash
# Set your SSH key path
KEY_PATH="path/to/your/coorg-spices-key.pem"
EC2_USER="ubuntu"
EC2_HOST="13.127.222.61"

# Upload and restart backend only
scp -i "$KEY_PATH" backend/middleware/auth.js ${EC2_USER}@${EC2_HOST}:/home/ubuntu/coorg-spices/backend/middleware/auth.js
scp -i "$KEY_PATH" backend/routes/auth.js ${EC2_USER}@${EC2_HOST}:/home/ubuntu/coorg-spices/backend/routes/auth.js

ssh -i "$KEY_PATH" ${EC2_USER}@${EC2_HOST} "cd /home/ubuntu/coorg-spices/backend && pm2 restart coorg-backend && pm2 save"
```

## Verification

After deployment, verify:

1. **Backend is running:**
   ```bash
   ssh -i "$KEY_PATH" ${EC2_USER}@${EC2_HOST} "pm2 status"
   ```

2. **No more TokenExpiredError in logs:**
   ```bash
   ssh -i "$KEY_PATH" ${EC2_USER}@${EC2_HOST} "pm2 logs coorg-backend --lines 50 --nostream | grep -i 'expired'"
   ```

3. **Site is accessible:**
   - Visit https://coorgmasala.com
   - Try logging in
   - Check that expired tokens show a clear message

## Expected Behavior After Fix

### For Users with Expired Tokens:
- Clear error message: "Your session has expired. Please login again."
- Automatic redirect to login page
- No more cryptic JWT errors in logs

### For New Logins:
- Tokens valid for 30 days (instead of 7)
- Smoother user experience
- Less frequent re-authentication required

## Rollback (if needed)

If issues occur, restore from backup:
```bash
ssh -i "$KEY_PATH" ${EC2_USER}@${EC2_HOST}
cd /home/ubuntu/coorg-spices/backend
git checkout middleware/auth.js routes/auth.js
pm2 restart coorg-backend
```
