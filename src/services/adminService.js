import api from './api';

export const adminService = {
  // Platform Settings
  getPlatformSettings: async () => {
    const response = await api.get('/marketplace/admin/settings/');
    return response.data;
  },

  updatePlatformSettings: async (settings) => {
    const response = await api.post('/marketplace/admin/settings/update/', settings);
    return response.data;
  },

  // User Management
  getAllUsers: async () => {
    const response = await api.get('/marketplace/admin/users/');
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.post(`/marketplace/admin/users/${userId}/update/`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/marketplace/admin/users/${userId}/delete/`);
    return response.data;
  },

  // Client Management
  getAllClients: async () => {
    const response = await api.get('/marketplace/admin/clients/');
    return response.data;
  },

  // Platform Analytics
  getPlatformStats: async () => {
    const response = await api.get('/marketplace/admin/stats/');
    return response.data;
  },

  // Pricing Management
  getPricingSettings: async () => {
    const response = await api.get('/marketplace/admin/pricing/');
    return response.data;
  },

  updatePricingSettings: async (pricingData) => {
    const response = await api.post('/marketplace/admin/pricing/update/', pricingData);
    return response.data;
  }
};
