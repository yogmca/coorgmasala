# Coorg Spices API Documentation

## Base URL
```
http://localhost:5000/api
```

## Overview
This API provides endpoints for managing products, shopping cart, orders, and payment processing for the Coorg Spices e-commerce platform.

---

## Products API

### Get All Products
```
GET /products
```

**Query Parameters:**
- `category` (optional): Filter by category ('spices' or 'coffee')
- `inStock` (optional): Filter by stock availability (true/false)

**Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "product_id",
      "name": "Black Pepper",
      "description": "Premium quality Coorg black pepper...",
      "price": 450,
      "category": "spices",
      "image": "/images/black-pepper.jpg",
      "stock": 100,
      "unit": "grams",
      "weight": 100,
      "inStock": true,
      "ratings": {
        "average": 4.5,
        "count": 45
      }
    }
  ]
}
```

### Get Single Product
```
GET /products/:id
```

**Response:**
```json
{
  "success": true,
  "data": { /* product object */ }
}
```

### Create Product (Admin)
```
POST /products
```

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 450,
  "category": "spices",
  "image": "/images/product.jpg",
  "stock": 100,
  "unit": "grams",
  "weight": 100
}
```

### Update Product (Admin)
```
PUT /products/:id
```

### Delete Product (Admin)
```
DELETE /products/:id
```

---

## Cart API

### Get Cart
```
GET /cart/:sessionId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_123",
    "items": [
      {
        "product": { /* product object */ },
        "quantity": 2,
        "price": 450
      }
    ],
    "totalAmount": 900,
    "totalItems": 2
  }
}
```

### Add Item to Cart
```
POST /cart/:sessionId/items
```

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 1
}
```

### Update Item Quantity
```
PUT /cart/:sessionId/items/:productId
```

**Request Body:**
```json
{
  "quantity": 3
}
```

### Remove Item from Cart
```
DELETE /cart/:sessionId/items/:productId
```

### Clear Cart
```
DELETE /cart/:sessionId
```

### Checkout
```
POST /cart/:sessionId/checkout
```

**Request Body:**
```json
{
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  },
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "country": "India"
  },
  "paymentMethod": "upi"
}
```

---

## Orders API

### Create Order
```
POST /orders
```

**Request Body:**
```json
{
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  },
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "country": "India"
  },
  "items": [
    {
      "productId": "product_id",
      "quantity": 2
    }
  ],
  "paymentMethod": "upi"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-ABC12345",
    "customerInfo": { /* customer info */ },
    "shippingAddress": { /* address */ },
    "items": [ /* order items */ ],
    "totalAmount": 900,
    "paymentInfo": {
      "method": "upi",
      "status": "pending"
    },
    "orderStatus": "pending"
  }
}
```

### Initialize Payment
```
POST /orders/:orderId/payment/initialize
```

**Request Body:**
```json
{
  "paymentGateway": "razorpay"
}
```

**Payment Gateways:**
- `stripe` - For credit/debit cards
- `razorpay` - For UPI, Net Banking, Cards (India)

**Response (Razorpay):**
```json
{
  "success": true,
  "data": {
    "orderId": "order_razorpay_id",
    "amount": 90000,
    "currency": "INR"
  }
}
```

**Response (Stripe):**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx"
  }
}
```

### Verify Payment
```
POST /orders/:orderId/payment/verify
```

**Request Body (Razorpay):**
```json
{
  "paymentGateway": "razorpay",
  "paymentId": "pay_xxx",
  "signature": "signature_xxx",
  "razorpayOrderId": "order_xxx"
}
```

**Request Body (Stripe):**
```json
{
  "paymentGateway": "stripe",
  "paymentIntentId": "pi_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and order confirmed",
  "data": { /* updated order object */ }
}
```

### Get Order by ID
```
GET /orders/:orderId
```

### Get All Orders (Admin)
```
GET /orders
```

### Update Order Status (Admin)
```
PATCH /orders/:orderId/status
```

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Order Status Values:**
- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

---

## Payment Methods

### Supported Payment Methods:
1. **UPI** - Google Pay, PhonePe, Paytm, etc.
2. **Net Banking** - All major Indian banks
3. **Credit Card** - Visa, Mastercard, American Express
4. **Debit Card** - All major debit cards

### Payment Flow:
1. Create order via `/orders` endpoint
2. Initialize payment via `/orders/:orderId/payment/initialize`
3. Process payment through payment gateway (Razorpay/Stripe)
4. Verify payment via `/orders/:orderId/payment/verify`
5. Order status updated to 'confirmed' on successful payment

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Setup Instructions

### Backend Setup:

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
- MongoDB connection string
- Payment gateway credentials (Stripe, Razorpay)
- JWT secret

4. Seed database with sample products:
```bash
node seed.js
```

5. Start server:
```bash
npm start
# or for development
npm run dev
```

### Frontend Setup:

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_key
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key
```

4. Start development server:
```bash
npm start
```

---

## Mobile App Integration

The backend API is designed to be platform-agnostic and can be easily integrated with:
- **Android** - Using Retrofit, Volley, or OkHttp
- **iOS** - Using URLSession or Alamofire
- **React Native** - Using axios or fetch API
- **Flutter** - Using http or dio package

### Key Points for Mobile Integration:
1. Use the same API endpoints
2. Store session ID locally for cart management
3. Implement native payment gateway SDKs (Razorpay/Stripe)
4. Handle authentication tokens if user login is implemented
5. Implement proper error handling and retry logic

---

## Security Considerations

### For Production:
1. Enable HTTPS/SSL
2. Implement rate limiting
3. Add authentication middleware for admin routes
4. Validate and sanitize all inputs
5. Use environment variables for sensitive data
6. Implement CORS properly
7. Add request logging and monitoring
8. Use secure payment gateway webhooks
9. Implement order verification mechanisms
10. Add database backup strategies

---

## Testing

### Test the API using:
- **Postman** - Import endpoints and test
- **cURL** - Command line testing
- **Thunder Client** - VS Code extension

### Example cURL request:
```bash
curl -X GET http://localhost:5000/api/products
```

---

## Support

For issues or questions:
- Check the error messages in API responses
- Review server logs for detailed error information
- Ensure all environment variables are properly configured
- Verify MongoDB connection
- Check payment gateway credentials

---

## License

This API is part of the Coorg Spices e-commerce platform.
