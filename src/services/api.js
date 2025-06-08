import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies if using httpOnly cookies
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token
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

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is not a 401 or if it's a retry request, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Mark this request as already retried to prevent infinite loops
    originalRequest._retry = true;

    // If we're already refreshing the token, add to queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
      .then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call the refresh token endpoint using the authApi to handle token updates
      const response = await authApi.refreshToken(refreshToken);
      
      if (!response.data || !response.data.access_token) {
        throw new Error('Invalid response from refresh token endpoint');
      }

      const { access_token } = response.data;
      
      // Update the Authorization header for the original request
      originalRequest.headers.Authorization = `Bearer ${access_token}`;

      // Process any queued requests
      processQueue(null, access_token);

      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      
      // If refresh fails, clear tokens and redirect to login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('refreshToken');
      
      // Process any queued requests with error
      processQueue(refreshError, null);
      
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Auth API
export const authApi = {
  login: (credentials) => api.post('/admin/login', credentials),
  logout: () => api.post('/admin/logout'),
  getProfile: () => api.get('/admin/profile'),
  refreshToken: (refreshToken) => {
    return api.post('/admin/refresh-token', { refresh_token: refreshToken })
      .then(response => {
        // Update the stored tokens
        if (response.data.access_token) {
          localStorage.setItem('adminToken', response.data.access_token);
        }
        if (response.data.refresh_token) {
          localStorage.setItem('refreshToken', response.data.refresh_token);
        }
        return response;
      });
  }
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
