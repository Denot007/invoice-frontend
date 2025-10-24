import apiService from './apiService';

class ClientService {
  async getClients(params = {}) {
    const result = await apiService.getClients(params);
    return {
      success: true,
      data: result.results || [],
      total: result.count || 0,
      source: 'api',
    };
  }

  async getClient(id) {
    const result = await apiService.getClient(id);
    return {
      success: true,
      data: result,
      source: 'api',
    };
  }

  async createClient(clientData) {
    const result = await apiService.createClient(clientData);
    return {
      success: true,
      data: result,
      source: 'api',
    };
  }

  async updateClient(id, clientData) {
    const result = await apiService.updateClient(id, clientData);
    return {
      success: true,
      data: result,
      source: 'api',
    };
  }

  async deleteClient(id) {
    const result = await apiService.deleteClient(id);
    return {
      success: true,
      data: result,
      source: 'api',
    };
  }

  async getClientStats() {
    const result = await apiService.getClientStats();
    return {
      success: true,
      data: result,
      source: 'api',
    };
  }

  async toggleClientArchive(id) {
    const result = await apiService.toggleClientArchive(id);
    return {
      success: true,
      data: result,
      source: 'api',
    };
  }

  async getUsageLimits() {
    const result = await apiService.getClientUsageLimits();
    return result;
  }

  async exportClientsPDF() {
    try {
      const pdfBlob = await apiService.exportClientsPDF();

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with current date
      const today = new Date();
      const dateString = today.toISOString().split('T')[0].replace(/-/g, '');
      link.download = `clients_report_${dateString}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'Client directory PDF downloaded successfully!',
        source: 'api',
      };
    } catch (error) {
      console.error('Error exporting clients PDF:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Failed to export client directory PDF',
      };
    }
  }
}

export default new ClientService();
