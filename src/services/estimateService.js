import apiService from './apiService';

class EstimateService {
  async getEstimates(params = {}) {
    const result = await apiService.getEstimates(params);
    return {
      success: true,
      data: result.results || result,
      total: result.count || result.length,
      source: 'api',
    };
  }

  async getEstimate(id) {
    const result = await apiService.getEstimate(id);
    return {
      success: true,
      data: result,
      source: 'api',
    };
  }

  async createEstimate(estimateData) {
    const result = await apiService.createEstimate(estimateData);
    return {
      success: true,
      data: result,
      source: 'api',
    };
  }

  async updateEstimate(id, estimateData) {
    const result = await apiService.updateEstimate(id, estimateData);
    return {
      success: true,
      data: result,
      source: 'api',
    };
  }

  async deleteEstimate(id) {
    const result = await apiService.deleteEstimate(id);
    return {
      success: true,
      data: result,
      source: 'api',
    };
  }

  async getEstimateStats() {
    const result = await apiService.getEstimateStats();
    return {
      success: true,
      data: result,
      source: 'api',
    };
  }

  async convertToInvoice(id) {
    const result = await apiService.convertEstimateToInvoice(id);
    return {
      success: true,
      data: result,
      source: 'api',
    };
  }

  async exportPDF(id) {
    try {
      const blob = await apiService.exportEstimatePDF(id);
      return {
        success: true,
        data: blob,
        source: 'api',
      };
    } catch (error) {
      console.error('PDF export failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendEmail(id) {
    try {
      const result = await apiService.sendEstimateEmail(id);
      return {
        success: true,
        client_email: result.client_email,
        message: result.message,
        source: 'api',
      };
    } catch (error) {
      console.error('Email send failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default new EstimateService();
