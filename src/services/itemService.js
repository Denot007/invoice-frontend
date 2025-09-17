import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const newToken = response.data.access;
        localStorage.setItem('token', newToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const itemService = {
  // Get all items with optional filters
  getItems: async (params = {}) => {
    try {
      const response = await api.get('/items/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching items:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch items' };
    }
  },

  // Get single item
  getItem: async (id) => {
    try {
      const response = await api.get(`/items/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching item:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch item' };
    }
  },

  // Create new item
  createItem: async (itemData) => {
    try {
      const response = await api.post('/items/', itemData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating item:', error);
      return { success: false, error: error.response?.data || 'Failed to create item' };
    }
  },

  // Update item
  updateItem: async (id, itemData) => {
    try {
      const response = await api.put(`/items/${id}/`, itemData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating item:', error);
      return { success: false, error: error.response?.data || 'Failed to update item' };
    }
  },

  // Delete item
  deleteItem: async (id) => {
    try {
      await api.delete(`/items/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to delete item' };
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await api.get('/items/categories/');
      return { success: true, data: response.data.categories };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch categories' };
    }
  },

  // Search items
  searchItems: async (searchTerm) => {
    try {
      const response = await api.get('/api/items/', {
        params: { search: searchTerm, is_active: true }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error searching items:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to search items' };
    }
  }
};

export default itemService;