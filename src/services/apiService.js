import axios from 'axios';

const API_BASE_URL = "invoyci.netlify.app/api"
const API_BASE_URL_local = 'http://localhost:8000/api'; 

class ApiService {
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

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Only redirect for non-client endpoints to avoid the login loop
          const isClientEndpoint = error.config?.url?.includes('/clients');
          if (!isClientEndpoint) {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        } else if (error.response?.status === 402) {
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
  }

  // Invoice methods - now using Django endpoints
  async getInvoices(params = {}) {
    try {
      const response = await this.client.get('/invoices/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async getInvoice(id) {
    try {
      const response = await this.client.get(`/invoices/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  async createInvoice(invoiceData) {
    try {
      const response = await this.client.post('/invoices/', invoiceData);
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async updateInvoice(id, invoiceData) {
    try {
      const response = await this.client.patch(`/invoices/${id}/`, invoiceData);
      return response.data;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  async deleteInvoice(id) {
    try {
      const response = await this.client.delete(`/invoices/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  async sendInvoice(id) {
    try {
      const response = await this.client.post(`/invoices/${id}/send_invoice/`);
      return response.data;
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw error;
    }
  }

  async recordPayment(id, paymentData) {
    try {
      const response = await this.client.post(`/invoices/${id}/record_payment/`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  async processStripePayment(id, paymentData) {
    try {
      const response = await this.client.post(`/invoices/${id}/process_stripe_payment/`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      throw error;
    }
  }

  async createStripePaymentLink(id, paymentData) {
    try {
      const response = await this.client.post(`/invoices/${id}/create_stripe_payment_link/`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating Stripe payment link:', error);
      throw error;
    }
  }

  async getStripeConfig() {
    try {
      const response = await this.client.get('/invoices/stripe_config/');
      return response.data;
    } catch (error) {
      console.error('Error fetching Stripe config:', error);
      throw error;
    }
  }

  async exportInvoicesPDF() {
    try {
      const response = await this.client.get('/invoices/export_pdf/', {
        responseType: 'blob', // Important for handling binary data
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting invoices PDF:', error);
      throw error;
    }
  }

  async exportInvoicePDF(id) {
    try {
      const response = await this.client.get(`/invoices/${id}/export_invoice_pdf/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting invoice PDF:', error);
      throw error;
    }
  }

  async exportMultipleInvoicesPDF(invoiceIds) {
    try {
      const response = await this.client.post('/invoices/export_multiple_invoices_pdf/', {
        invoice_ids: invoiceIds
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting multiple invoices PDF:', error);
      throw error;
    }
  }

  // Client methods - now using Django endpoints
  async getClients(params = {}) {
    try {
      const response = await this.client.get('/clients/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  async getClient(id) {
    try {
      const response = await this.client.get(`/clients/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  }

  async createClient(clientData) {
    try {
      const response = await this.client.post('/clients/', clientData);
      return response.data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async updateClient(id, clientData) {
    try {
      const response = await this.client.put(`/clients/${id}/`, clientData);
      return response.data;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  async deleteClient(id) {
    try {
      const response = await this.client.delete(`/clients/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  async getClientStats() {
    try {
      const response = await this.client.get('/clients/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching client stats:', error);
      throw error;
    }
  }

  async toggleClientArchive(id) {
    try {
      const response = await this.client.patch(`/clients/${id}/archive/`);
      return response.data;
    } catch (error) {
      console.error('Error toggling client archive:', error);
      throw error;
    }
  }

  async exportClientsPDF() {
    try {
      const response = await this.client.get('/clients/export_pdf/', {
        responseType: 'blob', // Important for handling binary data
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting clients PDF:', error);
      throw error;
    }
  }

  // Estimate methods - now using Django endpoints
  async getEstimates(params = {}) {
    try {
      const response = await this.client.get('/estimates/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching estimates:', error);
      throw error;
    }
  }

  async getEstimate(id) {
    try {
      const response = await this.client.get(`/estimates/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching estimate:', error);
      throw error;
    }
  }

  async createEstimate(estimateData) {
    try {
      const response = await this.client.post('/estimates/', estimateData);
      return response.data;
    } catch (error) {
      console.error('Error creating estimate:', error);
      throw error;
    }
  }

  async updateEstimate(id, estimateData) {
    try {
      const response = await this.client.patch(`/estimates/${id}/`, estimateData);
      return response.data;
    } catch (error) {
      console.error('Error updating estimate:', error);
      throw error;
    }
  }

  async deleteEstimate(id) {
    try {
      const response = await this.client.delete(`/estimates/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting estimate:', error);
      throw error;
    }
  }

  async convertEstimateToInvoice(id) {
    try {
      const response = await this.client.post(`/estimates/${id}/convert_to_invoice/`);
      return response.data;
    } catch (error) {
      console.error('Error converting estimate to invoice:', error);
      throw error;
    }
  }

  async getEstimateStats() {
    try {
      const response = await this.client.get('/estimates/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching estimate stats:', error);
      throw error;
    }
  }

  async exportEstimatePDF(id) {
    try {
      const response = await this.client.get(`/estimates/${id}/export_pdf/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting estimate PDF:', error);
      throw error;
    }
  }

  async sendEstimateEmail(id) {
    try {
      const response = await this.client.post(`/estimates/${id}/send_email/`);
      return response.data;
    } catch (error) {
      console.error('Error sending estimate email:', error);
      throw error;
    }
  }

  // Reports and Analytics methods
  async getInvoiceAnalytics() {
    try {
      const response = await this.client.get('/invoices/analytics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice analytics:', error);
      throw error;
    }
  }

  async getClientAnalytics() {
    try {
      const response = await this.client.get('/clients/analytics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching client analytics:', error);
      throw error;
    }
  }

  async getEstimateAnalytics() {
    try {
      const response = await this.client.get('/estimates/analytics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching estimate analytics:', error);
      throw error;
    }
  }

  // Dashboard stats method
  async getDashboardStats() {
    try {
      const response = await this.client.get('/dashboard/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Combined analytics for reports dashboard
  async getDashboardAnalytics() {
    try {
      const [invoiceAnalytics, clientAnalytics, estimateAnalytics] = await Promise.all([
        this.getInvoiceAnalytics(),
        this.getClientAnalytics(),
        this.getEstimateAnalytics()
      ]);

      return {
        invoices: invoiceAnalytics,
        clients: clientAnalytics,
        estimates: estimateAnalytics
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  }
}

export default new ApiService();