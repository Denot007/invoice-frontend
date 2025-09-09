import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

class AuthService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

  }

  async register(userData) {
    try {
      const payload = {
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        email: userData.email || '',
        company_name: userData.companyName || '',
        company_address: userData.companyAddress || '',
        company_email: userData.companyEmail || '',
        company_website: userData.companyWebsite || '',
        phone_number: userData.phone || '',
        password: userData.password || '',
        password_confirm: userData.confirmPassword || '',
      };
      
      const response = await this.client.post('/accounts/register/', payload);
      
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await this.client.post('/accounts/login/', {
        email,
        password,
      });
      
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await this.client.get('/accounts/profile/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      if (error.response?.status === 401) {
        this.logout();
      }
      throw error;
    }
  }

  async updateProfile(userData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await this.client.put('/accounts/profile/', {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        company_name: userData.companyName,
        phone_number: userData.phoneNumber,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token found');

      const response = await this.client.post('/token/refresh/', {
        refresh: refreshToken,
      });
      
      localStorage.setItem('token', response.data.access);
      return response.data.access;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.logout();
      throw error;
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }
}

export default new AuthService();