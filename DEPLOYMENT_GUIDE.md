# Coorg Spices Deployment Guide

## Overview
This guide provides instructions for deploying the Coorg Spices e-commerce application without Docker.

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB Atlas account (or local MongoDB installation)
- Git

## Deployment Package
The deployment package `coorg-spices-deployment.tar.gz` is available in the parent directory.

## Deployment Steps

### 1. Extract the Deployment Package
```bash
tar -xzf coorg-spices-deployment.tar.gz
cd Coorg_spices
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the `backend` directory with the following content:
```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here

# Payment Gateway Credentials
STRIPE_SECRET_KEY=your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Bank Account Details (for receiving payments)
BANK_ACCOUNT_NUMBER=your_bank_account_number
BANK_IFSC_CODE=your_bank_ifsc_code
BANK_NAME=your_bank_name
```

#### Seed the Database (First Time Only)
```bash
node seed.js
```

#### Start the Backend Server
```bash
npm start
```

The backend will be available at `http://localhost:3001`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the `frontend` directory with the following content:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

#### Start the Frontend Server (Development)
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

#### Build for Production
```bash
npm run build
```

This creates an optimized production build in the `build` directory.

### 4. Production Deployment

#### Using PM2 (Recommended for Production)

Install PM2 globally:
```bash
npm install -g pm2
```

Start the backend with PM2:
```bash
cd backend
pm2 start server.js --name coorg-backend
```

For the frontend, you can serve the build folder using a static server:
```bash
npm install -g serve
cd frontend
pm2 start "serve -s build -l 3000" --name coorg-frontend
```

#### Using a Process Manager

Alternatively, you can use systemd or any other process manager to keep the services running.

### 5. Nginx Configuration (Optional)

If you want to use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## GitHub Repository
The code is available at: https://github.com/yogmca/coorgmasala.git

To clone the repository:
```bash
git clone https://github.com/yogmca/coorgmasala.git
cd coorgmasala
```

## Environment-Specific Configuration

### Development
- Backend runs on port 3001
- Frontend runs on port 3000
- MongoDB can be local or Atlas

### Production
- Use environment variables for all sensitive data
- Enable HTTPS
- Use a process manager (PM2, systemd)
- Consider using a reverse proxy (Nginx, Apache)
- Set up proper logging and monitoring

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB URI in `.env` file
- Check MongoDB Atlas IP whitelist settings
- Ensure network connectivity

### Port Already in Use
```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Missing Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

## Support
For issues or questions, please create an issue on the GitHub repository.
