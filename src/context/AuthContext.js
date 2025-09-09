import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
const API_BASE_URL =  'https://invoyci.onrender.com/api';
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';



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
      const { access, user } = response.data;
      localStorage.setItem('token', access);
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
      const { access, user } = response.data;
      localStorage.setItem('token', access);
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
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};