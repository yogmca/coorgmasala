const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const paymentService = require('../services/paymentService');
const { sendOrderConfirmationEmail } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');
const { adminAuth, optionalAuth } = require('../middleware/auth');

// Create new order
router.post('/', optionalAuth, async (req, res) => {
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
    const orderData = {
      orderId: `ORD-${uuidv4().substring(0, 8).toUpperCase()}`,
      customerInfo,
      shippingAddress,
      items: orderItems,
      totalAmount,
      paymentInfo: {
        method: paymentMethod,
        status: 'pending'
      }
    };

    // Link order to authenticated user if available
    if (req.userId) {
      orderData.user = req.userId;
    }

    const order = await Order.create(orderData);

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
    if (paymentGateway === 'razorpay' && paymentData.orderId) {
      order.paymentInfo.razorpayOrderId = paymentData.orderId;
    }
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

    // Send order confirmation email (non-blocking)
    sendOrderConfirmationEmail(order).catch(err => {
      console.error('Email send error (payment verify):', err.message);
    });

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

// Check payment status (for polling after QR/UPI payments)
router.get('/:orderId/payment/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Also check with Razorpay if payment is still pending and we have a razorpay order id
    if (order.paymentInfo.status === 'pending' && order.paymentInfo.razorpayOrderId) {
      try {
        const razorpayOrder = await paymentService.razorpay.orders.fetch(order.paymentInfo.razorpayOrderId);
        
        if (razorpayOrder.status === 'paid') {
          // Fetch payments for this order to get payment details
          const payments = await paymentService.razorpay.orders.fetchPayments(order.paymentInfo.razorpayOrderId);
          const successfulPayment = payments.items.find(p => p.status === 'captured');
          
          if (successfulPayment) {
            // Update order status
            order.paymentInfo.status = 'completed';
            order.paymentInfo.transactionId = successfulPayment.id;
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
            console.log(`✅ Payment confirmed via status check for order ${orderId}, payment: ${successfulPayment.id}`);

            // Send order confirmation email (non-blocking)
            sendOrderConfirmationEmail(order).catch(err => {
              console.error('Email send error (status check):', err.message);
            });
          }
        }
      } catch (rzpErr) {
        console.error('Error checking Razorpay order status:', rzpErr.message);
        // Continue with current order status even if Razorpay check fails
      }
    }

    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        paymentStatus: order.paymentInfo.status,
        orderStatus: order.orderStatus,
        transactionId: order.paymentInfo.transactionId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Razorpay Webhook - receives payment events directly from Razorpay servers
router.post('/webhook/razorpay', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      const crypto = require('crypto');
      const receivedSignature = req.headers['x-razorpay-signature'];
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      
      if (receivedSignature !== expectedSignature) {
        console.error('❌ Razorpay webhook signature verification failed');
        return res.status(400).json({ success: false, error: 'Invalid signature' });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`📩 Razorpay webhook received: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      let razorpayOrderId, paymentId;

      if (event === 'payment.captured') {
        razorpayOrderId = payload.payment.entity.order_id;
        paymentId = payload.payment.entity.id;
      } else if (event === 'order.paid') {
        razorpayOrderId = payload.order.entity.id;
        // Get payment ID from the order's payments
        const payments = payload.order.entity.payments;
        paymentId = payments ? Object.keys(payments)[0] : null;
      }

      if (razorpayOrderId) {
        // Find order by razorpay order ID
        const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': razorpayOrderId });
        
        if (order && order.paymentInfo.status !== 'completed') {
          order.paymentInfo.status = 'completed';
          order.paymentInfo.transactionId = paymentId;
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
          console.log(`✅ Webhook: Payment confirmed for order ${order.orderId}, payment: ${paymentId}`);

          // Send order confirmation email (non-blocking)
          sendOrderConfirmationEmail(order).catch(err => {
            console.error('Email send error (webhook):', err.message);
          });
        }
      }
    } else if (event === 'payment.failed') {
      const razorpayOrderId = payload.payment.entity.order_id;
      if (razorpayOrderId) {
        const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': razorpayOrderId });
        if (order && order.paymentInfo.status === 'pending') {
          order.paymentInfo.status = 'failed';
          await order.save();
          console.log(`❌ Webhook: Payment failed for order ${order.orderId}`);
        }
      }
    }

    // Always respond 200 to acknowledge webhook
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error.message);
    // Still respond 200 to prevent Razorpay from retrying
    res.status(200).json({ success: true });
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

// Update order status (Admin only)
router.patch('/:orderId/status', adminAuth, async (req, res) => {
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
      if (!order.deliveryInfo) order.deliveryInfo = {};
      order.deliveryInfo.deliveredAt = new Date();
    }
    if (status === 'shipped') {
      if (!order.deliveryInfo) order.deliveryInfo = {};
      order.deliveryInfo.shippedAt = new Date();
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

// Update delivery info (Admin only)
router.patch('/:orderId/delivery', adminAuth, async (req, res) => {
  try {
    const { trackingNumber, carrier, estimatedDelivery, notes, orderStatus } = req.body;
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update delivery info fields
    if (!order.deliveryInfo) order.deliveryInfo = {};
    if (trackingNumber !== undefined) order.deliveryInfo.trackingNumber = trackingNumber;
    if (carrier !== undefined) order.deliveryInfo.carrier = carrier;
    if (estimatedDelivery !== undefined) order.deliveryInfo.estimatedDelivery = estimatedDelivery;
    if (notes !== undefined) order.deliveryInfo.notes = notes;

    // Update order status if provided
    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === 'shipped' && !order.deliveryInfo.shippedAt) {
        order.deliveryInfo.shippedAt = new Date();
      }
      if (orderStatus === 'delivered') {
        order.deliveryInfo.deliveredAt = new Date();
        order.deliveryDate = new Date();
      }
    }

    await order.save();

    res.json({
      success: true,
      message: 'Delivery information updated successfully',
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
