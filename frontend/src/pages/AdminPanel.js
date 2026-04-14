import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { orderAPI } from '../services/api';
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

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchProducts();
    fetchOrders();
  }, [user, navigate, fetchProducts, fetchOrders]);

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
    </div>
  );
}

export default AdminPanel;
