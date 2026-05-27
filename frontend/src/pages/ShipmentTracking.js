import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ShipmentTracking.css';

const ShipmentTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders/${orderId}`,
        config
      );
      setOrder(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load shipment details');
      setLoading(false);
    }
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  // Determine status icon
  const getStatusIcon = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered')) return '✓';
    if (statusLower.includes('out for delivery')) return '🚚';
    if (statusLower.includes('transit') || statusLower.includes('shipped')) return '📦';
    if (statusLower.includes('picked')) return '📋';
    if (statusLower.includes('cancelled') || statusLower.includes('rto')) return '✗';
    return '●';
  };

  // Determine status color
  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered')) return 'success';
    if (statusLower.includes('out for delivery')) return 'active';
    if (statusLower.includes('transit') || statusLower.includes('shipped')) return 'active';
    if (statusLower.includes('cancelled') || statusLower.includes('rto')) return 'error';
    return 'pending';
  };

  if (loading) {
    return (
      <div className="shipment-tracking-page">
        <div className="tracking-loading">
          <div className="spinner"></div>
          <p>Loading shipment details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="shipment-tracking-page">
        <div className="tracking-error">
          <h2>⚠️ {error || 'Order not found'}</h2>
          <Link to="/" className="btn-home">Return to Home</Link>
        </div>
      </div>
    );
  }

  // Check if there are webhook events
  const hasTracking = order.webhookEvents && order.webhookEvents.length > 0;

  if (!hasTracking) {
    return (
      <div className="shipment-tracking-page">
        <div className="tracking-header">
          <Link to="/" className="logo-link">
            <h1 className="tracking-logo">🌶️ Coorg Masala</h1>
          </Link>
        </div>
        <div className="tracking-container">
          <div className="no-tracking">
            <h2>📦 No Tracking Information Available</h2>
            <p>Tracking details will appear here once your order is shipped.</p>
            <div className="tracking-actions">
              <Link to={`/orders/${orderId}`} className="btn-order-details">View Order Details</Link>
              <Link to="/" className="btn-home">Return to Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sort events by eventTime (newest first for display)
  const sortedEvents = [...order.webhookEvents].sort((a, b) => 
    new Date(b.eventTime) - new Date(a.eventTime)
  );

  // Get the latest event
  const latestEvent = sortedEvents[0];

  return (
    <div className="shipment-tracking-page">
      {/* Header with Logo */}
      <div className="tracking-header">
        <Link to="/" className="logo-link">
          <h1 className="tracking-logo">🌶️ Coorg Masala</h1>
        </Link>
        <div className="header-actions">
          <Link to={`/orders/${orderId}`} className="link-order-details">← Order Details</Link>
          <Link to="/" className="link-home">🏠 Home</Link>
        </div>
      </div>

      <div className="tracking-container">
        {/* Page Title */}
        <div className="tracking-title">
          <h2>📍 Track Your Shipment</h2>
          <p className="order-id-display">Order ID: <span>{order.orderId}</span></p>
        </div>

        {/* Current Status Banner */}
        <div className={`current-status-banner ${getStatusColor(latestEvent.status)}`}>
          <div className="status-icon-large">
            {getStatusIcon(latestEvent.status)}
          </div>
          <div className="status-details">
            <div className="status-title">{latestEvent.status}</div>
            <div className="status-location">
              {latestEvent.location && (
                <>
                  <span className="location-icon">📍</span>
                  {latestEvent.location}
                </>
              )}
            </div>
            <div className="status-message">{latestEvent.message}</div>
          </div>
          <div className="status-time">
            <div className="time-date">{formatDateTime(latestEvent.eventTime).date}</div>
            <div className="time-clock">{formatDateTime(latestEvent.eventTime).time}</div>
          </div>
        </div>

        {/* Tracking Information */}
        <div className="tracking-info-section">
          {order.deliveryInfo?.awbNumber && (
            <div className="tracking-info-row">
              <span className="tracking-label">AWB Number:</span>
              <span className="tracking-value awb-number">{order.deliveryInfo.awbNumber}</span>
            </div>
          )}

          {order.deliveryInfo?.carrier && (
            <div className="tracking-info-row">
              <span className="tracking-label">Carrier:</span>
              <span className="tracking-value">{order.deliveryInfo.carrier}</span>
            </div>
          )}

          {latestEvent.rtoAwb && (
            <div className="tracking-info-row rto-warning">
              <span className="tracking-label">⚠️ RTO AWB:</span>
              <span className="tracking-value">{latestEvent.rtoAwb}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="shipment-progress">
          <div className="progress-steps">
            <div className={`progress-step ${['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'].includes(order.orderStatus) ? 'completed' : ''}`}>
              <div className="step-icon">📋</div>
              <div className="step-label">Order Placed</div>
            </div>
            
            <div className={`progress-step ${['processing', 'shipped', 'out_for_delivery', 'delivered'].includes(order.orderStatus) ? 'completed' : ''}`}>
              <div className="step-icon">⚙️</div>
              <div className="step-label">Processing</div>
            </div>
            
            <div className={`progress-step ${['shipped', 'out_for_delivery', 'delivered'].includes(order.orderStatus) ? 'completed' : ''}`}>
              <div className="step-icon">📦</div>
              <div className="step-label">Shipped</div>
            </div>
            
            <div className={`progress-step ${['out_for_delivery', 'delivered'].includes(order.orderStatus) ? 'completed' : ''}`}>
              <div className="step-icon">🚚</div>
              <div className="step-label">Out for Delivery</div>
            </div>
            
            <div className={`progress-step ${order.orderStatus === 'delivered' ? 'completed' : ''}`}>
              <div className="step-icon">✓</div>
              <div className="step-label">Delivered</div>
            </div>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: order.orderStatus === 'delivered' ? '100%' :
                       order.orderStatus === 'out_for_delivery' ? '80%' :
                       order.orderStatus === 'shipped' ? '60%' :
                       order.orderStatus === 'processing' ? '40%' :
                       order.orderStatus === 'confirmed' ? '20%' : '0%'
              }}
            ></div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="tracking-timeline">
          <h3>📜 Shipment History</h3>
          <div className="timeline-container">
            {sortedEvents.map((event, index) => {
              const { date, time } = formatDateTime(event.eventTime);
              const isLatest = index === 0;
              
              return (
                <div 
                  key={index} 
                  className={`timeline-event ${isLatest ? 'latest' : ''} ${getStatusColor(event.status)}`}
                >
                  <div className="timeline-marker">
                    <div className="timeline-dot">
                      {getStatusIcon(event.status)}
                    </div>
                    {index < sortedEvents.length - 1 && (
                      <div className="timeline-line"></div>
                    )}
                  </div>
                  
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <div className="timeline-status">{event.status}</div>
                      <div className="timeline-datetime">
                        <span className="timeline-date">{date}</span>
                        <span className="timeline-time">{time}</span>
                      </div>
                    </div>
                    
                    {event.location && (
                      <div className="timeline-location">
                        <span className="location-icon">📍</span>
                        {event.location}
                      </div>
                    )}
                    
                    {event.message && (
                      <div className="timeline-message">{event.message}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="tracking-actions">
          <Link to={`/orders/${orderId}`} className="btn-order-details">
            View Full Order Details
          </Link>
          <Link to="/" className="btn-home">
            🏠 Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShipmentTracking;
