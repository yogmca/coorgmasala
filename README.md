# 🌶️ Coorg Spices E-Commerce Platform

A full-stack e-commerce web application for selling premium Indian spices and coffee from Coorg. Built with React frontend and Node.js/Express backend with complete separation of concerns for easy mobile app integration.

## 🎯 Features

### Customer Features
- Browse premium spices and coffee products
- Filter products by category (Spices/Coffee)
- Add items to shopping cart
- Update quantities and remove items from cart
- Multi-step checkout process
- Multiple payment options:
  - UPI (Google Pay, PhonePe, Paytm)
  - Net Banking
  - Credit Card
  - Debit Card
- Order confirmation and tracking
- Responsive design for all devices

### Technical Features
- **Separated Architecture**: UI and business logic completely separated
- **RESTful API**: Clean API design for easy mobile integration
- **Payment Integration**: Stripe and Razorpay support
- **Session Management**: Cart persistence across sessions
- **Real-time Updates**: Dynamic cart and order updates
- **Professional UI**: Modern, clean, and user-friendly interface

## 🏗️ Architecture

```
Coorg_spices/
├── backend/                 # Node.js/Express API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic (payment, etc.)
│   ├── public/images/      # Product images
│   ├── server.js           # Main server file
│   ├── seed.js             # Database seeding
│   └── package.json
│
├── frontend/               # React application
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (Cart)
│   │   ├── services/      # API service layer
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── API_DOCUMENTATION.md    # Complete API docs
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/coorg-spices
JWT_SECRET=your_jwt_secret_key

# Payment Gateway Credentials
STRIPE_SECRET_KEY=your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

5. Seed database with sample products:
```bash
node seed.js
```

6. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

5. Start the development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 📦 Products

The application comes with 8 pre-configured products:

### Spices
1. **Black Pepper** (100g) - ₹450
2. **Cinnamon Sticks** (100g) - ₹350
3. **Green Cardamom** (50g) - ₹800
4. **Turmeric Powder** (200g) - ₹200
5. **Dried Ginger** (100g) - ₹300
6. **Black Pepper** (500g) - ₹2000

### Coffee
7. **Coffee Powder** (250g) - ₹500
8. **Coffee Powder** (1kg) - ₹1800

## 💳 Payment Integration

### Razorpay (Recommended for India)
Supports:
- UPI payments
- Net Banking
- Credit/Debit Cards
- Wallets

### Stripe (International)
Supports:
- Credit Cards
- Debit Cards

### Setup Payment Gateways

1. **Razorpay**:
   - Sign up at https://razorpay.com
   - Get API keys from Dashboard
   - Add keys to `.env` files

2. **Stripe**:
   - Sign up at https://stripe.com
   - Get API keys from Dashboard
   - Add keys to `.env` files

## 🔌 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart/:sessionId` - Get cart
- `POST /api/cart/:sessionId/items` - Add item to cart
- `PUT /api/cart/:sessionId/items/:productId` - Update quantity
- `DELETE /api/cart/:sessionId/items/:productId` - Remove item
- `DELETE /api/cart/:sessionId` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:orderId` - Get order details
- `POST /api/orders/:orderId/payment/initialize` - Initialize payment
- `POST /api/orders/:orderId/payment/verify` - Verify payment
- `PATCH /api/orders/:orderId/status` - Update order status (Admin)

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 📱 Mobile App Integration

The backend API is designed to work seamlessly with mobile applications:

### Android Integration
```java
// Using Retrofit
Retrofit retrofit = new Retrofit.Builder()
    .baseUrl("http://your-api-url/api/")
    .addConverterFactory(GsonConverterFactory.create())
    .build();
```

### iOS Integration
```swift
// Using URLSession
let baseURL = "http://your-api-url/api/"
```

### React Native
```javascript
import axios from 'axios';
const API_URL = 'http://your-api-url/api';
```

### Flutter
```dart
import 'package:http/http.dart' as http;
final baseUrl = 'http://your-api-url/api';
```

## 🎨 UI/UX Features

- **Modern Design**: Clean and professional interface
- **Responsive**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Enhanced user experience
- **Loading States**: Clear feedback for all actions
- **Error Handling**: User-friendly error messages
- **Progress Indicators**: Multi-step checkout with progress bar
- **Cart Badge**: Real-time cart item count
- **Product Filters**: Easy category filtering

## 🔒 Security Features

- Input validation and sanitization
- Secure payment processing
- Session management
- CORS configuration
- Environment variable protection
- Payment signature verification

## 🛠️ Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Stripe SDK
- Razorpay SDK
- bcryptjs (for password hashing)
- jsonwebtoken (for authentication)
- dotenv (environment variables)

### Frontend
- React 18
- React Router v6
- Axios (API calls)
- Context API (state management)
- CSS3 (styling)

## 📸 Adding Product Images

1. Add images to `backend/public/images/` directory
2. Name them according to products:
   - `black-pepper.jpg`
   - `cinnamon.jpg`
   - `cardamom.jpg`
   - `turmeric.jpg`
   - `ginger.jpg`
   - `coffee.jpg`

3. Recommended specifications:
   - Format: JPG or PNG
   - Size: 800x800 pixels
   - Aspect ratio: 1:1 (square)
   - File size: < 500KB

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:5000/api/health

# Get products
curl http://localhost:5000/api/products
```

### Test Frontend
1. Open browser to `http://localhost:3000`
2. Browse products
3. Add items to cart
4. Complete checkout process

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables
2. Configure MongoDB Atlas
3. Deploy backend
4. Update CORS settings

### Frontend Deployment (Vercel/Netlify)
1. Build production version: `npm run build`
2. Deploy build folder
3. Update API URL in environment variables

## 📝 Future Enhancements

- [ ] User authentication and profiles
- [ ] Order history for logged-in users
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced search and filters
- [ ] Discount codes and coupons
- [ ] Inventory management
- [ ] Analytics dashboard

## 🤝 Contributing

This is a complete e-commerce solution. Feel free to:
- Add new features
- Improve UI/UX
- Enhance security
- Optimize performance
- Add tests

## 📄 License

This project is open source and available for educational and commercial use.

## 📞 Support

For issues or questions:
- Check API documentation
- Review error messages
- Verify environment configuration
- Check MongoDB connection
- Validate payment gateway credentials

## 🎉 Acknowledgments

- Built for selling premium Coorg spices
- Designed with mobile app integration in mind
- Professional UI/UX for better user experience
- Complete payment integration for Indian market

---

**Made with ❤️ for Coorg Spices**
