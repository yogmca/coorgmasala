import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './AdminPanel.css';

function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
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

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [user, navigate, fetchProducts]);

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

  return (
    <div className="admin-panel">
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

      {error && <div className="error-message">{error}</div>}

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
    </div>
  );
}

export default AdminPanel;
