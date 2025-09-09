import apiService from './apiService';

// Mock data for fallback
const mockClients = [
  {
    _id: 'mock_client_1',
    name: 'John Smith',
    company_name: 'Acme Corporation',
    email: 'billing@acme.com',
    phone: '+1-555-123-4567',
    client_type: 'business',
    status: 'active',
    address: '123 Business Ave, New York, NY 10001, USA',
    website: 'https://acme.com',
    tax_id: '12-3456789',
    notes: 'Key client with monthly recurring invoices. CFO is John Smith.',
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-01-15').toISOString(),
  },
  {
    _id: 'mock_client_2',
    name: 'Sarah Johnson',
    company_name: 'Tech Solutions Inc',
    email: 'accounts@techsolutions.com',
    phone: '+1-555-987-6543',
    client_type: 'business',
    status: 'inactive',
    address: '456 Tech Plaza, San Francisco, CA 94107, USA',
    website: 'https://techsolutions.com',
    tax_id: '98-7654321',
    notes: 'Fast payment terms - 15 days. Contact Sarah for all inquiries.',
    created_at: new Date('2024-01-20').toISOString(),
    updated_at: new Date('2024-02-15').toISOString(),
  },
  {
    _id: 'mock_client_3',
    name: 'Mike Davis',
    company_name: 'Creative Agency LLC',
    email: 'finance@creative-agency.com',
    phone: '+1-555-456-7890',
    client_type: 'business',
    status: 'active',
    address: '789 Design Street, Austin, TX 73301, USA',
    website: 'https://creative-agency.com',
    tax_id: '55-9876543',
    notes: 'New client - still onboarding process.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    _id: 'mock_client_4',
    name: 'Jane Doe',
    email: 'jane.doe@email.com',
    phone: '+1-555-111-2222',
    client_type: 'individual',
    status: 'active',
    address: '321 Personal Drive, Miami, FL 33101, USA',
    website: '',
    tax_id: '',
    notes: 'Individual client for consulting services.',
    created_at: new Date('2024-02-01').toISOString(),
    updated_at: new Date('2024-02-01').toISOString(),
  },
];

class ClientService {
  constructor() {
    this.useAPI = true;
    this.mockData = {
      clients: [...mockClients],
    };
  }

  // Save mock data to localStorage
  saveMockData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.mockData.clients));
  }

  async getClients(params = {}) {
    if (this.useAPI) {
      try {
        const result = await apiService.getClients(params);
        return {
          success: true,
          data: result.results || [],
          total: result.count || 0,
          source: 'api',
        };
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error.message);
        this.useAPI = false;
      }
    }
    
    // Fallback to mock data
    let filteredClients = [...this.mockData.clients];
    
    if (params.status && params.status !== 'all') {
      filteredClients = filteredClients.filter(client => client.status === params.status);
    }
    
    if (params.type && params.type !== 'all') {
      filteredClients = filteredClients.filter(client => client.client_type === params.type);
    }
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredClients = filteredClients.filter(client => 
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        (client.phone && client.phone.toLowerCase().includes(searchLower))
      );
    }
    
    return {
      success: true,
      data: filteredClients,
      total: filteredClients.length,
      source: 'mock',
    };
  }

  async getClient(id) {
    if (this.useAPI) {
      try {
        const result = await apiService.getClient(id);
        return {
          success: true,
          data: result,
          source: 'api',
        };
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error.message);
      }
    }
    
    const client = this.mockData.clients.find(client => client._id === id);
    return {
      success: !!client,
      data: client,
      source: 'mock',
    };
  }

  async createClient(clientData) {
    if (this.useAPI) {
      try {
        const result = await apiService.createClient(clientData);
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
    const newClient = {
      _id: `mock_client_${Date.now()}`,
      ...clientData,
      status: clientData.status || 'active',
      balance: 0,
      totalPaid: 0,
      totalDue: 0,
      createdAt: new Date().toISOString(),
    };
    
    this.mockData.clients.unshift(newClient);
    this.saveMockData();
    
    return {
      success: true,
      data: newClient,
      source: 'mock',
    };
  }

  async updateClient(id, clientData) {
    if (this.useAPI) {
      try {
        const result = await apiService.updateClient(id, clientData);
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
    const index = this.mockData.clients.findIndex(client => client._id === id);
    if (index !== -1) {
      this.mockData.clients[index] = {
        ...this.mockData.clients[index],
        ...clientData,
        updatedAt: new Date().toISOString(),
      };
      this.saveMockData();
      
      return {
        success: true,
        data: this.mockData.clients[index],
        source: 'mock',
      };
    }
    
    return { success: false, error: 'Client not found' };
  }

  async deleteClient(id) {
    if (this.useAPI) {
      try {
        const result = await apiService.deleteClient(id);
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
    const index = this.mockData.clients.findIndex(client => client._id === id);
    if (index !== -1) {
      this.mockData.clients.splice(index, 1);
      this.saveMockData();
      return {
        success: true,
        source: 'mock',
      };
    }
    
    return { success: false, error: 'Client not found' };
  }

  async getClientStats() {
    if (this.useAPI) {
      try {
        const result = await apiService.getClientStats();
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
    const clients = this.mockData.clients;
    const stats = {
      total: clients.length,
      active: clients.filter(c => c.status === 'active').length,
      inactive: clients.filter(c => c.status === 'inactive').length,
      business: clients.filter(c => c.client_type === 'business').length,
      individual: clients.filter(c => c.client_type === 'individual').length,
    };
    
    return {
      success: true,
      data: stats,
      source: 'mock',
    };
  }

  async toggleClientArchive(id) {
    if (this.useAPI) {
      try {
        const result = await apiService.toggleClientArchive(id);
        return {
          success: true,
          data: result,
          source: 'api',
        };
      } catch (error) {
        console.warn('API call failed, using mock toggle:', error.message);
      }
    }
    
    // Mock archive toggle
    const index = this.mockData.clients.findIndex(client => client._id === id);
    if (index !== -1) {
      const client = this.mockData.clients[index];
      client.status = client.status === 'active' ? 'inactive' : 'active';
      client.updatedAt = new Date().toISOString();
      this.saveMockData();
      
      return {
        success: true,
        data: client,
        source: 'mock',
      };
    }
    
    return { success: false, error: 'Client not found' };
  }

  async exportClientsPDF() {
    if (this.useAPI) {
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
    
    return {
      success: false,
      error: 'API service not available',
      message: 'Cannot export PDF - API service not available',
    };
  }

  // Enable/disable API usage
  setUseAPI(useAPI) {
    this.useAPI = useAPI;
  }
}

export default new ClientService();