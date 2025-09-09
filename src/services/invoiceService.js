import apiService from './apiService';


class InvoiceService {
  constructor() {
    this.useAPI = true;
  }

  async getInvoices(params = {}) {
    if (this.useAPI) {
      try {
        const result = await apiService.getInvoices(params);
        console.log('Invoice API Response:', result); // Debug log
        
        // Map Django API response to frontend format
        // Handle different response formats
        let invoiceData = [];
        if (result) {
          if (result.results) {
            // Paginated response
            invoiceData = result.results;
          } else if (Array.isArray(result)) {
            // Direct array response
            invoiceData = result;
          } else if (result.data && Array.isArray(result.data)) {
            // Data wrapped in data property
            invoiceData = result.data;
          } else {
            console.warn('Unexpected invoice response format:', result);
          }
        }
        console.log('Invoice Data to map:', invoiceData); // Debug log
        
        const mappedData = invoiceData.map(invoice => {
          // Determine display name for client
          let clientDisplayName = 'Unknown Client';
          if (invoice.client_details) {
            if (invoice.client_details.client_type === 'business' && invoice.client_details.company_name) {
              clientDisplayName = invoice.client_details.company_name;
            } else {
              clientDisplayName = invoice.client_details.name;
            }
          }
          
          return {
            id: invoice.id,
            _id: invoice.id, // For compatibility
            invoiceNumber: invoice.invoice_number,
            client: invoice.client_details ? {
              ...invoice.client_details,
              name: clientDisplayName,
              displayName: clientDisplayName
            } : {
              id: invoice.client,
              name: clientDisplayName,
              email: ''
            },
            status: invoice.status,
            title: invoice.title || '',
            description: invoice.description || '',
            total: parseFloat(invoice.total || 0),
            amount_paid: parseFloat(invoice.amount_paid || 0),
            balance_due: parseFloat(invoice.balance_due || 0),
            amountDue: parseFloat(invoice.balance_due || 0), // For backwards compatibility
            issueDate: invoice.issue_date,
            dueDate: invoice.due_date,
            items: invoice.items || [],
            payments: invoice.payments || [],
            subtotal: parseFloat(invoice.subtotal || 0),
            tax: parseFloat(invoice.tax_rate || 0),
            taxAmount: parseFloat(invoice.tax_amount || 0),
            notes: invoice.notes || '',
            terms: invoice.terms || '',
            createdAt: invoice.created_at,
            updatedAt: invoice.updated_at
          };
        });
        
        return {
          success: true,
          data: mappedData,
          total: result.count || mappedData.length,
          source: 'api',
        };
      } catch (error) {
        console.error('API call failed:', error.message);
        return {
          success: false,
          data: [],
          total: 0,
          error: error.message,
        };
      }
    }
    
    return {
      success: false,
      data: [],
      total: 0,
      error: 'API service not available',
    };
  }

  async getInvoice(id) {
    if (this.useAPI) {
      try {
        const result = await apiService.getInvoice(id);
        // Map Django API response to frontend format
        const invoice = result.data || result;
        
        // Determine display name for client
        let clientDisplayName = 'Unknown Client';
        if (invoice.client_details) {
          if (invoice.client_details.client_type === 'business' && invoice.client_details.company_name) {
            clientDisplayName = invoice.client_details.company_name;
          } else {
            clientDisplayName = invoice.client_details.name;
          }
        }
        
        const mappedData = {
          id: invoice.id,
          _id: invoice.id,
          invoiceNumber: invoice.invoice_number,
          client: invoice.client_details ? {
            ...invoice.client_details,
            name: clientDisplayName,
            displayName: clientDisplayName
          } : {
            id: invoice.client,
            name: clientDisplayName,
            email: ''
          },
          status: invoice.status,
          title: invoice.title || '',
          description: invoice.description || '',
          total: parseFloat(invoice.total || 0),
          amountDue: parseFloat(invoice.balance_due || 0),
          issueDate: invoice.issue_date,
          dueDate: invoice.due_date,
          items: invoice.items || [],
          subtotal: parseFloat(invoice.subtotal || 0),
          tax: parseFloat(invoice.tax_rate || 0),
          taxAmount: parseFloat(invoice.tax_amount || 0),
          notes: invoice.notes || '',
          terms: invoice.terms || '',
          createdAt: invoice.created_at,
          updatedAt: invoice.updated_at
        };
        
        return {
          success: true,
          data: mappedData,
          source: 'api',
        };
      } catch (error) {
        console.error('API call failed:', error.message);
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }
    }
    
    return {
      success: false,
      data: null,
      error: 'API service not available',
    };
  }

