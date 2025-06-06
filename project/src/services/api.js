import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
      }
      // You can add more specific error handling here
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials) => api.post('/admin/login', credentials),
  logout: () => api.post('/admin/logout'),
  getProfile: () => api.get('/admin/profile'),
};

// Products API
export const productsApi = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  updateStock: (id, stock) => api.patch(`/products/${id}/stock`, { stock }),
  getAll: (params = {}) => api.get('/admin/products', { params }),
  getById: (id) => api.get(`/admin/products/${id}`),
  create: (data) => api.post('/admin/products', data),
  update: (id, data) => api.put(`/admin/products/${id}`, data),
  delete: (id) => api.delete(`/admin/products/${id}`),
};

// Orders API
export const ordersApi = {
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getStatuses: () => api.get('/orders/statuses'),
  getStats: (params = {}) => api.get('/orders/stats', { params }),
  getAll: (params = {}) => api.get('/admin/orders', { params }),
  getById: (id) => api.get(`/admin/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
};

// Users API
export const usersApi = {
  // Get all users with optional filters
  getAll: (params = {}) => api.get('/admin/users', { params }),
  
  // Get a single user by ID
  getById: (id) => api.get(`/admin/users/${id}`),
  
  // Create a new user
  create: (userData) => api.post('/admin/users', userData),
  
  // Update an existing user
  update: (id, userData) => api.put(`/admin/users/${id}`, userData),
  
  // Delete a user
  delete: (id) => api.delete(`/admin/users/${id}`),
  
  // Get user statistics (count by role, status, etc.)
  getStats: () => api.get('/admin/users/stats'),
  
  // Get available user roles
  getRoles: () => api.get('/admin/users/roles'),
  
  // Update user status (active, inactive, suspended, etc.)
  updateStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  
  // Update user role
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  
  // Send password reset email
  sendPasswordReset: (email) => api.post('/admin/users/forgot-password', { email }),
  
  // Reset password with token
  resetPassword: (token, newPassword) => 
    api.post('/admin/users/reset-password', { token, newPassword }),
  
  // Get user activity logs
  getActivityLogs: (userId, params = {}) => 
    api.get(`/admin/users/${userId}/activity-logs`, { params })
};

// Settings API
export const settingsApi = {
  // Payment Gateways
  getPaymentGateways: () => api.get('/admin/settings/payment-gateways'),
  updatePaymentGateways: (data) => api.put('/admin/settings/payment-gateways', data),
  
  // General Settings
  getGeneral: () => api.get('/admin/settings/general'),
  updateGeneral: (data) => api.put('/admin/settings/general', data),
  
  // Email Settings
  getEmailSettings: () => api.get('/admin/settings/email'),
  updateEmailSettings: (data) => api.put('/admin/settings/email', data),
  
  // Test Payment Gateway Connection
  testPaymentGateway: (gateway, data) => 
    api.post(`/admin/settings/payment-gateways/${gateway}/test`, data),
};

export default api;
