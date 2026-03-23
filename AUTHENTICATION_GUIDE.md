# Authentication System Documentation

## Overview

The Coorg Spices e-commerce application now includes a complete user authentication system with the following features:

- **Email/Password Authentication** - Traditional signup and login
- **Google OAuth** - Single Sign-On with Google accounts
- **JWT-based Sessions** - Secure token-based authentication
- **Protected Routes** - Checkout requires login
- **User Profile** - View and edit profile, see order history
- **Password Security** - Bcrypt hashing for passwords

## Architecture

### Backend Components

1. **User Model** ([`backend/models/User.js`](backend/models/User.js))
   - Stores user information (name, email, phone, addresses)
   - Password hashing with bcrypt
   - Password comparison method

2. **Auth Middleware** ([`backend/middleware/auth.js`](backend/middleware/auth.js))
   - JWT token verification
   - Protects routes requiring authentication
   - Optional auth for routes that work with/without login

3. **Auth Routes** ([`backend/routes/auth.js`](backend/routes/auth.js))
   - `POST /api/auth/signup` - Register new user
   - `POST /api/auth/login` - Login with email/password
   - `POST /api/auth/google` - Google OAuth login
   - `GET /api/auth/me` - Get current user (protected)
   - `PUT /api/auth/profile` - Update profile (protected)
   - `GET /api/auth/orders` - Get user orders (protected)

### Frontend Components

1. **AuthContext** ([`frontend/src/context/AuthContext.js`](frontend/src/context/AuthContext.js))
   - Global authentication state management
   - Login, signup, logout functions
   - User data and token management
   - Automatic token persistence in localStorage

2. **Login Page** ([`frontend/src/pages/Login.js`](frontend/src/pages/Login.js))
   - Email/password login form
   - Google OAuth button
   - Link to signup page

3. **Signup Page** ([`frontend/src/pages/Signup.js`](frontend/src/pages/Signup.js))
   - User registration form
   - Optional address collection
   - Google OAuth button
   - Link to login page

4. **Profile Page** ([`frontend/src/pages/Profile.js`](frontend/src/pages/Profile.js))
   - View/edit user information
   - Manage addresses
   - View order history
   - Protected route (requires login)

5. **Updated Header** ([`frontend/src/components/Header.js`](frontend/src/components/Header.js))
   - Shows Login/Signup for guests
   - Shows user menu with profile/logout for authenticated users
   - User dropdown menu

6. **Protected Checkout** ([`frontend/src/pages/Checkout.js`](frontend/src/pages/Checkout.js))
   - Redirects to login if not authenticated
   - Pre-fills form with user data
   - Associates orders with user account

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phone": "9876543210",
  "address": {
    "street": "123 Main St",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "customer"
  }
}
```

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "customer"
  }
}
```

#### POST /api/auth/google
Login or register with Google OAuth.

**Request Body:**
```json
{
  "credential": "google_jwt_token",
  "name": "John Doe",
  "email": "john@gmail.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@gmail.com",
    "phone": "",
    "role": "customer"
  }
}
```

#### GET /api/auth/me
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "addresses": [...],
    "orders": [...]
  }
}
```

#### PUT /api/auth/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "9876543211",
  "addresses": [{
    "street": "456 New St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "isDefault": true
  }]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "name": "John Updated",
    "email": "john@example.com",
    "phone": "9876543211",
    "addresses": [...],
    "role": "customer"
  }
}
```

#### GET /api/auth/orders
Get user's order history.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "order_id",
      "orderId": "ORD123456",
      "items": [...],
      "totalAmount": 1500,
      "status": "delivered",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Authentication Flow

### Email/Password Registration

1. User fills signup form
2. Frontend validates input
3. POST request to `/api/auth/signup`
4. Backend validates and hashes password
5. User created in database
6. JWT token generated and returned
7. Token stored in localStorage
8. User redirected to home page

### Email/Password Login

1. User fills login form
2. Frontend validates input
3. POST request to `/api/auth/login`
4. Backend verifies email and password
5. JWT token generated and returned
6. Token stored in localStorage
7. User redirected to home page

