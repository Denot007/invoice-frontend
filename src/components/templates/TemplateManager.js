import React, { useState, useEffect } from 'react';
import { X, Eye, Plus, Edit, Copy, Trash2, Save, Code, Palette, Sparkles, Star } from 'lucide-react';
import documentService from '../../services/documentService';
import TemplateGallery from './TemplateGallery';
import { useToast } from '../ui/Toast';

const TemplateManager = ({ isOpen, onClose, inline = false, templateType = 'invoice' }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('visual'); // 'visual' or 'code'
  const [displayMode, setDisplayMode] = useState('gallery'); // 'gallery' or 'list'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [renderedPreview, setRenderedPreview] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const [editData, setEditData] = useState({
    name: '',
    template_type: templateType,
    html_content: '',
    css_styles: '',
    is_default: false,
    is_active: true
  });

  // Visual customization state
  const [visualSettings, setVisualSettings] = useState({
    primaryColor: '#4f46e5',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    fontSize: '11',
    fontFamily: 'Arial',
    logoUrl: '',
    showLogo: false
  });

  // Sample data for template preview
  const sampleData = {
    company: {
      name: "Your Company",
      email: "contact@yourcompany.com",
      address: "123 Business St, City, ST 12345"
    },
    document: {
      invoice_number: "INV-001",
      issue_date: "January 15, 2025",
      due_date: "February 14, 2025",
      subtotal: "1000.00",
      total: "1080.00",
      tax_rate: "8",
      tax_amount: "80.00",
      notes: "Thank you for your business!",
      terms: "Net 30"
    },
    client: {
      name: "Client Company Inc.",
      email: "billing@client.com",
      address: "456 Customer Ave, Town, ST 67890",
      phone: "(555) 123-4567"
    },
    items: [
      {
        item: "Professional Web Development",
        description: "Custom website development with responsive design and modern frameworks",
        quantity: "40",
        unit_price: "75.00",
        total: "3000.00"
      },
      {
        item: "Design Consultation",
        description: "UI/UX design consultation and wireframe creation for optimal user experience",
        quantity: "10",
        unit_price: "100.00",
        total: "1000.00"
      }
    ],
    date: "January 15, 2025"
  };

  // Theme presets
  const themePresets = [
    {
      name: 'Professional Blue',
      primaryColor: '#4f46e5',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      fontSize: '11',
      fontFamily: 'Arial'
    },
    {
      name: 'Modern Green',
      primaryColor: '#059669',
      backgroundColor: '#ffffff',
      textColor: '#374151',
      fontSize: '11',
      fontFamily: 'Helvetica'
    },
    {
      name: 'Elegant Purple',
      primaryColor: '#7c3aed',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontSize: '11',
      fontFamily: 'Georgia'
    },
    {
      name: 'Classic Black',
      primaryColor: '#1f2937',
      backgroundColor: '#ffffff',
      textColor: '#374151',
      fontSize: '11',
      fontFamily: 'Times New Roman'
    }
  ];

  useEffect(() => {
    if (isOpen || inline) {
      loadTemplates();
    }
  }, [isOpen, inline, templateType]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      console.log(`🔄 Starting to load ${templateType} templates...`);
      const data = await documentService.getTemplatesByType(templateType);
      console.log(`✅ ${templateType} templates loaded successfully:`, data);
      console.log('Templates array length:', data?.results?.length || data?.length || 'no length property');
      setTemplates(data?.results || data || []);
      setError('');
    } catch (err) {
      setError(`Failed to load ${templateType} templates: ` + err.message);
      console.error(`❌ Error loading ${templateType} templates:`, err);
      console.error('Error details:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate a static preview with sample data
  const generatePreviewWithSampleData = () => {
    return `
      <div class="header">
        <div class="company-info">
          <h1>${sampleData.company.name}</h1>
          <p>${sampleData.company.email}</p>
        </div>
        <div class="document-info">
          <h2 class="document-title">INVOICE</h2>
          <p><strong>Invoice #:</strong> ${sampleData.document.invoice_number}</p>
          <p><strong>Date:</strong> ${sampleData.document.issue_date}</p>
          <p><strong>Due:</strong> ${sampleData.document.due_date}</p>
        </div>
      </div>

      <div class="client-section">
        <h3>Bill To:</h3>
        <div class="client-info">
          <strong>${sampleData.client.name}</strong><br>
          ${sampleData.client.email}<br>
          ${sampleData.client.address}<br>
          ${sampleData.client.phone}
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${sampleData.items.map(item => `
            <tr>
              <td>
                <div class="item-name">${item.item}</div>
                <div class="item-description">${item.description}</div>
              </td>
              <td>${item.quantity}</td>
              <td>$${item.unit_price}</td>
              <td>$${item.total}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="totals">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>$${sampleData.document.subtotal}</span>
          </div>
          <div class="total-line">
            <span>Tax (${sampleData.document.tax_rate}%):</span>
            <span>$${sampleData.document.tax_amount}</span>
          </div>
          <div class="total-line final-total">
            <span><strong>Total:</strong></span>
            <span><strong>$${sampleData.document.total}</strong></span>
          </div>
        </div>
      </div>

      <div class="notes-section">
        <h4>Notes:</h4>
        <p>${sampleData.document.notes}</p>
      </div>

      <div class="footer">
        <p>Payment Terms: ${sampleData.document.terms}</p>
        <p>Thank you for your business!</p>
      </div>
    `;
  };

  // Apply visual settings to CSS
  const applyVisualSettings = (settings) => {
    const updatedCss = defaultCssStyles
      .replace(/#4f46e5/g, settings.primaryColor)
      .replace(/Arial/g, settings.fontFamily)
      .replace(/font-size: \d+px;/g, `font-size: ${settings.fontSize}px;`)
      .replace(/#333/g, settings.textColor)
      .replace(/#ffffff/g, settings.backgroundColor);
    
    setEditData(prev => ({
      ...prev,
      css_styles: updatedCss
    }));
  };

  // Process template variables with sample data
  const processTemplateContent = (htmlContent) => {
    if (!htmlContent) return generatePreviewWithSampleData();
    
    let processed = htmlContent;
    
    // Process Django-style template variables with filters and defaults
    const replacements = {
      // Company variables with Django filters
      '{{ company.name|default:"Your Company" }}': sampleData.company.name || 'Your Company',
      '{{ company.name }}': sampleData.company.name,
      '{{ company.email }}': sampleData.company.email,
      '{{ company.phone }}': sampleData.company.phone,
      '{{ company.address }}': sampleData.company.address,
      
      // Document variables  
      '{{ document.invoice_number }}': sampleData.document.invoice_number,
      '{{ document.issue_date }}': sampleData.document.issue_date,
      '{{ document.due_date }}': sampleData.document.due_date,
      '{{ document.total }}': sampleData.document.total,
      '{{ document.subtotal }}': sampleData.document.subtotal,
      '{{ document.tax }}': sampleData.document.tax,
      
      // Client variables
      '{{ client.name }}': sampleData.client.name,
      '{{ client.email }}': sampleData.client.email,
      '{{ client.address }}': sampleData.client.address,
      '{{ client.phone }}': sampleData.client.phone
    };

    // Replace all template variables (handle filters and defaults)
    Object.entries(replacements).forEach(([placeholder, value]) => {
      // Create a regex that matches the placeholder exactly
      const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      processed = processed.replace(new RegExp(escapedPlaceholder, 'g'), value || '');
    });

    // Handle more complex Django filters with regex
    processed = processed.replace(/\{\{\s*([^}|]+)\|default:"([^"]+)"\s*\}\}/g, (match, variable, defaultValue) => {
      // Extract the variable path (e.g., "company.name")
      const path = variable.trim();
      const keys = path.split('.');
      let value = sampleData;
      
      // Navigate through the object path
      for (const key of keys) {
        value = value && value[key];
      }
      
      return value || defaultValue;
    });

    // Process items table if present
    if (processed.includes('{% for item in items %}') || processed.includes('{{ items }}')) {
      let itemsHtml = '';
      sampleData.items.forEach(item => {
        itemsHtml += `
          <tr>
            <td>
              <div class="item-name">${item.item}</div>
              <div class="item-description">${item.description}</div>
            </td>
            <td>${item.quantity}</td>
            <td>$${item.rate}</td>
            <td>$${item.amount}</td>
          </tr>
        `;
      });
      
      // Replace template loops with generated items
      processed = processed.replace(/{% for item in items %}.*?{% endfor %}/gs, itemsHtml);
      processed = processed.replace(/\{\{\s*items\s*\}\}/g, itemsHtml);
    }

    return processed;
  };

  // Update rendered preview when template changes
  useEffect(() => {
    const rendered = processTemplateContent(editData.html_content);
    setRenderedPreview(rendered);
  }, [editData.css_styles, editData.html_content]); // Update when CSS or HTML changes

  const applyThemePreset = (preset) => {
    const newSettings = {
      ...visualSettings,
      ...preset
    };
    setVisualSettings(newSettings);
    applyVisualSettings(newSettings);
  };

  const handleEditTemplate = async (template) => {
    console.log('🔧 Editing template:', template);
    console.log('Template html_content:', template.html_content);
    console.log('Template css_styles:', template.css_styles);
    
    setSelectedTemplate(template);
    
    // If template doesn't have full content, fetch it
    let fullTemplate = template;
    if (!template.html_content || !template.css_styles) {
      console.log('🔍 Template missing content, fetching full template...');
      try {
        fullTemplate = await documentService.getTemplate(template.id);
        console.log('✅ Full template loaded:', fullTemplate);
      } catch (err) {
        console.error('❌ Failed to load full template:', err);
        setError('Failed to load template details');
        return;
      }
    }
    
    const editDataToSet = {
      name: fullTemplate.name || 'Untitled Template',
      template_type: templateType, // Always use current context's template type
      html_content: fullTemplate.html_content || defaultHtmlTemplate,
      css_styles: fullTemplate.css_styles || defaultCssStyles,
      is_default: fullTemplate.is_default || false,
      is_active: fullTemplate.is_active !== undefined ? fullTemplate.is_active : true
    };
    
    console.log('🔧 Setting editData:', editDataToSet);
    setEditData(editDataToSet);
    setIsEditing(true);
    setShowCreateModal(true);
    setViewMode('visual');
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setEditData({
      name: 'New Template',
      template_type: templateType,
      html_content: defaultHtmlTemplate,
      css_styles: defaultCssStyles,
      is_default: false,
      is_active: true
    });
    setIsEditing(true);
    setShowCreateModal(true);
    setViewMode('visual');
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate required fields
      if (!editData.name || !editData.name.trim()) {
        setError('Template name is required');
        return;
      }
      
      if (!editData.html_content || !editData.html_content.trim()) {
        setError('Template HTML content is required');
        return;
      }
      
      // Force template type to match current context
      const templateDataToSave = {
        ...editData,
        template_type: templateType
      };

      console.log('Saving template data:', templateDataToSave);

      let result;
      if (selectedTemplate) {
        console.log('Updating existing template:', selectedTemplate.id);
        result = await documentService.updateTemplate(selectedTemplate.id, templateDataToSave);
      } else {
        console.log('Creating new template');
        result = await documentService.createTemplate(templateDataToSave);
      }
      
      console.log('Save result:', result);
      
      // Reload templates and close modal
      await loadTemplates();
      setIsEditing(false);
      setShowCreateModal(false);
      setShowCodeEditor(false);
      setSelectedTemplate(null);
      
      // Show success message briefly
      console.log('Template saved successfully');
      
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to save template';
      setError(`Failed to save template: ${errorMessage}`);
      console.error('Error saving template:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTemplate = async (template) => {
    try {
      setLoading(true);
      // Send correct data format to backend
      const previewData = {
        format: 'html',
        sample_data: {} // Backend will use default sample data if empty
      };
      const response = await documentService.previewTemplate(template.id, previewData);
      
      // For HTML preview, response should contain html_content
      if (response && response.html_content) {
        const blob = new Blob([response.html_content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } else {
        throw new Error('Invalid response format from preview API');
      }
      setError('');
    } catch (err) {
      setError('Failed to generate preview: ' + (err.response?.data?.detail || err.message));
      console.error('Error generating preview:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTemplate = async (template) => {
    try {
      setLoading(true);
      await documentService.duplicateTemplate(template.id, {
        name: `Copy of ${template.name}`
      });
      await loadTemplates();
      setError('');
    } catch (err) {
      setError('Failed to duplicate template');
      console.error('Error duplicating template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = (template) => {
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      setLoading(true);
      await documentService.deleteTemplate(templateToDelete.id);
      await loadTemplates();
      setError('');
      setShowDeleteModal(false);
      // Show success toast
      showToast(`Template "${templateToDelete.name}" has been deleted successfully!`, 'success');
      setTemplateToDelete(null);
    } catch (err) {
      const errorMessage = 'Failed to delete template: ' + (err.response?.data?.message || err.message);
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error deleting template:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteTemplate = () => {
    setShowDeleteModal(false);
    setTemplateToDelete(null);
  };

  const handleUseTemplate = (template) => {
    // This will close the modal and return the selected template to the parent component
    if (onClose) {
      onClose(template);
    }
    // You can also emit an event or call a callback here if needed
    console.log('Using template:', template);
  };

  const handleSetAsDefault = async (template) => {
    try {
      setLoading(true);
      // Use the specific API endpoint for setting template as default
      await documentService.setTemplateAsDefault(template.id);
      // Reload templates to reflect the change
      await loadTemplates();
      setError('');
      // Show success toast
      showToast(`"${template.name}" has been set as the default template!`, 'success');
    } catch (err) {
      const errorMessage = 'Failed to set template as default: ' + (err.response?.data?.message || err.message);
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error setting default template:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !inline) return null;

  // Create/Edit Template Modal
  const TemplateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full max-w-7xl h-full max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col m-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {selectedTemplate ? 'Edit Template' : 'Create New Template'}
          </h2>
          <button
            onClick={() => {
              setShowCreateModal(false);
              setIsEditing(false);
              setSelectedTemplate(null);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Template Customization Controls */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              {/* Template Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter template name"
                  />
                </div>


                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={editData.is_default}
                    onChange={(e) => setEditData({ ...editData, is_default: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Set as default template
                  </label>
                </div>
              </div>

              {/* Template Customization Controls */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">Customize Your Template</h3>
                  
                  {/* Theme Presets */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Choose a Theme</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {themePresets.map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => applyThemePreset(preset)}
                          className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div 
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: preset.primaryColor }}
                            ></div>
                            <span className="text-xs font-medium">{preset.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{preset.fontFamily}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Settings */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Colors</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Brand Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={visualSettings.primaryColor}
                            onChange={(e) => {
                              const newSettings = { ...visualSettings, primaryColor: e.target.value };
                              setVisualSettings(newSettings);
                              applyVisualSettings(newSettings);
                            }}
                            className="w-6 h-6 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={visualSettings.primaryColor}
                            onChange={(e) => {
                              const newSettings = { ...visualSettings, primaryColor: e.target.value };
                              setVisualSettings(newSettings);
                              applyVisualSettings(newSettings);
                            }}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Text Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={visualSettings.textColor}
                            onChange={(e) => {
                              const newSettings = { ...visualSettings, textColor: e.target.value };
                              setVisualSettings(newSettings);
                              applyVisualSettings(newSettings);
                            }}
                            className="w-6 h-6 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={visualSettings.textColor}
                            onChange={(e) => {
                              const newSettings = { ...visualSettings, textColor: e.target.value };
                              setVisualSettings(newSettings);
                              applyVisualSettings(newSettings);
                            }}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Typography</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Font Family</label>
                        <select
                          value={visualSettings.fontFamily}
                          onChange={(e) => {
                            const newSettings = { ...visualSettings, fontFamily: e.target.value };
                            setVisualSettings(newSettings);
                            applyVisualSettings(newSettings);
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Calibri">Calibri</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Font Size</label>
                        <input
                          type="range"
                          min="9"
                          max="16"
                          value={visualSettings.fontSize}
                          onChange={(e) => {
                            const newSettings = { ...visualSettings, fontSize: e.target.value };
                            setVisualSettings(newSettings);
                            applyVisualSettings(newSettings);
                          }}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{visualSettings.fontSize}px</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Editor/Preview Area */}
          <div className="flex-1 flex flex-col">
            {/* Header with view toggle and save button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('visual')}
                    className={`px-3 py-1 text-sm flex items-center gap-2 ${
                      viewMode === 'visual' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    Visual
                  </button>
                  <button
                    onClick={() => setViewMode('code')}
                    className={`px-3 py-1 text-sm flex items-center gap-2 ${
                      viewMode === 'code' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    Code
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Template'}
              </button>
            </div>

            {/* Visual Editor */}
            {viewMode === 'visual' ? (
              <div className="flex-1 bg-white dark:bg-gray-900 p-4">
                <div className="h-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="h-8 bg-gray-100 dark:bg-gray-700 flex items-center px-3 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Live Preview</span>
                  </div>
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <style>${editData.css_styles}</style>
                      </head>
                      <body>
                        ${renderedPreview}
                      </body>
                      </html>
                    `}
                    className="w-full h-full border-none"
                    style={{ height: 'calc(100% - 32px)' }}
                  />
                </div>
              </div>
            ) : (
              /* Code Editor */
              <div className="flex-1 flex">
                <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 text-sm font-medium">
                    HTML Template
                  </div>
                  <textarea
                    value={editData.html_content}
                    onChange={(e) => setEditData({ ...editData, html_content: e.target.value })}
                    className="flex-1 p-4 font-mono text-sm border-none outline-none resize-none bg-white dark:bg-gray-800"
                    placeholder="Enter HTML template content..."
                  />
                </div>
                <div className="w-1/2 flex flex-col">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 text-sm font-medium">
                    CSS Styles
                  </div>
                  <textarea
                    value={editData.css_styles}
                    onChange={(e) => setEditData({ ...editData, css_styles: e.target.value })}
                    className="flex-1 p-4 font-mono text-sm border-none outline-none resize-none bg-white dark:bg-gray-800"
                    placeholder="Enter CSS styles..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Card-based layout for inline mode
  const CardLayout = () => (
    <div className="p-6">
      {/* Header with Create Template button and View Toggle */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Templates
          </h3>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setDisplayMode('gallery')}
              className={`px-3 py-1 text-sm flex items-center gap-2 ${
                displayMode === 'gallery' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Gallery
            </button>
            <button
              onClick={() => setDisplayMode('list')}
              className={`px-3 py-1 text-sm flex items-center gap-2 ${
                displayMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Edit className="w-4 h-4" />
              Manage
            </button>
          </div>
        </div>

        <button
          onClick={handleCreateTemplate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </button>
      </div>

      {/* Gallery View */}
      {displayMode === 'gallery' && (
        <TemplateGallery
          onSelectTemplate={(template) => {
            console.log('Selected template from gallery:', template);
            handleEditTemplate(template);
          }}
          showCreateOption={false}
        />
      )}

      {/* List View - Original Template Manager */}
      {displayMode === 'list' && (
        <div>
          {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading templates...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <div className="text-red-700 dark:text-red-400">{error}</div>
        </div>
      )}

      {/* Templates Grid - Card Layout */}
      {!loading && templates && templates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Template Preview Thumbnail */}
              <div className="h-48 bg-white dark:bg-gray-900 relative overflow-hidden group border-b border-gray-200 dark:border-gray-700">
                {/* Mini Template Preview */}
                <div className="absolute inset-2 bg-white rounded-lg shadow-inner overflow-hidden">
                  <div className="transform scale-[0.3] origin-top-left w-[333%] h-[333%]">
                    <div className="p-6 bg-white" style={{
                      backgroundColor: template.name?.includes('Dark') ? '#111' :
                                     template.name?.includes('Gray') ? '#f9fafb' :
                                     template.name?.includes('Ocean') ? '#f0fdfa' :
                                     template.name?.includes('Pink') ? '#fdf2f8' :
                                     template.name?.includes('Purple') ? '#f5f3ff' :
                                     template.name?.includes('Green') ? '#f0fdf4' :
                                     template.name?.includes('Black') ? '#fff' : '#fff'
                    }}>
                      {/* Dynamic Header based on template */}
                      <div className="mb-4">
                        <div className="h-3 w-28 rounded mb-2" style={{
                          backgroundColor: template.primary_color || '#2563eb'
                        }}></div>
                        <div className="h-2 w-20 bg-gray-300 rounded opacity-50"></div>
                      </div>

                      {/* Invoice Details */}
                      <div className="flex justify-between mb-4">
                        <div>
                          <div className="h-2 w-16 bg-gray-400 rounded mb-1 opacity-60"></div>
                          <div className="h-2 w-12 bg-gray-300 rounded opacity-40"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-2 w-20 bg-gray-400 rounded mb-1 opacity-60"></div>
                          <div className="h-2 w-16 bg-gray-300 rounded opacity-40"></div>
                        </div>
                      </div>

                      {/* Mini Table with Dynamic Colors */}
                      <div className="border rounded overflow-hidden" style={{
                        borderColor: template.primary_color ? `${template.primary_color}30` : '#e5e7eb'
                      }}>
                        <div className="p-1.5" style={{
                          backgroundColor: template.primary_color ? `${template.primary_color}10` : '#f3f4f6'
                        }}>
                          <div className="h-2 w-full rounded" style={{
                            backgroundColor: template.primary_color ? `${template.primary_color}60` : '#9ca3af'
                          }}></div>
                        </div>
                        <div className="p-1.5 space-y-1.5 bg-white bg-opacity-50">
                          <div className="flex justify-between">
                            <div className="h-1.5 w-20 bg-gray-300 rounded opacity-50"></div>
                            <div className="h-1.5 w-12 bg-gray-300 rounded opacity-50"></div>
                          </div>
                          <div className="flex justify-between">
                            <div className="h-1.5 w-24 bg-gray-300 rounded opacity-50"></div>
                            <div className="h-1.5 w-12 bg-gray-300 rounded opacity-50"></div>
                          </div>
                          <div className="flex justify-between">
                            <div className="h-1.5 w-16 bg-gray-300 rounded opacity-50"></div>
                            <div className="h-1.5 w-12 bg-gray-300 rounded opacity-50"></div>
                          </div>
                        </div>
                      </div>

                      {/* Total Section */}
                      <div className="mt-3 flex justify-end">
                        <div className="text-right">
                          <div className="h-1.5 w-16 bg-gray-300 rounded mb-1 opacity-40"></div>
                          <div className="h-2.5 w-20 rounded" style={{
                            backgroundColor: template.primary_color || '#2563eb'
                          }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template Type Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 backdrop-blur-sm">
                    {template.template_type}
                  </span>
                </div>

                {/* Hover Preview Button */}
                <button
                  onClick={() => handlePreviewTemplate(template)}
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 flex items-center gap-2 transform scale-95 group-hover:scale-100 transition-transform shadow-lg">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Preview Full Template</span>
                  </div>
                </button>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                      {template.name}
                    </h4>
                    {template.is_default && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Default
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span>Updated {new Date(template.updated_at).toLocaleDateString()}</span>
                </div>
              
              {/* Action Buttons Grid */}
              <div className="space-y-2">
                {/* Primary Action - Use Template */}
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Use Template
                </button>

                {/* Secondary Actions Row */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handlePreviewTemplate(template)}
                    className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </button>
                </div>

                {/* Tertiary Actions Row */}
                <div className="grid grid-cols-2 gap-2">
                  {!template.is_default ? (
                    <button
                      onClick={() => handleSetAsDefault(template)}
                      className="text-green-700 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      Set Default
                    </button>
                  ) : (
                    <div className="text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 text-sm font-medium px-3 py-2 rounded-lg flex items-center justify-center gap-1 opacity-50 cursor-not-allowed">
                      <Star className="w-3 h-3 fill-current" />
                      Default
                    </div>
                  )}
                  {!template.is_default ? (
                    <button
                      onClick={() => handleDeleteTemplate(template)}
                      className="text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCopyTemplate(template)}
                      className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Duplicate
                    </button>
                  )}
                </div>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && (!templates || templates.length === 0) && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No templates yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Create your first template to customize how your invoices and documents look.
          </p>
          <button
            onClick={handleCreateTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Create Your First Template
          </button>
        </div>
      )}
        </div>
      )}
    </div>
  );

  // Preview Modal for individual template previews
  const PreviewModal = () => previewUrl && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full max-w-6xl h-full max-h-[95vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col m-4">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Template Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewUrl(null)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium transition-colors"
            >
              Close Preview
            </button>
            <button
              onClick={() => setPreviewUrl(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={previewUrl}
            className="w-full h-full border-none"
            title="Template Preview"
          />
        </div>
      </div>
    </div>
  );

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => showDeleteModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full m-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
            Delete Template
          </h3>

          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Are you sure you want to delete the template <span className="font-semibold text-gray-900 dark:text-gray-100">"{templateToDelete?.name}"</span>?
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-500 text-center mb-6">
            This action cannot be undone. All documents using this template will need to select a new template.
          </p>

          <div className="flex gap-3">
            <button
              onClick={cancelDeleteTemplate}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteTemplate}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Return the appropriate structure based on inline prop
  if (inline) {
    return (
      <div className="w-full h-full bg-white dark:bg-gray-800">
        <CardLayout />
        {showCreateModal && <TemplateModal />}
        <PreviewModal />
        <DeleteConfirmationModal />
        <ToastComponent />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full max-w-7xl h-full max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col m-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Template Manager
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <CardLayout />
      </div>
      {showCreateModal && <TemplateModal />}
      <PreviewModal />
      <DeleteConfirmationModal />
      <ToastComponent />
    </div>
  );
};

const defaultHtmlTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ document.invoice_number }}</title>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <h1>{{ company.name|default:"Your Company" }}</h1>
            <p>{{ company.email }}</p>
        </div>
        <div class="document-info">
            <h2 class="document-title">INVOICE</h2>
            <p><strong>Invoice #:</strong> {{ document.invoice_number }}</p>
            <p><strong>Date:</strong> {{ document.issue_date|date:"M d, Y" }}</p>
            <p><strong>Due:</strong> {{ document.due_date|date:"M d, Y" }}</p>
        </div>
    </div>

    <div class="client-section">
        <h3>Bill To:</h3>
        <div class="client-info">
            <strong>{{ client.name }}</strong><br>
            {{ client.email }}<br>
            {% if client.address %}{{ client.address }}<br>{% endif %}
            {% if client.phone %}{{ client.phone }}{% endif %}
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            {% for item in items %}
            <tr>
                <td>
                    <div class="item-name">{{ item.item }}</div>
                    <div class="item-description">{{ item.description }}</div>
                </td>
                <td>{{ item.quantity }}</td>
                <td>\${{ item.unit_price|floatformat:2 }}</td>
                <td>\${{ item.total|floatformat:2 }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>

    <div class="totals-section">
        <div class="totals">
            <div class="total-line">
                <span>Subtotal:</span>
                <span>\${{ document.subtotal|floatformat:2 }}</span>
            </div>
            {% if document.tax_rate > 0 %}
            <div class="total-line">
                <span>Tax ({{ document.tax_rate }}%):</span>
                <span>\${{ document.tax_amount|floatformat:2 }}</span>
            </div>
            {% endif %}
            <div class="total-line final-total">
                <span><strong>Total:</strong></span>
                <span><strong>\${{ document.total|floatformat:2 }}</strong></span>
            </div>
        </div>
    </div>

    {% if document.notes %}
    <div class="notes-section">
        <h4>Notes:</h4>
        <p>{{ document.notes }}</p>
    </div>
    {% endif %}

    <div class="footer">
        <p>Payment Terms: {{ document.terms|default:"Net 30" }}</p>
        <p>Thank you for your business!</p>
    </div>
</body>
</html>`;

const defaultCssStyles = `body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 95%;
    margin: 0 auto;
    padding: 10px;
}

.header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
    border-bottom: 2px solid #4f46e5;
    padding-bottom: 20px;
}

.company-info h1 {
    color: #4f46e5;
    margin: 0;
    font-size: 28px;
}

.document-title {
    color: #4f46e5;
    font-size: 28px;
    margin: 0;
}

.client-section {
    margin-bottom: 30px;
}

.client-section h3 {
    color: #4f46e5;
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
    background-color: #4f46e5;
    color: white;
    font-weight: bold;
}

.items-table tr:nth-child(even) {
    background-color: #f9f9f9;
}

.item-name {
    font-weight: bold;
    margin-bottom: 4px;
}

.item-description {
    font-size: 0.9em;
    color: #666;
    font-weight: normal;
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
    border-top: 2px solid #4f46e5;
    border-bottom: 2px solid #4f46e5;
    font-size: 18px;
    margin-top: 10px;
}

.notes-section {
    margin-top: 30px;
    padding: 20px;
    background-color: #f9f9f9;
    border-left: 4px solid #059669;
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
        padding: 20px;
    }
}`;

export default TemplateManager;