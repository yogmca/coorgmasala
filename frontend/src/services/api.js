import axios from 'axios';

// Use relative URL to automatically match the protocol (http/https)
// This ensures HTTPS is used when accessing via HTTPS domain
const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.error || error.message
    });
    
    // Return a consistent error structure
    return Promise.reject({
      message: error.response?.data?.error || error.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Product API
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

// Cart API
export const cartAPI = {
  getCart: (sessionId) => api.get(`/cart/${sessionId}`),
  addItem: (sessionId, data) => api.post(`/cart/${sessionId}/items`, data),
  updateItem: (sessionId, productId, data) => api.put(`/cart/${sessionId}/items/${productId}`, data),
  removeItem: (sessionId, productId) => api.delete(`/cart/${sessionId}/items/${productId}`),
  clearCart: (sessionId) => api.delete(`/cart/${sessionId}`),
  checkout: (sessionId, data) => api.post(`/cart/${sessionId}/checkout`, data)
};

// Order API
export const orderAPI = {
  create: (data) => {
    const token = localStorage.getItem('token');
    const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
    return api.post('/orders', data, config);
  },
  getById: (orderId) => api.get(`/orders/${orderId}`),
  getAll: () => api.get('/orders'),
  updateStatus: (orderId, data) => {
    const token = localStorage.getItem('token');
    return api.patch(`/orders/${orderId}/status`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },
  updateDelivery: (orderId, data) => {
    const token = localStorage.getItem('token');
    return api.patch(`/orders/${orderId}/delivery`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },
  initializePayment: (orderId, data) => api.post(`/orders/${orderId}/payment/initialize`, data),
  verifyPayment: (orderId, data) => api.post(`/orders/${orderId}/payment/verify`, data),
  checkPaymentStatus: (orderId) => api.get(`/orders/${orderId}/payment/status`)
};

// Review API
export const reviewAPI = {
  // Public - get reviews for a product
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),

  // Authenticated - check if user can review a product
  canReview: (productId) => {
    const token = localStorage.getItem('token');
    return api.get(`/reviews/can-review/${productId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Authenticated - get current user's reviews
  getMyReviews: () => {
    const token = localStorage.getItem('token');
    return api.get('/reviews/my-reviews', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Authenticated - create a review
  create: (data) => {
    const token = localStorage.getItem('token');
    return api.post('/reviews', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Authenticated - update own review
  update: (reviewId, data) => {
    const token = localStorage.getItem('token');
    return api.put(`/reviews/${reviewId}`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Authenticated - delete own review
  delete: (reviewId) => {
    const token = localStorage.getItem('token');
    return api.delete(`/reviews/${reviewId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Admin - get all reviews
  adminGetAll: (params) => {
    const token = localStorage.getItem('token');
    return api.get('/reviews/admin/all', {
      params,
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Admin - get delivered orders with products pending review
  adminGetPending: () => {
    const token = localStorage.getItem('token');
    return api.get('/reviews/admin/pending', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Admin - update a review
  adminUpdate: (reviewId, data) => {
    const token = localStorage.getItem('token');
    return api.put(`/reviews/admin/${reviewId}`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Admin - delete a review
  adminDelete: (reviewId) => {
    const token = localStorage.getItem('token');
    return api.delete(`/reviews/admin/${reviewId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
};

export default api;
