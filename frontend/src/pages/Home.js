import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import ReviewSection from '../components/ReviewSection';
import './Home.css';

const Home = () => {
  // SVG placeholder as data URI (no external dependency)
  const getPlaceholderImage = (text) => {
    const svg = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="#e0e0e0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="16" fill="#666" text-anchor="middle" dy=".3em">${text}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // Get the base URL for images
  const getImageUrl = (imagePath) => {
    if (!imagePath) return getPlaceholderImage('No Image');
    if (imagePath.startsWith('http')) return imagePath;
    
    // Get API URL from env or use current origin for production
    const envUrl = process.env.REACT_APP_API_URL;
    let baseUrl;
    
    if (envUrl && envUrl.trim()) {
      baseUrl = envUrl.replace('/api', '');
    } else if (window.location.hostname === 'localhost') {
      baseUrl = 'http://localhost:5000';
    } else {
      // Production: use same domain
      baseUrl = window.location.origin;
    }
    
    return `${baseUrl}${imagePath}`;
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const { addToCart } = useCart();
  const [notification, setNotification] = useState('');

  useEffect(() => {
    loadProducts();
  }, [filter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = filter !== 'all' ? { category: filter } : {};
      const response = await productAPI.getAll(params);
      setProducts(response.data.data || []);
    } catch (err) {
      console.error('Error loading products:', err);
      const errorMessage = err.message || 'Failed to load products. Please try again.';
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId, 1);
    if (result.success) {
      setNotification('Item added to cart!');
      setTimeout(() => setNotification(''), 3000);
    } else {
      setNotification(result.error);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  return (
    <div className="home">
      {notification && (
        <div className="notification">{notification}</div>
      )}

      <section className="hero">
        <div className="hero-content">
          <h1>Premium Coorg Masala</h1>
          <p>Authentic Indian spices and coffee from the heart of Coorg</p>
          <p className="hero-subtitle">Direct from plantations to your kitchen</p>
        </div>
      </section>

      <section className="exporter-section">
        <div className="container">
          <div className="exporter-content">
            <div className="exporter-image">
              <img src="/images/Spices.jpeg" alt="Premium Indian Spices" />
            </div>
            <div className="exporter-text">
              <h2>Trusted Spices Exporter in India</h2>
              <p>
                Coorg Masala Private Limited is a trusted spices exporter in India, offering premium quality
                turmeric, cumin, coriander, cardamom, and other aromatic spices. We export the finest Indian
                spices to countries worldwide including Dubai, Europe (Germany), and many more.
              </p>
              <p>
                Our commitment to quality and authenticity has made us one of the best spices exporters in India.
                We source directly from Coorg plantations, ensuring that every spice retains its natural aroma,
                flavor, and nutritional value.
              </p>
              <div className="export-destinations">
                <h3>We Export To:</h3>
                <ul>
                  <li>🇦🇪 Dubai & UAE</li>
                  <li>🇩🇪 Germany & Europe</li>
                  <li>🌍 Worldwide Destinations</li>
                </ul>
              </div>
              <div className="certifications">
                <h3>Certified & Licensed</h3>
                <p className="cert-text">
                  ✓ FSSAI Licensed<br/>
                  ✓ Import Export Code (IEC)<br/>
                  ✓ Spices Board Registration (CRES)
                </p>
              </div>
              <a href="/export" className="export-cta-btn">Contact Us for Export Inquiries</a>
            </div>
          </div>
        </div>
      </section>

      <section className="products-section">
        <div className="container">
          <div className="filter-bar">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              All Products
            </button>
            <button 
              className={filter === 'spices' ? 'active' : ''} 
              onClick={() => setFilter('spices')}
            >
              Spices
            </button>
            <button 
              className={filter === 'coffee' ? 'active' : ''} 
              onClick={() => setFilter('coffee')}
            >
              Coffee
            </button>
          </div>

          {error && (
            <div className="error-message" style={{
              padding: '20px',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
              <button
                onClick={loadProducts}
                style={{
                  marginLeft: '10px',
                  padding: '5px 15px',
                  backgroundColor: '#c33',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : !error && (
            <div className="products-grid">
              {products.map(product => (
                <div key={product._id} className="product-card">
                  <div className="product-image">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      onError={(e) => {
                        // Prevent infinite loop by checking if already using data URI
                        if (!e.target.src.startsWith('data:')) {
                          e.target.src = getPlaceholderImage(product.name);
                        }
                      }}
                    />
                    {!product.inStock && (
                      <div className="out-of-stock-badge">Out of Stock</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-meta">
                      <span className="weight">{product.weight} {product.unit}</span>
                    </div>
                    <div className="product-footer">
                      <span className="price">₹{product.price}</span>
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product._id)}
                        disabled={!product.inStock}
                      >
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                    <ReviewSection productId={product._id} productName={product.name} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="no-products">No products found</div>
          )}
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="feature-grid">
            <div className="feature">
              <div className="feature-icon">🌿</div>
              <h3>100% Organic</h3>
              <p>Pure and natural spices from Coorg plantations</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Quick and secure delivery across India</p>
            </div>
            <div className="feature">
              <div className="feature-icon">💳</div>
              <h3>Secure Payment</h3>
              <p>Multiple payment options with secure checkout</p>
            </div>
            <div className="feature">
              <div className="feature-icon">⭐</div>
              <h3>Premium Quality</h3>
              <p>Handpicked and quality tested products</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