  async createInvoice(invoiceData) {
    if (this.useAPI) {
      try {
        // Map data to Django backend structure
        const backendData = {
          client: invoiceData.client,
          invoice_number: invoiceData.invoice_number || '',
          title: invoiceData.title,
          description: invoiceData.description || '',
          issue_date: invoiceData.issue_date,
          due_date: invoiceData.due_date,
          notes: invoiceData.notes || '',
          terms: invoiceData.terms || '',
          tax_rate: parseFloat(invoiceData.tax_rate) || 0,
          status: invoiceData.status || 'draft',
          items: invoiceData.items || [],
        };
        
        const result = await apiService.createInvoice(backendData);
        // Map the created invoice response
        const invoice = result.data || result;
        
        // Determine display name for client
        let clientDisplayName = 'Unknown Client';
        if (invoice.client_details) {
          if (invoice.client_details.client_type === 'business' && invoice.client_details.company_name) {
            clientDisplayName = invoice.client_details.company_name;
          } else {
            clientDisplayName = invoice.client_details.name;
          }
        }
        
        const mappedData = {
          id: invoice.id,
          _id: invoice.id,
          invoiceNumber: invoice.invoice_number,
          client: invoice.client_details ? {
            ...invoice.client_details,
            name: clientDisplayName,
            displayName: clientDisplayName
          } : {
            id: invoice.client,
            name: clientDisplayName,
            email: ''
          },
          status: invoice.status,
          title: invoice.title || '',
          description: invoice.description || '',
          total: parseFloat(invoice.total || 0),
          amountDue: parseFloat(invoice.balance_due || 0),
          issueDate: invoice.issue_date,
          dueDate: invoice.due_date,
          items: invoice.items || [],
          subtotal: parseFloat(invoice.subtotal || 0),
          tax: parseFloat(invoice.tax_rate || 0),
          taxAmount: parseFloat(invoice.tax_amount || 0),
          notes: invoice.notes || '',
          terms: invoice.terms || '',
          createdAt: invoice.created_at,
          updatedAt: invoice.updated_at
        };
        
        return {
          success: true,
          data: mappedData,
          source: 'api',
        };
      } catch (error) {
        console.error('Error creating invoice:', error.message);
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }
    }
    
    return {
      success: false,
      data: null,
      error: 'API service not available',
    };
  }

  async updateInvoice(id, invoiceData) {
    if (this.useAPI) {
      try {
        // Map data to Django backend structure
        const backendData = {
          client: invoiceData.client,
          invoice_number: invoiceData.invoice_number,
          title: invoiceData.title,
          description: invoiceData.description || '',
          issue_date: invoiceData.issue_date,
          due_date: invoiceData.due_date,
          notes: invoiceData.notes || '',
          terms: invoiceData.terms || '',
          tax_rate: parseFloat(invoiceData.tax_rate) || 0,
          status: invoiceData.status || 'draft',
          items: invoiceData.items || [],
        };
        
        const result = await apiService.updateInvoice(id, backendData);
        // Map the updated invoice response
        const invoice = result.data || result;
        
        // Determine display name for client
        let clientDisplayName = 'Unknown Client';
        if (invoice.client_details) {
          if (invoice.client_details.client_type === 'business' && invoice.client_details.company_name) {
            clientDisplayName = invoice.client_details.company_name;
          } else {
            clientDisplayName = invoice.client_details.name;
          }
        }
        
        const mappedData = {
          id: invoice.id,
          _id: invoice.id,
          invoiceNumber: invoice.invoice_number,
          client: invoice.client_details ? {
            ...invoice.client_details,
            name: clientDisplayName,
            displayName: clientDisplayName
          } : {
            id: invoice.client,
            name: clientDisplayName,
            email: ''
          },
          status: invoice.status,
          title: invoice.title || '',
          description: invoice.description || '',
          total: parseFloat(invoice.total || 0),
          amountDue: parseFloat(invoice.balance_due || 0),
          issueDate: invoice.issue_date,
          dueDate: invoice.due_date,
          items: invoice.items || [],
          subtotal: parseFloat(invoice.subtotal || 0),
          tax: parseFloat(invoice.tax_rate || 0),
          taxAmount: parseFloat(invoice.tax_amount || 0),
          notes: invoice.notes || '',
          terms: invoice.terms || '',
          createdAt: invoice.created_at,
          updatedAt: invoice.updated_at
        };
        
        return {
          success: true,
          data: mappedData,
          source: 'api',
        };
      } catch (error) {
        console.error('Error updating invoice:', error.message);
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }
    }
    
    return {
      success: false,
      data: null,
      error: 'API service not available',
    };
  }

  async deleteInvoice(id) {
    if (this.useAPI) {
      try {
        const result = await apiService.deleteInvoice(id);
        return {
          success: true,
          data: result.data,
          source: 'api',
        };
      } catch (error) {
        console.error('Error deleting invoice:', error.message);
        return {
          success: false,
          error: error.message,
        };
      }
    }
    
    return {
      success: false,
      error: 'API service not available',
    };
  }

