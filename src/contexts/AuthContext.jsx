import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // TODO: Implement actual auth check with your backend
        const token = localStorage.getItem('adminToken');
        if (token) {
          // Verify token with backend
          // const response = await fetch('/api/admin/verify-token', { headers: { Authorization: `Bearer ${token}` } });
          // const userData = await response.json();
          // setUser(userData);
          
          // For now, just set a mock user
          setUser({ id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('adminToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // TODO: Implement actual login with your backend
      // const response = await fetch('/api/admin/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      // const data = await response.json();
      
      // Mock login
      const data = { 
        user: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
        token: 'mock-jwt-token'
      };
      
      localStorage.setItem('adminToken', data.token);
      setUser(data.user);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
