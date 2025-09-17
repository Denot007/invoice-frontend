import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/urls';



const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts/profile/`);
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/login/`, {
        email,
        password,
      });
      const { access, refresh, user } = response.data;
      localStorage.setItem('token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setUser(user);
      setError(null);
      return { success: true };
    } catch (error) {
      const errorData = error.response?.data;
      setError(errorData?.error || 'Login failed');
      
      // Return additional data for email verification errors
      if (errorData?.verification_required) {
        return { 
          success: false, 
          error: errorData.error,
          verification_required: true,
          email: errorData.email,
          message: errorData.message
        };
      }
      
      return { success: false, error: errorData?.error };
    }
  };

  const register = async (userData) => {
    try {
      const payload = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        company_name: userData.companyName,
        company_address: userData.companyAddress,
        company_email: userData.companyEmail,
        company_website: userData.companyWebsite,
        phone_number: userData.phone,
        password: userData.password,
        password_confirm: userData.confirmPassword,
      };
      const response = await axios.post(`${API_BASE_URL}/accounts/register/`, payload);
      
      // Handle email verification required response
      if (response.data.verification_required) {
        setError(null);
        return { 
          success: true, 
          verification_required: true, 
          email: response.data.email,
          message: response.data.message 
        };
      }
      
      // Handle successful registration with immediate login (for legacy users)
      const { access, refresh, user } = response.data;
      localStorage.setItem('token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setUser(user);
      setError(null);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
      return { success: false, error: error.response?.data?.error };
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const refreshToken = useCallback(async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) throw new Error('No refresh token available');

      const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
        refresh: refresh,
      });

      const { access } = response.data;
      localStorage.setItem('token', access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      return access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  }, []);

  const refreshUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts/profile/`);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Set up axios interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await refreshToken();
            return axios(originalRequest);
          } catch (refreshError) {
            // Token refresh failed, user will be logged out by refreshToken function
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken]);

  // Auto-refresh token every 3.5 hours (30 minutes before expiry)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await refreshToken();
        console.log('Token refreshed automatically');
      } catch (error) {
        console.error('Auto token refresh failed:', error);
      }
    }, 3.5 * 60 * 60 * 1000); // 3.5 hours

    return () => clearInterval(interval);
  }, [user, refreshToken]);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};