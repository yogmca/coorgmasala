# Google OAuth Setup Guide for Coorg Spices

This guide will help you set up Google OAuth authentication for the Coorg Spices e-commerce application.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: `Coorg Spices` (or your preferred name)
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required information:
   - **App name**: Coorg Spices
   - **User support email**: Your email
   - **App logo**: (Optional) Upload your logo
   - **Application home page**: http://localhost:3000 (for development)
   - **Authorized domains**: 
     - localhost (for development)
     - Your production domain (e.g., 3.26.91.105 or your custom domain)
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
8. Click "Save and Continue"
9. Add test users (your email) if in testing mode
10. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Configure the OAuth client:
   - **Name**: Coorg Spices Web Client
   - **Authorized JavaScript origins**:
     - http://localhost:3000 (for development)
     - http://3.26.91.105 (your EC2 instance)
     - Add your production domain if you have one
   - **Authorized redirect URIs**:
     - http://localhost:3000 (for development)
     - http://3.26.91.105 (your EC2 instance)
     - Add your production domain if you have one
5. Click "Create"
6. **IMPORTANT**: Copy the Client ID - you'll need this!

## Step 5: Configure Environment Variables

### Backend (.env)

Add to `backend/.env`:

```env
# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth (optional - for server-side verification)
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### Frontend (.env)

Create/update `frontend/.env`:

```env
# API URL
REACT_APP_API_URL=http://localhost:5000

# Google OAuth Client ID
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### Production Environment Variables (EC2)

When deploying to EC2, update the environment variables:

```bash
# Backend .env on EC2
JWT_SECRET=your-production-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com

# Frontend .env on EC2
REACT_APP_API_URL=http://3.26.91.105:5000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

## Step 6: Generate JWT Secret

Generate a secure JWT secret using one of these methods:

### Method 1: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Method 2: Using OpenSSL
```bash
openssl rand -hex 64
```

### Method 3: Online Generator
Visit: https://www.grc.com/passwords.htm

Copy the generated string and use it as your `JWT_SECRET`.

## Step 7: Update Authorized Domains for Production

When you deploy to production:

1. Go back to Google Cloud Console > "APIs & Services" > "Credentials"
2. Click on your OAuth 2.0 Client ID
3. Add your production URLs:
   - **Authorized JavaScript origins**:
     - http://your-domain.com
     - https://your-domain.com (if using SSL)
   - **Authorized redirect URIs**:
     - http://your-domain.com
     - https://your-domain.com (if using SSL)
4. Click "Save"

## Important Security Notes

1. **Never commit credentials to Git**: Always use `.env` files and add them to `.gitignore`
2. **Use HTTPS in production**: Google OAuth requires HTTPS for production apps
3. **Rotate JWT secrets regularly**: Change your JWT secret periodically
4. **Limit OAuth scopes**: Only request the minimum scopes needed
5. **Verify tokens server-side**: Always validate OAuth tokens on the backend

## Testing OAuth Flow

1. Start your backend server: `cd backend && npm start`
2. Start your frontend: `cd frontend && npm start`
3. Navigate to http://localhost:3000
4. Click "Login with Google"
5. Select your Google account
6. Grant permissions
7. You should be redirected back and logged in

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in your Google Console matches exactly with your app URL
- Check for trailing slashes
- Ensure protocol (http/https) matches

### Error: "invalid_client"
- Verify your Client ID is correct in the `.env` file
- Make sure you're using the Client ID, not the Client Secret

### Error: "access_denied"
- User cancelled the OAuth flow
- Check OAuth consent screen configuration

### Token not working
- Verify JWT_SECRET is set in backend `.env`
- Check token expiration (default is 7 days)
- Ensure Authorization header format: `Bearer <token>`

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check backend server logs
3. Verify all environment variables are set correctly
4. Ensure Google Cloud project is properly configured
