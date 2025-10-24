import apiService from './apiService';

class SubscriptionService {
  async getPlans() {
    try {
      const response = await apiService.client.get('/billing/plans/');
      return response.data;
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  async getSubscription() {
    try {
      const response = await apiService.client.get('/billing/subscriptions/');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  async createSubscription(planId) {
    try {
      const response = await apiService.client.post('/billing/subscriptions/', {
        plan_id: planId,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const response = await apiService.client.delete(`/billing/subscriptions/${subscriptionId}/`);
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }
}

export default new SubscriptionService();
