import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { orderAPI, reviewAPI } from '../services/api';
import './AdminPanel.css';

function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'spices',
    image: '',
    stock: '',
    unit: 'grams',
    weight: '',
    inStock: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [reviewFormData, setReviewFormData] = useState({ rating: 0, title: '', comment: '' });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      setOrders(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReviews = useCallback(async (ratingFilter) => {
    try {
      setLoading(true);
      const params = {};
      if (ratingFilter) params.rating = ratingFilter;
      const response = await reviewAPI.adminGetAll(params);
      setReviews(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdminEditReview = (review) => {
    setEditingReview(review);
    setReviewFormData({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment
    });
  };

  const handleAdminUpdateReview = async () => {
    if (!editingReview) return;
    try {
      await reviewAPI.adminUpdate(editingReview._id, reviewFormData);
      setEditingReview(null);
      setReviewFormData({ rating: 0, title: '', comment: '' });
      fetchReviews(reviewFilter);
    } catch (err) {
      setError(err.message || 'Failed to update review');
    }
  };

  const handleAdminDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewAPI.adminDelete(reviewId);
      fetchReviews(reviewFilter);
    } catch (err) {
      setError(err.message || 'Failed to delete review');
    }
  };

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchProducts();
    fetchOrders();
    fetchReviews();
  }, [user, navigate, fetchProducts, fetchOrders, fetchReviews]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Set image path for form data
      setFormData(prev => ({
        ...prev,
        image: `/images/${file.name}`
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imagePath = formData.image;

      // Upload image if a new file is selected
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        const token = localStorage.getItem('token');
        const uploadResponse = await api.post('/products/upload-image', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });

        if (uploadResponse.data.success) {
          imagePath = uploadResponse.data.imagePath;
        }
      }

      const productData = {
        ...formData,
        image: imagePath,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        weight: parseFloat(formData.weight)
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, productData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await api.post('/products', productData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }

      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save product');
      console.error('Save error:', err);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
      unit: product.unit,
      weight: product.weight,
      inStock: product.inStock
    });
    setImageFile(null);
    setImagePreview('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'spices',
      image: '',
      stock: '',
      unit: 'grams',
      weight: '',
      inStock: true
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    resetForm();
  };

  if (loading) {
    return <div className="admin-panel"><div className="loading">Loading...</div></div>;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      confirmed: '#3498db',
      processing: '#9b59b6',
      shipped: '#2980b9',
      out_for_delivery: '#e67e22',
      delivered: '#27ae60',
      cancelled: '#e74c3c'
    };
    return colors[status] || '#999';
  };

  return (
    <div className="admin-panel">
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '25px', borderBottom: '2px solid #e0e0e0' }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '12px 30px',
            border: 'none',
            background: activeTab === 'products' ? '#d35400' : 'transparent',
            color: activeTab === 'products' ? 'white' : '#666',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s'
          }}
        >
          Products ({products.length})
        </button>
        <button
          onClick={() => { setActiveTab('orders'); fetchOrders(); }}
          style={{
            padding: '12px 30px',
            border: 'none',
            background: activeTab === 'orders' ? '#d35400' : 'transparent',
            color: activeTab === 'orders' ? 'white' : '#666',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s'
          }}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => { setActiveTab('reviews'); fetchReviews(); }}
          style={{
            padding: '12px 30px',
            border: 'none',
            background: activeTab === 'reviews' ? '#d35400' : 'transparent',
            color: activeTab === 'reviews' ? 'white' : '#666',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s'
          }}
        >
          Reviews ({reviews.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="products-table-container">
          <h2>All Orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>No orders found.</p>
          ) : (
            <div className="table-responsive">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: '600', fontSize: '13px' }}>{order.orderId}</td>
                      <td>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>{order.customerInfo?.name}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{order.customerInfo?.email}</div>
                      </td>
                      <td>{order.items?.length || 0} items</td>
                      <td style={{ fontWeight: '600', color: '#d35400' }}>₹{order.totalAmount}</td>
                      <td>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          background: order.paymentInfo?.status === 'completed' ? '#d4edda' : 
                                     order.paymentInfo?.status === 'failed' ? '#f8d7da' : '#fff3cd',
                          color: order.paymentInfo?.status === 'completed' ? '#155724' : 
                                order.paymentInfo?.status === 'failed' ? '#721c24' : '#856404'
                        }}>
                          {order.paymentInfo?.status}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          background: `${getStatusColor(order.orderStatus)}20`,
                          color: getStatusColor(order.orderStatus)
                        }}>
                          {order.orderStatus?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: '#666' }}>{formatDate(order.createdAt)}</td>
                      <td>
                        <Link
                          to={`/order/${order.orderId}`}
                          style={{
                            padding: '6px 14px',
                            background: '#d35400',
                            color: 'white',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'inline-block'
                          }}
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
      <>
      <div className="admin-header">
        <h1>Product Management</h1>
        {!showForm && (
          <button 
            className="btn-add-product"
            onClick={() => setShowForm(true)}
          >
            + Add New Product
          </button>
        )}
      </div>

      {showForm && (
        <div className="product-form-container">
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="spices">Spices</option>
                  <option value="coffee">Coffee</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (₹) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="weight">Weight *</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="unit">Unit *</label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                >
                  <option value="grams">Grams</option>
                  <option value="kg">Kg</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stock">Stock Quantity *</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Product Image *</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!editingProduct}
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px' }} />
                  </div>
                )}
                {editingProduct && !imagePreview && formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Current" style={{ maxWidth: '200px', marginTop: '10px' }} />
                  </div>
                )}
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Supported formats: JPG, PNG, GIF, WebP (Max 5MB). Image will be uploaded automatically.
                </small>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                />
                <span>In Stock</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-table-container">
        <h2>All Products ({products.length})</h2>
        <div className="table-responsive">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Weight</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="product-thumbnail"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                      }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td className="category-badge">
                    <span className={`badge badge-${product.category}`}>
                      {product.category}
                    </span>
                  </td>
                  <td>₹{product.price}</td>
                  <td>{product.weight} {product.unit}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={`status-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="products-table-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2>All Reviews ({reviews.length})</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={{ fontSize: '13px', color: '#666' }}>Filter by rating:</label>
              <select
                value={reviewFilter}
                onChange={(e) => { setReviewFilter(e.target.value); fetchReviews(e.target.value); }}
                style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }}
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>No reviews found.</p>
          ) : (
            <div>
              {reviews.map(review => (
                <div key={review._id} style={{
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {review.product?.image && (
                        <img
                          src={review.product.image}
                          alt={review.product?.name}
                          style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
                          {review.product?.name || 'Unknown Product'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          by {review.user?.name || 'Unknown'} ({review.user?.email || ''})
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#f5a623', fontSize: '16px' }}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ margin: '10px 0' }}>
                    {review.title && <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#333' }}>{review.title}</h5>}
                    <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.5', margin: '4px 0' }}>{review.comment}</p>
                    {review.isEdited && (
                      <span style={{ fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
                        (edited{review.editedBy === 'admin' ? ' by admin' : ''})
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                    <button
                      onClick={() => handleAdminEditReview(review)}
                      style={{
                        padding: '6px 16px',
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleAdminDeleteReview(review._id)}
                      style={{
                        padding: '6px 16px',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Admin Edit Review Modal */}
          {editingReview && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Edit Review</h3>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '15px' }}>
                  Editing review by <strong>{editingReview.user?.name}</strong> for <strong>{editingReview.product?.name}</strong>
                </p>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '5px' }}>Rating:</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        onClick={() => setReviewFormData(prev => ({ ...prev, rating: star }))}
                        style={{
                          fontSize: '28px',
                          cursor: 'pointer',
                          color: star <= reviewFormData.rating ? '#f5a623' : '#ddd'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '5px' }}>Title:</label>
                  <input
                    type="text"
                    value={reviewFormData.title}
                    onChange={(e) => setReviewFormData(prev => ({ ...prev, title: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    maxLength={100}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '5px' }}>Comment:</label>
                  <textarea
                    value={reviewFormData.comment}
                    onChange={(e) => setReviewFormData(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    maxLength={1000}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button
                    onClick={handleAdminUpdateReview}
                    style={{
                      padding: '10px 24px',
                      background: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => { setEditingReview(null); setReviewFormData({ rating: 0, title: '', comment: '' }); }}
                    style={{
                      padding: '10px 24px',
                      background: 'transparent',
                      color: '#666',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
