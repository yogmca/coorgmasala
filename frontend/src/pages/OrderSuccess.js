import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setError('');
      const response = await orderAPI.getById(orderId);
      setOrder(response.data.data);
    } catch (err) {
      console.error('Error loading order:', err);
      const errorMessage = err.message || 'Failed to load order details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="order-not-found">
        <h2>{error || 'Order not found'}</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          {error ? 'There was an error loading your order details.' : 'The order you are looking for does not exist.'}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {error && (
            <button
              onClick={loadOrder}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          )}
          <Link to="/" style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}>
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p className="success-message">
            Thank you for your order. We've received your payment and will start processing your order shortly.
          </p>
          
          <div className="order-details">
            <div className="detail-row">
              <span className="label">Order ID:</span>
              <span className="value">{order.orderId}</span>
            </div>
            <div className="detail-row">
              <span className="label">Order Date:</span>
              <span className="value">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Total Amount:</span>
              <span className="value amount">₹{order.totalAmount}</span>
            </div>
            <div className="detail-row">
              <span className="label">Payment Status:</span>
              <span className={`value status ${order.paymentInfo.status}`}>
                {order.paymentInfo.status.toUpperCase()}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Payment Method:</span>
              <span className="value">
                {order.paymentInfo.method.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          <div className="shipping-info">
            <h3>Shipping Address</h3>
            <p>{order.customerInfo.name}</p>
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>

          <div className="order-items">
            <h3>Order Items</h3>
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-name">{item.name}</div>
                <div className="item-details-row">
                  <span>Qty: {item.quantity}</span>
                  <span>₹{item.price} each</span>
                  <span className="item-subtotal">₹{item.subtotal}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>📧 You'll receive an order confirmation email at {order.customerInfo.email}</li>
              <li>📦 Your order will be processed within 1-2 business days</li>
              <li>🚚 Estimated delivery: 3-5 business days</li>
              <li>📱 Track your order using Order ID: {order.orderId}</li>
            </ul>
          </div>

          <div className="action-buttons">
            <Link to="/" className="home-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
