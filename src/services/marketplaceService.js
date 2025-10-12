import api from './api';

export const marketplaceService = {
  createHandymanAccount: async (email) => {
    const response = await api.post('/marketplace/create-handyman/', { email });
    return response.data;
  },

  processPayment: async (handymanId, clientEmail, amount, invoiceId = null) => {
    const response = await api.post('/marketplace/process-payment/', {
      handyman_id: handymanId,
      client_email: clientEmail,
      amount: amount, // Amount in dollars (will be converted to cents in backend)
      invoice_id: invoiceId // Include invoice ID for webhook updates
    });
    return response.data;
  },

  listHandymen: async () => {
    const response = await api.get('/marketplace/handymen/');
    return response.data;
  },

  getHandymanDashboard: async (handymanId) => {
    const response = await api.get(`/marketplace/handyman/${handymanId}/dashboard/`);
    return response.data;
  },

  verifyOnboarding: async (accountId) => {
    const response = await api.post('/marketplace/verify-onboarding/', { account_id: accountId });
    return response.data;
  },

  refreshOnboardingLink: async (accountId) => {
    const response = await api.post('/marketplace/refresh-onboarding/', { account_id: accountId });
    return response.data;
  },

  createExpressLoginLink: async (handymanId) => {
    const response = await api.post('/marketplace/express-login/', { handyman_id: handymanId });
    return response.data;
  }
};