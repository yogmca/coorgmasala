const Stripe = require('stripe');
const Razorpay = require('razorpay');

class PaymentService {
  constructor() {
    // Initialize Stripe only if credentials are provided
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      } catch (error) {
        console.warn('Failed to initialize Stripe:', error.message);
        this.stripe = null;
      }
    } else {
      this.stripe = null;
    }
    
    // Initialize Razorpay only if credentials are provided
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        this.razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET
        });
      } catch (error) {
        console.warn('Failed to initialize Razorpay:', error.message);
        this.razorpay = null;
      }
    } else {
      this.razorpay = null;
      console.warn('⚠️  Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file.');
      console.warn('📖 See RAZORPAY_QUICK_SETUP.md for setup instructions.');
    }
  }

  /**
   * Create payment intent for Stripe (Credit/Debit Card)
   */
  async createStripePayment(amount, currency = 'inr', metadata = {}) {
    try {
      if (!this.stripe) {
        return {
          success: false,
          error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
        };
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to smallest currency unit
        currency: currency,
        metadata: metadata,
        payment_method_types: ['card']
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create Razorpay order (UPI, Net Banking, Cards)
   */
  async createRazorpayOrder(amount, currency = 'INR', receipt, notes = {}) {
    try {
      if (!this.razorpay) {
        return {
          success: false,
          error: 'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables. See RAZORPAY_QUICK_SETUP.md for instructions.'
        };
      }

      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100), // Amount in smallest currency unit
        currency: currency,
        receipt: receipt,
        notes: notes
      });

      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyRazorpaySignature(orderId, paymentId, signature) {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('RAZORPAY_KEY_SECRET not configured');
      return false;
    }

    const crypto = require('crypto');
    const text = orderId + '|' + paymentId;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  }

  /**
   * Verify Stripe payment
   */
  async verifyStripePayment(paymentIntentId) {
    try {
      if (!this.stripe) {
        return {
          success: false,
          error: 'Stripe is not configured'
        };
      }

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        success: true,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process refund for Stripe
   */
  async refundStripePayment(paymentIntentId, amount = null) {
    try {
      if (!this.stripe) {
        return {
          success: false,
          error: 'Stripe is not configured'
        };
      }

      const refundData = { payment_intent: paymentIntentId };
      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundData);
      return {
        success: true,
        refundId: refund.id,
        status: refund.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process refund for Razorpay
   */
  async refundRazorpayPayment(paymentId, amount = null) {
    try {
      if (!this.razorpay) {
        return {
          success: false,
          error: 'Razorpay is not configured'
        };
      }

      const refundData = {};
      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundData);
      return {
        success: true,
        refundId: refund.id,
        status: refund.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new PaymentService();