### Google OAuth Login

1. User clicks "Sign in with Google"
2. Google OAuth popup opens
3. User selects Google account
4. Google returns credential token
5. Frontend sends credential to `/api/auth/google`
6. Backend verifies token and creates/finds user
7. JWT token generated and returned
8. Token stored in localStorage
9. User redirected to home page

### Protected Route Access

1. User tries to access checkout
2. Frontend checks if user is authenticated
3. If not authenticated, redirect to login
4. If authenticated, allow access and pre-fill form

### Token Verification

1. Frontend includes token in Authorization header
2. Backend middleware extracts and verifies token
3. If valid, attach user to request object
4. If invalid, return 401 Unauthorized

## Security Features

### Password Security
- Passwords hashed using bcrypt (10 rounds)
- Never stored in plain text
- Secure comparison using bcrypt.compare()

### JWT Tokens
- Signed with secret key
- 7-day expiration
- Includes user ID in payload
- Verified on each protected request

### Input Validation
- Email format validation
- Password minimum length (6 characters)
- Phone number format (10 digits)
- Pincode format (6 digits)

### CORS Protection
- Configured for specific origins
- Credentials allowed for authenticated requests

## Frontend Usage

### Using AuthContext

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome, {user.name}!</div>;
  }

  return <button onClick={() => navigate('/login')}>Login</button>;
}
```

### Making Authenticated Requests

```javascript
import axios from 'axios';

const token = localStorage.getItem('token');

const response = await axios.get('/api/auth/me', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

### Protecting Routes

```javascript
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function ProtectedPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return <div>Protected Content</div>;
}
```

## Environment Variables

### Backend (.env)

```env
JWT_SECRET=your_secure_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## Google OAuth Setup

See [`GOOGLE_OAUTH_SETUP.md`](GOOGLE_OAUTH_SETUP.md) for detailed instructions on:
- Creating Google Cloud project
- Configuring OAuth consent screen
- Creating OAuth credentials
- Setting authorized origins and redirect URIs

## Testing

### Test User Registration

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'
```

### Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Protected Route

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### "Token is not valid" Error
- Check if token is expired (7 days)
- Verify JWT_SECRET matches between requests
- Ensure token is properly formatted in Authorization header

### Google OAuth Not Working
- Verify GOOGLE_CLIENT_ID is set correctly
- Check authorized origins in Google Console
- Ensure redirect URIs match exactly

### User Not Found After Login
- Check MongoDB connection
- Verify user was created in database
- Check email format (lowercase)

### Cannot Access Protected Routes
- Verify token is in localStorage
- Check Authorization header format: `Bearer <token>`
- Ensure backend auth middleware is applied to route

## Deployment Considerations

### Production Checklist

- [ ] Generate strong JWT_SECRET (64+ characters)
- [ ] Set up HTTPS for production
- [ ] Configure CORS for production domain
- [ ] Update Google OAuth authorized origins
- [ ] Set secure cookie flags
- [ ] Enable rate limiting on auth endpoints
- [ ] Set up monitoring for failed login attempts
- [ ] Configure session timeout
- [ ] Enable CSRF protection
- [ ] Set up password reset functionality (future enhancement)

### EC2 Deployment

1. Update backend `.env` with production JWT_SECRET
2. Update frontend `.env` with production API_URL
3. Configure Google OAuth for production domain
4. Restart PM2 processes
5. Test authentication flow

See [`STEP_BY_STEP_DEPLOYMENT.md`](STEP_BY_STEP_DEPLOYMENT.md) for complete deployment instructions.

## Future Enhancements

- Password reset via email
- Email verification
- Two-factor authentication (2FA)
- Social login (Facebook, Twitter)
- Remember me functionality
- Session management dashboard
- Account deletion
- OAuth token refresh
- Rate limiting on login attempts
- Account lockout after failed attempts

## Support

For issues or questions:
1. Check this documentation
2. Review [`GOOGLE_OAUTH_SETUP.md`](GOOGLE_OAUTH_SETUP.md)
3. Check browser console for errors
4. Review backend server logs
5. Verify environment variables are set correctly
