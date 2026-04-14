import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import './OrderDetails.css';

const OrderDetails = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [updating, setUpdating] = useState(false);

  // Admin delivery form state
  const [deliveryForm, setDeliveryForm] = useState({
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: '',
    notes: '',
    orderStatus: ''
  });

  const isAdmin = user && user.role === 'admin';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/60x60?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    
    let baseUrl;
    if (process.env.REACT_APP_API_URL) {
      baseUrl = process.env.REACT_APP_API_URL.replace('/api', '');
    } else if (window.location.hostname === 'localhost') {
      baseUrl = 'http://localhost:5000';
    } else {
      baseUrl = window.location.origin;
    }
    
    return `${baseUrl}${imagePath}`;
  };

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getById(orderId);
      const orderData = response.data.data;
      setOrder(orderData);

      // Pre-fill admin delivery form
      if (orderData.deliveryInfo) {
        setDeliveryForm({
          trackingNumber: orderData.deliveryInfo.trackingNumber || '',
          carrier: orderData.deliveryInfo.carrier || '',
          estimatedDelivery: orderData.deliveryInfo.estimatedDelivery 
            ? new Date(orderData.deliveryInfo.estimatedDelivery).toISOString().split('T')[0] 
            : '',
          notes: orderData.deliveryInfo.notes || '',
          orderStatus: orderData.orderStatus || ''
        });
      } else {
        setDeliveryForm(prev => ({
          ...prev,
          orderStatus: orderData.orderStatus || ''
        }));
      }
    } catch (err) {
      console.error('Failed to fetch order:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, fetchOrder]);

  const handleDeliveryFormChange = (e) => {
    setDeliveryForm({
      ...deliveryForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateDelivery = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccessMsg('');

    try {
      await orderAPI.updateDelivery(orderId, deliveryForm);
      setSuccessMsg('Delivery information updated successfully!');
      await fetchOrder();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update delivery:', err);
      setError(err.message || 'Failed to update delivery information');
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!window.confirm('Are you sure you want to mark this order as delivered?')) return;
    
    setUpdating(true);
    setError('');
    setSuccessMsg('');

    try {
      await orderAPI.updateDelivery(orderId, {
        ...deliveryForm,
        orderStatus: 'delivered'
      });
      setSuccessMsg('Order marked as delivered!');
      await fetchOrder();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to mark as delivered:', err);
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'confirmed', label: 'Confirmed', icon: '✓' },
      { key: 'processing', label: 'Processing', icon: '⚙' },
      { key: 'shipped', label: 'Shipped', icon: '📦' },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
      { key: 'delivered', label: 'Delivered', icon: '✅' }
    ];

    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(order?.orderStatus);

    return steps.map((step) => {
      const stepIndex = statusOrder.indexOf(step.key);
      let status = 'pending';
      if (stepIndex < currentIndex) status = 'completed';
      else if (stepIndex === currentIndex) status = 'active';
      return { ...step, status };
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPaymentMethod = (method) => {
    const methods = {
      'upi': 'UPI',
      'net_banking': 'Net Banking',
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card'
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="order-details-loading">
          <div className="spinner"></div>
          Loading order details...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <div className="container">
          <div className="error-msg">Order not found. Please check the order ID and try again.</div>
          <div className="order-actions">
            <Link to="/" className="btn-continue-shopping">Go to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      <div className="container">
        {/* Header */}
        <div className="order-details-header">
          <h1>Order #{order.orderId}</h1>
          <button className="back-link" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        {successMsg && <div className="success-msg">{successMsg}</div>}
        {error && <div className="error-msg">{error}</div>}

        {/* Status Timeline */}
        {order.paymentInfo?.status === 'completed' && (
          <div className="status-timeline">
            <h2>Order Status</h2>
            <div className="timeline">
              {getStatusSteps().map((step) => (
                <div key={step.key} className={`timeline-step ${step.status}`}>
                  <div className="timeline-icon">{step.icon}</div>
                  <div className="timeline-label">{step.label}</div>
                  {step.key === 'shipped' && order.deliveryInfo?.shippedAt && (
                    <div className="timeline-date">{formatDate(order.deliveryInfo.shippedAt)}</div>
                  )}
                  {step.key === 'delivered' && order.deliveryInfo?.deliveredAt && (
                    <div className="timeline-date">{formatDate(order.deliveryInfo.deliveredAt)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction & Shipping Details */}
        <div className="order-details-grid">
          {/* Transaction Details */}
          <div className="detail-card">
            <h3>Transaction Details</h3>
            <div className="info-row">
              <span className="info-label">Order ID</span>
              <span className="info-value">{order.orderId}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Order Date</span>
              <span className="info-value">{formatDate(order.createdAt)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Payment Method</span>
              <span className="info-value">{formatPaymentMethod(order.paymentInfo?.method)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Transaction ID</span>
              <span className="info-value">{order.paymentInfo?.transactionId || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Payment Status</span>
              <span className="info-value">
                <span className={`payment-badge ${order.paymentInfo?.status}`}>
                  {order.paymentInfo?.status}
                </span>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Paid At</span>
              <span className="info-value">{formatDate(order.paymentInfo?.paidAt)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Amount</span>
              <span className="info-value highlight">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Shipping Address & Customer Info */}
          <div className="detail-card">
            <h3>Customer & Shipping</h3>
            <div className="info-row">
              <span className="info-label">Name</span>
              <span className="info-value">{order.customerInfo?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{order.customerInfo?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone</span>
              <span className="info-value">{order.customerInfo?.phone}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Address</span>
              <span className="info-value">
                {order.shippingAddress?.street}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">City</span>
              <span className="info-value">{order.shippingAddress?.city}</span>
            </div>
            <div className="info-row">
              <span className="info-label">State</span>
              <span className="info-value">{order.shippingAddress?.state}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Pincode</span>
              <span className="info-value">{order.shippingAddress?.pincode}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="order-items-card">
          <h3>Items Purchased</h3>
          {order.items?.map((item, index) => (
            <div key={index} className="order-item-row">
              <img
                src={getImageUrl(item.product?.image || '')}
                alt={item.name}
                className="order-item-img"
                onError={(e) => {
                  if (!e.target.src.includes('placeholder')) {
                    e.target.src = 'https://via.placeholder.com/60x60?text=' + encodeURIComponent(item.name || 'Product');
                  }
                }}
              />
              <div className="order-item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-qty">Qty: {item.quantity} × ₹{item.price}</div>
              </div>
              <div className="order-item-price">₹{item.subtotal || (item.price * item.quantity)}</div>
            </div>
          ))}
          <div className="order-total-row">
            <span>Total</span>
            <span className="total-amount">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Delivery Information (visible to all) */}
        {order.deliveryInfo && (order.deliveryInfo.trackingNumber || order.deliveryInfo.carrier || order.deliveryInfo.estimatedDelivery) && (
          <div className="delivery-info-card">
            <h3>Delivery Information</h3>
            <div className="delivery-info-grid">
              {order.deliveryInfo.trackingNumber && (
                <div className="delivery-info-item">
                  <div className="label">Tracking Number</div>
                  <div className="value">{order.deliveryInfo.trackingNumber}</div>
                </div>
              )}
              {order.deliveryInfo.carrier && (
                <div className="delivery-info-item">
                  <div className="label">Carrier</div>
                  <div className="value">{order.deliveryInfo.carrier}</div>
                </div>
              )}
              {order.deliveryInfo.estimatedDelivery && (
                <div className="delivery-info-item">
                  <div className="label">Estimated Delivery</div>
                  <div className="value">{formatDate(order.deliveryInfo.estimatedDelivery)}</div>
                </div>
              )}
              {order.deliveryInfo.shippedAt && (
                <div className="delivery-info-item">
                  <div className="label">Shipped At</div>
                  <div className="value">{formatDate(order.deliveryInfo.shippedAt)}</div>
                </div>
              )}
              {order.deliveryInfo.deliveredAt && (
                <div className="delivery-info-item">
                  <div className="label">Delivered At</div>
                  <div className="value">{formatDate(order.deliveryInfo.deliveredAt)}</div>
                </div>
              )}
              {order.deliveryInfo.notes && (
                <div className="delivery-info-item delivery-notes">
                  <div className="label">Notes</div>
                  <div className="value">{order.deliveryInfo.notes}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin Delivery Management Section */}
        {isAdmin && order.paymentInfo?.status === 'completed' && (
          <div className="admin-delivery-section">
            <h3>🔧 Admin: Manage Delivery</h3>
            <form onSubmit={handleUpdateDelivery}>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label htmlFor="orderStatus">Order Status</label>
                  <select
                    id="orderStatus"
                    name="orderStatus"
                    value={deliveryForm.orderStatus}
                    onChange={handleDeliveryFormChange}
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="carrier">Shipping Carrier</label>
                  <select
                    id="carrier"
                    name="carrier"
                    value={deliveryForm.carrier}
                    onChange={handleDeliveryFormChange}
                  >
                    <option value="">Select Carrier</option>
                    <option value="India Post">India Post</option>
                    <option value="Blue Dart">Blue Dart</option>
                    <option value="DTDC">DTDC</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="Ekart">Ekart</option>
                    <option value="FedEx">FedEx</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="trackingNumber">Tracking Number</label>
                  <input
                    type="text"
                    id="trackingNumber"
                    name="trackingNumber"
                    value={deliveryForm.trackingNumber}
                    onChange={handleDeliveryFormChange}
                    placeholder="Enter tracking number"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="estimatedDelivery">Estimated Delivery Date</label>
                  <input
                    type="date"
                    id="estimatedDelivery"
                    name="estimatedDelivery"
                    value={deliveryForm.estimatedDelivery}
                    onChange={handleDeliveryFormChange}
                  />
                </div>

                <div className="admin-form-group full-width">
                  <label htmlFor="notes">Delivery Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={deliveryForm.notes}
                    onChange={handleDeliveryFormChange}
                    placeholder="Add any delivery notes or instructions..."
                  />
                </div>
              </div>

              <div className="admin-actions">
                {order.orderStatus !== 'delivered' && (
                  <button
                    type="button"
                    className="btn-mark-delivered"
                    onClick={handleMarkDelivered}
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : '✅ Mark as Delivered'}
                  </button>
                )}
                <button
                  type="submit"
                  className="btn-update-delivery"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Delivery Info'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Action Buttons */}
        <div className="order-actions">
          <Link to="/" className="btn-continue-shopping">Continue Shopping</Link>
          <Link to="/profile" className="btn-view-orders">View All Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