  async sendInvoice(id) {
    if (this.useAPI) {
      try {
        const result = await apiService.sendInvoice(id);
        return {
          success: result.success !== false,
          message: result.message || 'Invoice sent successfully',
          data: result,
          source: 'api',
        };
      } catch (error) {
        console.error('Error sending invoice:', error.message);
        return {
          success: false,
          error: error.message,
          message: 'Failed to send invoice',
        };
      }
    }
    
    return {
      success: false,
      error: 'API service not available',
      message: 'Cannot send invoice - API service not available',
    };
  }

  async recordPayment(invoiceId, paymentData) {
    if (this.useAPI) {
      try {
        const result = await apiService.recordPayment(invoiceId, paymentData);
        return {
          success: true,
          data: result,
          message: 'Payment recorded successfully',
        };
      } catch (error) {
        console.error('Error recording payment:', error.message);
        return {
          success: false,
          error: error.message,
          message: 'Failed to record payment',
        };
      }
    }
    
    return {
      success: false,
      error: 'API service not available',
      message: 'Cannot record payment - API service not available',
    };
  }

  async processStripePayment(invoiceId, paymentData) {
    if (this.useAPI) {
      try {
        const result = await apiService.processStripePayment(invoiceId, paymentData);
        return {
          success: true,
          data: result,
          charge_id: result.charge_id,
          payment_intent_id: result.payment_intent_id,
          message: 'Stripe payment processed successfully',
        };
      } catch (error) {
        console.error('Error processing Stripe payment:', error.message);
        return {
          success: false,
          error: error.message,
          message: 'Failed to process Stripe payment',
        };
      }
    }
    
    return {
      success: false,
      error: 'API service not available',
      message: 'Cannot process Stripe payment - API service not available',
    };
  }

  async createStripePaymentLink(invoiceId, paymentData) {
    if (this.useAPI) {
      try {
        const result = await apiService.createStripePaymentLink(invoiceId, paymentData);
        return {
          success: true,
          data: result,
          payment_link_url: result.payment_link_url,
          payment_link_id: result.payment_link_id,
          message: 'Stripe payment link created successfully',
        };
      } catch (error) {
        console.error('Error creating Stripe payment link:', error.message);
        return {
          success: false,
          error: error.message,
          message: 'Failed to create Stripe payment link',
        };
      }
    }
    
    return {
      success: false,
      error: 'API service not available',
      message: 'Cannot create Stripe payment link - API service not available',
    };
  }

  async exportMultipleInvoicesPDF(invoiceIds) {
    if (this.useAPI) {
      try {
        const result = await apiService.exportMultipleInvoicesPDF(invoiceIds);
        
        // Create download link
        const url = window.URL.createObjectURL(result);
        const link = document.createElement('a');
        link.href = url;
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        link.download = `invoices-${today}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return {
          success: true,
          message: `Multiple invoices PDF (${invoiceIds.length} invoices) downloaded successfully`,
        };
      } catch (error) {
        console.error('Error exporting multiple invoices PDF:', error.message);
        return {
          success: false,
          error: error.message,
          message: 'Failed to export multiple invoices PDF',
        };
      }
    }
    
    return {
      success: false,
      error: 'API service not available',
      message: 'Cannot export multiple invoices - API service not available',
    };
  }

  async getClients() {
    if (this.useAPI) {
      try {
        const result = await apiService.getClients();
        return {
          success: true,
          data: result.results || result.data || [],
          source: 'api',
        };
      } catch (error) {
        console.error('Error fetching clients:', error.message);
        return {
          success: false,
          data: [],
          error: error.message,
        };
      }
    }
    
    return {
      success: false,
      data: [],
      error: 'API service not available',
    };
  }

  async exportInvoicesPDF() {
    if (this.useAPI) {
      try {
        const pdfBlob = await apiService.exportInvoicesPDF();
        
        // Create download link
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename with current date
        const today = new Date();
        const dateString = today.toISOString().split('T')[0].replace(/-/g, '');
        link.download = `invoice_report_${dateString}.pdf`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(url);
        
        return {
          success: true,
          message: 'PDF report downloaded successfully!',
          source: 'api',
        };
      } catch (error) {
        console.error('Error exporting PDF:', error.message);
        return {
          success: false,
          error: error.message,
          message: 'Failed to export PDF report',
        };
      }
    }
    
    return {
      success: false,
      error: 'API service not available',
      message: 'Cannot export PDF - API service not available',
    };
  }

  async exportInvoicePDF(id) {
    if (this.useAPI) {
      try {
        const pdfBlob = await apiService.exportInvoicePDF(id);
        
        // Create download link
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename with invoice ID
        link.download = `invoice_${id}.pdf`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(url);
        
        return {
          success: true,
          message: 'Invoice PDF downloaded successfully!',
          source: 'api',
        };
      } catch (error) {
        console.error('Error exporting invoice PDF:', error.message);
        return {
          success: false,
          error: error.message,
          message: 'Failed to export invoice PDF',
        };
      }
    }
    
    return {
      success: false,
      error: 'API service not available',
      message: 'Cannot export PDF - API service not available',
    };
  }

}

export default new InvoiceService();