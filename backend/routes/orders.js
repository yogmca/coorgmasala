const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const paymentService = require('../services/paymentService');
const { v4: uuidv4 } = require('uuid');

// Create new order
router.post('/', async (req, res) => {
  try {
    const { customerInfo, shippingAddress, items, paymentMethod } = req.body;

    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      let product;
      try {
        product = await Product.findById(item.productId);
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: `Invalid product ID: ${item.productId}`
        });
      }
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product not found: ${item.productId}`
        });
      }

      if (!product.stock || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}`
        });
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: subtotal
      });
    }

    // Create order
    const order = await Order.create({
      orderId: `ORD-${uuidv4().substring(0, 8).toUpperCase()}`,
      customerInfo,
      shippingAddress,
      items: orderItems,
      totalAmount,
      paymentInfo: {
        method: paymentMethod,
        status: 'pending'
      }
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Initialize payment
router.post('/:orderId/payment/initialize', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentGateway } = req.body; // 'stripe' or 'razorpay'

    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    let paymentData;

    if (paymentGateway === 'stripe') {
      // For Credit/Debit cards via Stripe
      paymentData = await paymentService.createStripePayment(
        order.totalAmount,
        'inr',
        { orderId: order.orderId }
      );
    } else if (paymentGateway === 'razorpay') {
      // For UPI, Net Banking, Cards via Razorpay
      paymentData = await paymentService.createRazorpayOrder(
        order.totalAmount,
        'INR',
        order.orderId,
        { orderId: order.orderId }
      );
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment gateway'
      });
    }

    if (!paymentData.success) {
      return res.status(400).json({
        success: false,
        error: paymentData.error
      });
    }

    // Update order with payment gateway info
    order.paymentInfo.paymentGateway = paymentGateway;
    await order.save();

    res.json({
      success: true,
      data: paymentData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Verify and complete payment
router.post('/:orderId/payment/verify', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentGateway, paymentId, signature, paymentIntentId } = req.body;

    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    let isValid = false;

    if (paymentGateway === 'razorpay') {
      // Verify Razorpay signature
      isValid = paymentService.verifyRazorpaySignature(
        req.body.razorpayOrderId,
        paymentId,
        signature
      );
    } else if (paymentGateway === 'stripe') {
      // Verify Stripe payment
      const verification = await paymentService.verifyStripePayment(paymentIntentId);
      isValid = verification.success && verification.status === 'succeeded';
    }

    if (!isValid) {
      order.paymentInfo.status = 'failed';
      await order.save();

      return res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }

    // Update order status
    order.paymentInfo.status = 'completed';
    order.paymentInfo.transactionId = paymentId || paymentIntentId;
    order.paymentInfo.paidAt = new Date();
    order.orderStatus = 'confirmed';

    // Update product stock
    for (const item of order.items) {
      try {
        const product = await Product.findById(item.product);
        if (product && product.stock >= item.quantity) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity }
          });
        }
      } catch (err) {
        console.error(`Failed to update stock for product ${item.product}:`, err.message);
      }
    }

    await order.save();

    res.json({
      success: true,
      message: 'Payment verified and order confirmed',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('items.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all orders (Admin only - add auth middleware in production)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update order status (Admin only - add auth middleware in production)
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    order.orderStatus = status;
    if (status === 'delivered') {
      order.deliveryDate = new Date();
    }
    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
