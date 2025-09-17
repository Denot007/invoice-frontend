import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Try multiple token sources
    const token = localStorage.getItem('accessToken') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('access_token');
    
    console.log('API Request interceptor - Token found:', !!token);
    console.log('API Request interceptor - Path:', config.url);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request - Added Authorization header');
    } else {
      console.error('API Request - NO TOKEN FOUND!');
    }
    
    return config;
  },
  (error) => {
    console.error('API Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log('API Response error:', error.response?.status, error.response?.statusText, 'for:', originalRequest.url);

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('401 error - attempting token refresh');
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken') || 
                           localStorage.getItem('refresh_token');
        console.log('Refresh token available:', !!refreshToken);
        
        if (refreshToken) {
          console.log('Attempting token refresh...');
          const response = await axios.post(`${api.defaults.baseURL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          console.log('Token refresh successful, updating tokens');
          localStorage.setItem('accessToken', access);
          localStorage.setItem('token', access); // Store in both places

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          console.log('Retrying original request with new token');
          return api(originalRequest);
        } else {
          console.log('No refresh token available, logging out');
          // No refresh token available, logout user
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh token is invalid, logout user
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 402) {
      // Payment Required - subscription expired or inactive
      const errorData = error.response.data;
      console.warn('Subscription required:', errorData.message);
      
      // Store error details for the subscription page
      localStorage.setItem('subscription_error', JSON.stringify({
        message: errorData.message,
        trial_expired: errorData.trial_expired || false,
        subscription_status: errorData.subscription_status || null,
        timestamp: Date.now()
      }));
      
      // Redirect to settings/billing page
      window.location.href = '/settings';
    }

    return Promise.reject(error);
  }
);

export default api;