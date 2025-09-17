import api from './api';

class DocumentService {
  // Document Templates
  async getTemplates(params = {}) {
    try {
      const response = await api.get('/documents/templates/', { params });
      return response.data;
    } catch (error) {
      console.error('DocumentService.getTemplates error:', error);
      throw error;
    }
  }

  async getTemplate(id) {
    try {
      const response = await api.get(`/documents/templates/${id}/`);
      return response.data;
    } catch (error) {
      console.error('DocumentService.getTemplate error:', error);
      throw error;
    }
  }

  async createTemplate(data) {
    try {
      const response = await api.post('/documents/templates/', data);
      return response.data;
    } catch (error) {
      console.error('DocumentService.createTemplate error:', error);
      throw error;
    }
  }

  async updateTemplate(id, data) {
    try {
      const response = await api.put(`/documents/templates/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('DocumentService.updateTemplate error:', error);
      throw error;
    }
  }

  async deleteTemplate(id) {
    try {
      const response = await api.delete(`/documents/templates/${id}/`);
      return response.data;
    } catch (error) {
      console.error('DocumentService.deleteTemplate error:', error);
      throw error;
    }
  }

  async getTemplatesByType(templateType) {
    try {
      const response = await api.get('/documents/templates/by_type/', {
        params: { type: templateType }
      });
      return response.data;
    } catch (error) {
      console.error('DocumentService.getTemplatesByType error:', error);
      throw error;
    }
  }

  async getDefaultTemplates() {
    try {
      const response = await api.get('/documents/templates/default_templates/');
      return response.data;
    } catch (error) {
      console.error('DocumentService.getDefaultTemplates error:', error);
      throw error;
    }
  }

  async duplicateTemplate(id, name) {
    try {
      const response = await api.post(`/documents/templates/${id}/duplicate/`, { name });
      return response.data;
    } catch (error) {
      console.error('DocumentService.duplicateTemplate error:', error);
      throw error;
    }
  }

  async previewTemplate(id, data = {}) {
    try {
      const response = await api.post(`/documents/templates/${id}/preview/`, data, {
        responseType: data.format === 'pdf' ? 'blob' : 'json'
      });
      return response.data;
    } catch (error) {
      console.error('DocumentService.previewTemplate error:', error);
      throw error;
    }
  }

  async installTemplateLibrary() {
    try {
      const response = await api.post('/documents/templates/install_template_library/');
      return response.data;
    } catch (error) {
      console.error('DocumentService.installTemplateLibrary error:', error);
      throw error;
    }
  }

  async setTemplateAsDefault(templateId) {
    try {
      const response = await api.post(`/documents/templates/${templateId}/set_as_default/`);
      return response.data;
    } catch (error) {
      console.error('DocumentService.setTemplateAsDefault error:', error);
      throw error;
    }
  }

  // Document Generation
  async generateDocument(contentType, objectId, options = {}) {
    try {
      const response = await api.post(
        `/documents/generate/generate/${contentType}/${objectId}/`,
        options,
        { responseType: 'blob' }
      );
      return response;
    } catch (error) {
      console.error('DocumentService.generateDocument error:', error);
      throw error;
    }
  }

  async generateInvoicePDF(invoiceId, templateId = null, customSettings = {}) {
    try {
      const options = {
        format: 'pdf',
        save_version: true,
        ...customSettings
      };
      
      if (templateId) {
        options.template_id = templateId;
      }

      const response = await this.generateDocument('invoice', invoiceId, options);
      return response;
    } catch (error) {
      console.error('DocumentService.generateInvoicePDF error:', error);
      throw error;
    }
  }

  async generateEstimatePDF(estimateId, templateId = null, customSettings = {}) {
    try {
      const options = {
        format: 'pdf',
        save_version: true,
        ...customSettings
      };
      
      if (templateId) {
        options.template_id = templateId;
      }

      const response = await this.generateDocument('estimate', estimateId, options);
      return response;
    } catch (error) {
      console.error('DocumentService.generateEstimatePDF error:', error);
      throw error;
    }
  }

  // Document Themes
  async getThemes() {
    try {
      const response = await api.get('/documents/themes/');
      return response.data;
    } catch (error) {
      console.error('DocumentService.getThemes error:', error);
      throw error;
    }
  }

  async createTheme(data) {
    try {
      const response = await api.post('/documents/themes/', data);
      return response.data;
    } catch (error) {
      console.error('DocumentService.createTheme error:', error);
      throw error;
    }
  }

  // Document Versions
  async getDocumentVersions(contentType, objectId) {
    try {
      const response = await api.get('/documents/versions/for_document/', {
        params: {
          content_type: contentType,
          object_id: objectId
        }
      });
      return response.data;
    } catch (error) {
      console.error('DocumentService.getDocumentVersions error:', error);
      throw error;
    }
  }

  async downloadDocumentVersion(versionId) {
    try {
      const response = await api.get(`/documents/versions/${versionId}/download/`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('DocumentService.downloadDocumentVersion error:', error);
      throw error;
    }
  }

  // Document Attachments
  async getDocumentAttachments(contentType, objectId) {
    try {
      const response = await api.get('/documents/attachments/for_document/', {
        params: {
          content_type: contentType,
          object_id: objectId
        }
      });
      return response.data;
    } catch (error) {
      console.error('DocumentService.getDocumentAttachments error:', error);
      throw error;
    }
  }

  async uploadAttachment(contentType, objectId, file, description = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('content_type_model', contentType);
      formData.append('object_id', objectId);
      formData.append('name', file.name);
      if (description) {
        formData.append('description', description);
      }

      const response = await api.post('/documents/attachments/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('DocumentService.uploadAttachment error:', error);
      throw error;
    }
  }

  async deleteAttachment(attachmentId) {
    try {
      const response = await api.delete(`/documents/attachments/${attachmentId}/`);
      return response.data;
    } catch (error) {
      console.error('DocumentService.deleteAttachment error:', error);
      throw error;
    }
  }

  // Utility methods
  downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async downloadInvoicePDF(invoiceId, templateId = null, filename = null) {
    try {
      const response = await this.generateInvoicePDF(invoiceId, templateId);
      const blob = response.data;
      const downloadFilename = filename || `invoice-${invoiceId}.pdf`;
      this.downloadBlob(blob, downloadFilename);
      return response;
    } catch (error) {
      console.error('DocumentService.downloadInvoicePDF error:', error);
      throw error;
    }
  }

  async downloadEstimatePDF(estimateId, templateId = null, filename = null) {
    try {
      const response = await this.generateEstimatePDF(estimateId, templateId);
      const blob = response.data;
      const downloadFilename = filename || `estimate-${estimateId}.pdf`;
      this.downloadBlob(blob, downloadFilename);
      return response;
    } catch (error) {
      console.error('DocumentService.downloadEstimatePDF error:', error);
      throw error;
    }
  }

  // Template management utilities
  getTemplatePreviewUrl(templateId, format = 'html') {
    return `/api/documents/templates/${templateId}/preview/?format=${format}`;
  }

  validateTemplateContent(htmlContent) {
    // Basic validation for required template variables
    const requiredVariables = [
      '{{ document.',
      '{{ company.',
      '{{ client.'
    ];

    const warnings = [];
    
    requiredVariables.forEach(variable => {
      if (!htmlContent.includes(variable)) {
        warnings.push(`Template may be missing ${variable} variables`);
      }
    });

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  // CSS utilities for templates
  generateDefaultCSS(colors = {}) {
    const {
      primary = '#4f46e5',
      secondary = '#1f2937',
      accent = '#059669'
    } = colors;

    return `
      html, body {
        margin: 0;
        padding: 0;
        min-height: 100vh;
        height: 100%;
      }

      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: ${secondary};
        max-width: 95%;
        margin: 0 auto;
        padding: 10px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
        border-bottom: 2px solid ${primary};
        padding-bottom: 20px;
      }

      .company-info h1 {
        color: ${primary};
        margin: 0;
      }

      .document-title {
        color: ${primary};
        font-size: 28px;
        margin: 0;
      }

      .client-section {
        margin-bottom: 30px;
      }

      .client-section h3 {
        color: ${primary};
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
      }

      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }

      .items-table th,
      .items-table td {
        border: 1px solid #ddd;
        padding: 12px;
        text-align: left;
      }

      .items-table th {
        background-color: ${primary};
        color: white;
        font-weight: bold;
      }

      .items-table tr:nth-child(even) {
        background-color: #f9f9f9;
      }

      .totals-section {
        margin-top: 30px;
        display: flex;
        justify-content: flex-end;
      }

      .totals {
        width: 300px;
      }

      .total-line {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
      }

      .final-total {
        border-top: 2px solid ${primary};
        border-bottom: 2px solid ${primary};
        font-size: 18px;
        margin-top: 10px;
      }

      .notes-section {
        margin-top: 30px;
        padding: 20px;
        background-color: #f9f9f9;
        border-left: 4px solid ${accent};
      }

      .footer {
        margin-top: 40px;
        text-align: center;
        border-top: 1px solid #ddd;
        padding-top: 20px;
        color: #666;
      }

      @media print {
        body {
          margin: 0;
          padding: 10px;
        }
      }
    `;
  }
}

const documentService = new DocumentService();
export default documentService;