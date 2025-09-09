import apiService from './apiService';

// Mock data for fallback - matching Django structure
const mockEstimates = [
  {
    id: 1,
    estimate_number: 'EST-0001',
    client_details: {
      id: 1,
      name: 'John Smith',
      company_name: 'Acme Corporation',
      email: 'billing@acme.com',
      client_type: 'business',
    },
    title: 'Website Development Project',
    description: 'Complete website development with SEO optimization',
    status: 'sent',
    subtotal: 3500.00,
    tax_rate: 10.00,
    tax_amount: 350.00,
    total: 3850.00,
    issue_date: '2024-01-15',
    expiry_date: '2024-02-15',
    notes: 'Please review and let us know if you have any questions.',
    terms: 'Payment due within 30 days of acceptance.',
    items: [
      {
        id: 1,
        description: 'Website Development',
        quantity: 1,
        unit_price: 3000.00,
        total: 3000.00,
      },
      {
        id: 2,
        description: 'SEO Optimization',
        quantity: 1,
        unit_price: 500.00,
        total: 500.00,
      },
    ],
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-01-15').toISOString(),
  },
  {
    id: 2,
    estimate_number: 'EST-0002',
    client_details: {
      id: 2,
      name: 'Sarah Johnson',
      company_name: 'Tech Solutions Inc',
      email: 'accounts@techsolutions.com',
      client_type: 'business',
    },
    title: 'Mobile App Design',
    description: 'Complete mobile application design with UI/UX consulting',
    status: 'draft',
    subtotal: 2200.00,
    tax_rate: 8.50,
    tax_amount: 187.00,
    total: 2387.00,
    issue_date: '2024-01-20',
    expiry_date: '2024-02-20',
    notes: 'Draft estimate for mobile app project.',
    terms: 'Payment due within 15 days of acceptance.',
    items: [
      {
        id: 3,
        description: 'Mobile App Design',
        quantity: 1,
        unit_price: 2000.00,
        total: 2000.00,
      },
      {
        id: 4,
        description: 'UI/UX Consulting',
        quantity: 2,
        unit_price: 100.00,
        total: 200.00,
      },
    ],
    created_at: new Date('2024-01-20').toISOString(),
    updated_at: new Date('2024-01-20').toISOString(),
  },
  {
    id: 3,
    estimate_number: 'EST-0003',
    client_details: {
      id: 3,
      name: 'Mike Davis',
      company_name: 'Creative Agency LLC',
      email: 'finance@creative-agency.com',
      client_type: 'business',
    },
    title: 'Brand Strategy & Design',
    description: 'Complete brand strategy with logo design and guidelines',
    status: 'accepted',
    subtotal: 4200.00,
    tax_rate: 0.00,
    tax_amount: 0.00,
    total: 4200.00,
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Accepted estimate for brand strategy project.',
    terms: 'Payment due within 30 days of acceptance.',
    items: [
      {
        id: 5,
        description: 'Brand Strategy',
        quantity: 1,
        unit_price: 2500.00,
        total: 2500.00,
      },
      {
        id: 6,
        description: 'Logo Design',
        quantity: 1,
        unit_price: 800.00,
        total: 800.00,
      },
      {
        id: 7,
        description: 'Brand Guidelines',
        quantity: 1,
        unit_price: 900.00,
        total: 900.00,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

class EstimateService {
  constructor() {
    this.useAPI = true;
    this.mockData = {
      estimates: [...mockEstimates],
    };
  }

  async getEstimates(params = {}) {
    if (this.useAPI) {
      try {
        const result = await apiService.getEstimates(params);
        return {
          success: true,
          data: result.results || result,
          total: result.count || result.length,
          source: 'api',
        };
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error.message);
        this.useAPI = false;
      }
    }
    
    // Fallback to mock data
    let filteredEstimates = [...this.mockData.estimates];
    
    if (params.status && params.status !== 'all') {
      filteredEstimates = filteredEstimates.filter(estimate => estimate.status === params.status);
    }
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredEstimates = filteredEstimates.filter(estimate => 
        estimate.estimate_number.toLowerCase().includes(searchLower) ||
        estimate.title.toLowerCase().includes(searchLower) ||
        (estimate.client_details && estimate.client_details.name.toLowerCase().includes(searchLower)) ||
        (estimate.client_details && estimate.client_details.company_name && estimate.client_details.company_name.toLowerCase().includes(searchLower))
      );
    }
    
    return {
      success: true,
      data: filteredEstimates,
      total: filteredEstimates.length,
      source: 'mock',
    };
  }

  async getEstimate(id) {
    if (this.useAPI) {
      try {
        const result = await apiService.getEstimate(id);
        return {
          success: true,
          data: result,
          source: 'api',
        };
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error.message);
      }
    }
    
    const estimate = this.mockData.estimates.find(est => est.id === id || est.id == id);
    return {
      success: !!estimate,
      data: estimate,
      source: 'mock',
    };
  }

  async createEstimate(estimateData) {
    if (this.useAPI) {
      try {
        const result = await apiService.createEstimate(estimateData);
        return {
          success: true,
          data: result,
          source: 'api',
        };
      } catch (error) {
        console.warn('API call failed, using mock creation:', error.message);
      }
    }
    
    // Mock creation
    const newEstimate = {
      id: Math.max(...this.mockData.estimates.map(e => e.id), 0) + 1,
      estimate_number: `EST-${String(this.mockData.estimates.length + 1).padStart(4, '0')}`,
      ...estimateData,
      status: estimateData.status || 'draft',
      subtotal: 0,
      tax_amount: 0,
      total: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Calculate totals if items exist
    if (newEstimate.items && newEstimate.items.length > 0) {
      newEstimate.subtotal = newEstimate.items.reduce((sum, item) => sum + (item.total || 0), 0);
      newEstimate.tax_amount = newEstimate.subtotal * ((newEstimate.tax_rate || 0) / 100);
      newEstimate.total = newEstimate.subtotal + newEstimate.tax_amount;
    }
    
    this.mockData.estimates.unshift(newEstimate);
    
    return {
      success: true,
      data: newEstimate,
      source: 'mock',
    };
  }

  async updateEstimate(id, estimateData) {
    if (this.useAPI) {
      try {
        const result = await apiService.updateEstimate(id, estimateData);
        return {
          success: true,
          data: result,
          source: 'api',
        };
      } catch (error) {
        console.warn('API call failed, using mock update:', error.message);
      }
    }
    
    // Mock update
    const index = this.mockData.estimates.findIndex(est => est.id === id || est.id == id);
    if (index !== -1) {
      this.mockData.estimates[index] = {
        ...this.mockData.estimates[index],
        ...estimateData,
        updated_at: new Date().toISOString(),
      };
      
      // Recalculate totals if items changed
      const estimate = this.mockData.estimates[index];
      if (estimate.items && estimate.items.length > 0) {
        estimate.subtotal = estimate.items.reduce((sum, item) => sum + (item.total || 0), 0);
        estimate.tax_amount = estimate.subtotal * ((estimate.tax_rate || 0) / 100);
        estimate.total = estimate.subtotal + estimate.tax_amount;
      }
      
      return {
        success: true,
        data: this.mockData.estimates[index],
        source: 'mock',
      };
    }
    
    return { success: false, error: 'Estimate not found' };
  }

  async deleteEstimate(id) {
    if (this.useAPI) {
      try {
        const result = await apiService.deleteEstimate(id);
        return {
          success: true,
          data: result,
          source: 'api',
        };
      } catch (error) {
        console.warn('API call failed, using mock deletion:', error.message);
      }
    }
    
    // Mock deletion
    const index = this.mockData.estimates.findIndex(est => est.id === id || est.id == id);
    if (index !== -1) {
      this.mockData.estimates.splice(index, 1);
      return {
        success: true,
        source: 'mock',
      };
    }
    
    return { success: false, error: 'Estimate not found' };
  }

  async getEstimateStats() {
    if (this.useAPI) {
      try {
        const result = await apiService.getEstimateStats();
        return {
          success: true,
          data: result,
          source: 'api',
        };
      } catch (error) {
        console.warn('API call failed, calculating mock stats:', error.message);
      }
    }
    
    // Mock stats calculation
    const estimates = this.mockData.estimates;
    const stats = {
      total_estimates: estimates.length,
      draft_estimates: estimates.filter(e => e.status === 'draft').length,
      sent_estimates: estimates.filter(e => e.status === 'sent').length,
      accepted_estimates: estimates.filter(e => e.status === 'accepted').length,
      rejected_estimates: estimates.filter(e => e.status === 'rejected').length,
      expired_estimates: estimates.filter(e => e.status === 'expired').length,
      total_value: estimates.reduce((sum, e) => sum + (e.total || 0), 0),
    };
    
    return {
      success: true,
      data: stats,
      source: 'mock',
    };
  }

  async convertToInvoice(id) {
    if (this.useAPI) {
      try {
        const result = await apiService.convertEstimateToInvoice(id);
        return {
          success: true,
          data: result,
          source: 'api',
        };
      } catch (error) {
        console.warn('API call failed:', error.message);
      }
    }
    
    return { 
      success: false, 
      error: 'Conversion to invoice not implemented for mock data' 
    };
  }

  async exportPDF(id) {
    if (this.useAPI) {
      try {
        const blob = await apiService.exportEstimatePDF(id);
        return {
          success: true,
          data: blob,
          source: 'api',
        };
      } catch (error) {
        console.warn('API call failed:', error.message);
        return { success: false, error: error.message };
      }
    }
    
    // Mock PDF export - just return success for now
    return { 
      success: false, 
      error: 'PDF export not available in mock mode'
    };
  }

  async sendEmail(id) {
    if (this.useAPI) {
      try {
        const result = await apiService.sendEstimateEmail(id);
        return {
          success: true,
          client_email: result.client_email,
          message: result.message,
          source: 'api',
        };
      } catch (error) {
        console.warn('API call failed:', error.message);
        return { success: false, error: error.message };
      }
    }
    
    // Mock email send - just return success for now
    return { 
      success: false, 
      error: 'Email sending not available in mock mode'
    };
  }

  // Enable/disable API usage
  setUseAPI(useAPI) {
    this.useAPI = useAPI;
  }
}

export default new EstimateService();