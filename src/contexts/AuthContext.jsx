import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (token) {
          // Try to get the user profile
          const response = await authApi.getProfile();
          if (response.data) {
            setUser(response.data);
          } else {
            // If no user data, clear the token
            localStorage.removeItem('adminToken');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (error.response && error.response.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('adminToken');
        }
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.login({ email, password });
      
      if (response.data && response.data.access_token) {
        // Save the tokens and user data
        localStorage.setItem('adminToken', response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('refreshToken', response.data.refresh_token);
        }
        
        // Set the user data
        const userData = response.data.user || {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          role: 'admin'
        };
        
        setUser(userData);
        
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('adminToken');
      setUser(null);
      navigate('/login');
    }
  }, [navigate]);

  // Handle token refresh
  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authApi.refreshToken(refreshToken);
      
      if (response.data && response.data.access_token) {
        // Update the access token
        localStorage.setItem('adminToken', response.data.access_token);
        
        // Update refresh token if a new one is provided
        if (response.data.refresh_token) {
          localStorage.setItem('refreshToken', response.data.refresh_token);
        }
        
        return response.data.access_token;
      }
      
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Don't logout here, let the interceptor handle it
      return null;
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
