import axios from 'axios';
import { API_BASE_URL } from './urls';


class BillingService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    this.client.interceptors.request.use(
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
  }

  // Subscription methods
  async getCurrentSubscription() {
    try {
      const response = await this.client.get('/billing/subscriptions/current/');
      return response.data;
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      throw error;
    }
  }

  async getPlans() {
    try {
      const response = await this.client.get('/billing/plans/');
      // Handle paginated response - return the results array
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  async createCheckoutSession(planId) {
    try {
      const response = await this.client.post('/billing/subscriptions/create_checkout_session/', {
        plan_id: planId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async getBillingPortal() {
    try {
      const response = await this.client.get('/billing/subscriptions/billing_portal/');
      return response.data;
    } catch (error) {
      console.error('Error getting billing portal:', error);
      throw error;
    }
  }

  async cancelSubscription() {
    try {
      const response = await this.client.post('/billing/subscriptions/cancel_subscription/');
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async restoreSubscription() {
    try {
      const response = await this.client.post('/billing/subscriptions/restore_subscription/');
      return response.data;
    } catch (error) {
      console.error('Error restoring subscription:', error);
      throw error;
    }
  }

  async syncSubscription() {
    try {
      const response = await this.client.post('/billing/subscriptions/sync_subscription/');
      return response.data;
    } catch (error) {
      console.error('Error syncing subscription:', error);
      throw error;
    }
  }

  async expireTrial() {
    try {
      const response = await this.client.post('/billing/subscriptions/expire_trial/');
      return response.data;
    } catch (error) {
      console.error('Error expiring trial:', error);
      throw error;
    }
  }
}

export default new BillingService();