import React, { useState } from 'react';
import './Export.css';

const Export = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    product: '',
    quantity: '',
    message: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/contact/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Thank you for your inquiry! We will contact you shortly.'
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          country: '',
          product: '',
          quantity: '',
          message: ''
        });
      } else {
        setStatus({
          type: 'error',
          message: data.message || 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="export-page">
      <section className="export-hero">
        <div className="container">
          <h1>Export Inquiries</h1>
          <p>Connect with us for premium quality Indian spices export</p>
        </div>
      </section>

      <section className="export-content">
        <div className="container">
          <div className="export-grid">
            <div className="export-info">
              <h2>Why Choose Coorg Masala?</h2>
              <div className="info-card">
                <div className="info-icon">🌍</div>
                <h3>Global Reach</h3>
                <p>We export premium spices to Dubai, UAE, Germany, Europe, and worldwide destinations.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">✓</div>
                <h3>Certified Quality</h3>
                <p>FSSAI Licensed, Import Export Code (IEC), and Spices Board Registration (CRES) certified.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">🌿</div>
                <h3>Premium Products</h3>
                <p>Turmeric, cumin, coriander, cardamom, black pepper, cinnamon, and more aromatic spices.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">📦</div>
                <h3>Bulk Orders</h3>
                <p>We handle bulk orders with competitive pricing and reliable delivery.</p>
              </div>

              <div className="contact-details">
                <h3>Contact Information</h3>
                <p><strong>Email:</strong> support@coorgmasala.com</p>
                <p><strong>Company:</strong> Coorg Masala Private Limited</p>
                <p><strong>Location:</strong> Coorg, India</p>
              </div>
            </div>

            <div className="export-form-container">
              <h2>Send Us Your Inquiry</h2>
              <p className="form-subtitle">Fill out the form below and we'll get back to you within 24 hours</p>

              {status.message && (
                <div className={`status-message ${status.type}`}>
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="export-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="company">Company Name</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your company name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    placeholder="Your country"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="product">Product Interest *</label>
                  <select
                    id="product"
                    name="product"
                    value={formData.product}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a product</option>
                    <option value="turmeric">Turmeric</option>
                    <option value="cumin">Cumin</option>
                    <option value="coriander">Coriander</option>
                    <option value="cardamom">Cardamom</option>
                    <option value="black-pepper">Black Pepper</option>
                    <option value="cinnamon">Cinnamon</option>
                    <option value="ginger">Ginger</option>
                    <option value="mixed">Mixed Spices</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="quantity">Estimated Quantity</label>
                  <input
                    type="text"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="e.g., 1000 kg, 10 tons"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="Tell us about your requirements, delivery location, and any specific questions..."
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Export;
