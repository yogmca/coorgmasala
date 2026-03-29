import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  create: (data) => api.post('/orders', data),
  getById: (orderId) => api.get(`/orders/${orderId}`),
  getAll: () => api.get('/orders'),
  updateStatus: (orderId, data) => api.patch(`/orders/${orderId}/status`, data),
  initializePayment: (orderId, data) => api.post(`/orders/${orderId}/payment/initialize`, data),
  verifyPayment: (orderId, data) => api.post(`/orders/${orderId}/payment/verify`, data)
};

export default api;
