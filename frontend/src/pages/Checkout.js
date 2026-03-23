import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';
import './Checkout.css';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    paymentMethod: 'upi'
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all customer information');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.street || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill in all address fields');
      return false;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      setError('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      // Create order
      const orderData = {
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country
        },
        items: cart.items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity
        })),
        paymentMethod: formData.paymentMethod
      };

      const orderResponse = await orderAPI.create(orderData);
      const order = orderResponse.data.data;

      // Initialize payment
      const paymentGateway = formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card' 
        ? 'stripe' 
        : 'razorpay';

      const paymentResponse = await orderAPI.initializePayment(order.orderId, {
        paymentGateway
      });

      if (!paymentResponse.data.success) {
        throw new Error('Payment initialization failed');
      }

      // Simulate payment processing
      if (paymentGateway === 'razorpay') {
        await handleRazorpayPayment(order, paymentResponse.data.data);
      } else {
        await handleStripePayment(order, paymentResponse.data.data);
      }

    } catch (err) {
      console.error('Order placement error:', err);
      const errorMessage = err.message || err.response?.data?.error || 'Failed to place order';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (order, paymentData) => {
    // In production, integrate actual Razorpay SDK
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: paymentData.amount,
      currency: paymentData.currency,
      order_id: paymentData.orderId,
      name: 'Coorg Spices',
      description: `Order ${order.orderId}`,
      handler: async function (response) {
        try {
          // Verify payment
          await orderAPI.verifyPayment(order.orderId, {
            paymentGateway: 'razorpay',
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            razorpayOrderId: response.razorpay_order_id
          });

          await clearCart();
          navigate(`/order-success/${order.orderId}`);
        } catch (err) {
          console.error('Payment verification error:', err);
          const errorMessage = err.message || 'Payment verification failed';
          setError(errorMessage);
          setLoading(false);
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      }
    };

    // For demo purposes, simulate successful payment
    setTimeout(async () => {
      try {
        const mockPaymentId = `pay_${Date.now()}`;
        await orderAPI.verifyPayment(order.orderId, {
          paymentGateway: 'razorpay',
          paymentId: mockPaymentId,
          signature: 'mock_signature',
          razorpayOrderId: paymentData.orderId
        });

        await clearCart();
        navigate(`/order-success/${order.orderId}`);
      } catch (err) {
        console.error('Razorpay payment error:', err);
        const errorMessage = err.message || 'Payment processing failed';
        setError(errorMessage);
        setLoading(false);
      }
    }, 2000);
  };

  const handleStripePayment = async (order, paymentData) => {
    // For demo purposes, simulate successful payment
    setTimeout(async () => {
      try {
        const mockPaymentIntentId = `pi_${Date.now()}`;
        await orderAPI.verifyPayment(order.orderId, {
          paymentGateway: 'stripe',
          paymentIntentId: mockPaymentIntentId
        });

        await clearCart();
        navigate(`/order-success/${order.orderId}`);
      } catch (err) {
        console.error('Stripe payment error:', err);
        const errorMessage = err.message || 'Payment processing failed';
        setError(errorMessage);
        setLoading(false);
      }
    }, 2000);
  };

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <div className="progress-bar">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Contact</div>
            </div>
            <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Address</div>
            </div>
            <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Payment</div>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="checkout-content">
          <div className="checkout-form">
            {step === 1 && (
              <div className="form-section">
                <h2>Contact Information</h2>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                  />
                </div>
                <button className="next-btn" onClick={handleNext}>
                  Continue to Address
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="form-section">
                <h2>Shipping Address</h2>
                <div className="form-group">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="House no., Building name, Street"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="6-digit pincode"
                      maxLength="6"
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      readOnly
                    />
                  </div>
                </div>
                <div className="button-group">
                  <button className="back-btn" onClick={handleBack}>
                    Back
                  </button>
                  <button className="next-btn" onClick={handleNext}>
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-section">
                <h2>Payment Method</h2>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === 'upi'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-info">
                      <span className="payment-icon">📱</span>
                      <div>
                        <strong>UPI</strong>
                        <p>Pay using Google Pay, PhonePe, Paytm, etc.</p>
                      </div>
                    </div>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="net_banking"
                      checked={formData.paymentMethod === 'net_banking'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-info">
                      <span className="payment-icon">🏦</span>
                      <div>
                        <strong>Net Banking</strong>
                        <p>Pay directly from your bank account</p>
                      </div>
                    </div>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={formData.paymentMethod === 'credit_card'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-info">
                      <span className="payment-icon">💳</span>
                      <div>
                        <strong>Credit Card</strong>
                        <p>Visa, Mastercard, American Express</p>
                      </div>
                    </div>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="debit_card"
                      checked={formData.paymentMethod === 'debit_card'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-info">
                      <span className="payment-icon">💳</span>
                      <div>
                        <strong>Debit Card</strong>
                        <p>All major debit cards accepted</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="button-group">
                  <button className="back-btn" onClick={handleBack}>
                    Back
                  </button>
                  <button 
                    className="place-order-btn" 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : `Place Order - ₹${getCartTotal()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="order-summary-sidebar">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cart.items.map(item => {
                // Skip items with null or undefined product
                if (!item.product) {
                  return null;
                }
                
                return (
                  <div key={item._id} className="summary-item">
                    <img
                      src={item.product.image || 'https://via.placeholder.com/60x60?text=Product'}
                      alt={item.product.name || 'Product'}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60x60?text=' + (item.product.name || 'Product');
                      }}
                    />
                    <div className="item-info">
                      <p className="item-name">{item.product.name || 'Unknown Product'}</p>
                      <p className="item-qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="item-price">₹{item.price * item.quantity}</p>
                  </div>
                );
              })}
            </div>
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{getCartTotal()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free">FREE</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{getCartTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
