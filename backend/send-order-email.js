/**
 * One-time script to send order confirmation email for ORD-50724F44
 * This order was placed before the email service was implemented.
 *
 * Usage: cd backend && node send-order-email.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const { sendOrderConfirmationEmail } = require('./services/emailService');

const ORDER_ID = 'ORD-50724F44';

(async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log(`🔍 Fetching order ${ORDER_ID}...`);
    const order = await Order.findOne({ orderId: ORDER_ID }).lean();

    if (!order) {
      console.error(`❌ Order ${ORDER_ID} not found in the database.`);
      process.exit(1);
    }

    console.log(`📦 Order found — Customer: ${order.customerInfo.name}, Email: ${order.customerInfo.email}`);
    console.log(`   Items: ${order.items.length}, Total: ₹${order.totalAmount}`);

    // Override email to the correct recipient as specified
    order.customerInfo.email = 'harish.singh@gmail.com';
    order.customerInfo.name = 'Harish Singh';

    console.log(`📧 Sending order confirmation email to ${order.customerInfo.email}...`);
    console.log(`   BCC: ${process.env.ADMIN_BCC_EMAIL || 'ykmysuru27@gmail.com'}`);
    console.log(`   From: support@coorgmasala.com`);

    const result = await sendOrderConfirmationEmail(order);

    if (result.success) {
      console.log(`✅ Email sent successfully! Message ID: ${result.messageId}`);
    } else {
      console.error(`❌ Failed to send email: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Script error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
})();
