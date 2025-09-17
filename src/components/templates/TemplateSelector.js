import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, EyeIcon, CheckIcon } from '@heroicons/react/24/outline';
import documentService from '../../services/documentService';
import { useToast } from '../ui/Toast';

const TemplateSelector = ({
  selectedTemplate,
  onSelectTemplate,
  templateType = 'invoice',
  showPreview = true,
  className = ''
}) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const { showToast, ToastComponent } = useToast();

  // Professional templates data
  const professionalTemplates = [
    {
      id: 'blue-professional',
      name: 'Blue Professional',
      description: 'Clean professional design with blue accents',
      preview_color: '#2563eb',
      category: 'professional',
      isNew: true
    },
    {
      id: 'gray-sidebar',
      name: 'Gray Minimal with Sidebar',
      description: 'Modern sidebar layout with yellow accents',
      preview_color: '#374151',
      category: 'modern',
      isNew: true
    },
    {
      id: 'elegant-green',
      name: 'Elegant Green',
      description: 'Elegant serif design with green theme',
      preview_color: '#10b981',
      category: 'elegant',
      isNew: true
    },
    {
      id: 'dark-terminal',
      name: 'Dark Terminal',
      description: 'Terminal-style dark design with teal accents',
      preview_color: '#00d1b2',
      category: 'tech',
      isNew: true
    },
    {
      id: 'modern-card',
      name: 'Modern Card',
      description: 'Clean modern card design with blue header',
      preview_color: '#2563eb',
      category: 'modern',
      isNew: true
    },
    {
      id: 'elegant-purple',
      name: 'Elegant Purple',
      description: 'Luxury gradient design with purple theme',
      preview_color: '#8b5cf6',
      category: 'luxury',
      isNew: true
    },
    {
      id: 'minimal-orange',
      name: 'Minimal Orange',
      description: 'Clean geometric design with orange accents',
      preview_color: '#ff8c00',
      category: 'modern',
      isNew: true
    },
    {
      id: 'corporate-red',
      name: 'Corporate Red',
      description: 'Professional corporate design with red branding',
      preview_color: '#dc3545',
      category: 'professional',
      isNew: true
    },
    {
      id: 'creative-pink',
      name: 'Creative Pink',
      description: 'Creative gradient design with pink waves',
      preview_color: '#ec4899',
      category: 'creative',
      isNew: true
    },
    {
      id: 'ocean-teal',
      name: 'Ocean Teal',
      description: 'Ocean-inspired design with teal gradients',
      preview_color: '#14b8a6',
      category: 'nature',
      isNew: true
    },
    {
      id: 'classic-black',
      name: 'Classic Black',
      description: 'Bold classic design with black borders',
      preview_color: '#000000',
      category: 'classic',
      isNew: true
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, [templateType]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const result = await documentService.getTemplatesByType(templateType);
      const backendTemplates = Array.isArray(result) ? result : [];

      // Combine backend templates with professional templates
      // Mark professional templates as "needs installation" if not found in backend
      const combinedTemplates = [
        ...backendTemplates.map(bt => ({
          ...bt,
          // Add preview colors for backend templates that match professional ones
          preview_color: professionalTemplates.find(pt => pt.name === bt.name)?.preview_color || bt.primary_color
        })),
        ...professionalTemplates.filter(pt =>
          !backendTemplates.some(bt => bt.name === pt.name)
        ).map(pt => ({
          ...pt,
          needsInstallation: true
        }))
      ];

      setTemplates(combinedTemplates);

      // Set default template if none selected
      if (!selectedTemplate && combinedTemplates.length > 0) {
        const defaultTemplate = combinedTemplates.find(t => t.is_default) || combinedTemplates[0];
        onSelectTemplate(defaultTemplate);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fallback to professional templates only
      setTemplates(professionalTemplates.map(pt => ({
        ...pt,
        needsInstallation: true
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    if (template.needsInstallation) {
      // Templates will be installed via the install button
      return;
    }

    onSelectTemplate(template);
    setShowDropdown(false);
  };

  const handlePreviewTemplate = async (template, event) => {
    event.stopPropagation();

    try {
      setPreviewLoading(true);
      console.log('Previewing template:', template.name);

      // Call the preview API
      const previewData = {
        format: 'html',
        sample_data: {} // Backend will use default sample data
      };

      const response = await documentService.previewTemplate(template.id, previewData);

      if (response && response.html_content) {
        const blob = new Blob([response.html_content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPreviewTemplate(template);
      } else {
        throw new Error('Invalid preview response');
      }
    } catch (error) {
      console.error('Error previewing template:', error);
      showToast('Failed to generate preview: ' + (error.response?.data?.detail || error.message), 'error');
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewTemplate(null);
  };

  const handleInstallTemplates = async () => {
    setInstalling(true);
    try {
      const result = await documentService.installTemplateLibrary();

      if (result.success) {
        // Reload templates to get the newly installed ones
        await loadTemplates();
        showToast(`${result.template_count} professional templates installed successfully!`, 'success');
      } else {
        showToast(`Installation failed: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Template installation error:', error);
      showToast(`Failed to install templates: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setInstalling(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Template
        </label>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastComponent />
      <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Template
      </label>

      {/* Selected Template Display */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center gap-3">
          {selectedTemplate ? (
            <>
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: selectedTemplate.preview_color || selectedTemplate.primary_color || '#4f46e5' }}
              ></div>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedTemplate.name}
                  {selectedTemplate.isNew && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      New
                    </span>
                  )}
                  {selectedTemplate.needsInstallation && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Install Required
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedTemplate.description}
                </div>
              </div>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">Select a template</span>
          )}
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-200 dark:border-gray-600 max-h-80 overflow-y-auto">
          {templates.map((template) => (
            <button
              key={template.id || template.name}
              onClick={() => handleSelectTemplate(template)}
              className="w-full px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-between group border-b border-gray-100 dark:border-gray-600 last:border-b-0"
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: template.preview_color || template.primary_color || '#4f46e5' }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {template.name}
                    </div>
                    {template.is_default && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Default
                      </span>
                    )}
                    {template.isNew && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        New
                      </span>
                    )}
                    {template.needsInstallation && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Install Required
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {template.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedTemplate?.id === template.id && (
                  <CheckIcon className="w-4 h-4 text-blue-600" />
                )}
                {showPreview && !template.needsInstallation && (
                  <button
                    onClick={(e) => handlePreviewTemplate(template, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"
                    title="Preview Template"
                  >
                    <EyeIcon className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            </button>
          ))}

          {templates.length === 0 && (
            <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
              No templates available
            </div>
          )}
        </div>
      )}

      {/* Installation Notice */}
      {templates.some(t => t.needsInstallation) && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <div className="flex items-start justify-between">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-sm">!</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  New Professional Templates Available
                </p>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  Install beautiful professional templates with one click.
                </p>
              </div>
            </div>
            <button
              onClick={handleInstallTemplates}
              disabled={installing}
              className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-md transition-colors"
            >
              {installing ? 'Installing...' : 'Install Templates'}
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-6xl h-full max-h-[95vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col m-4">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Template Preview: {previewTemplate?.name}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={closePreview}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium transition-colors"
                >
                  Close Preview
                </button>
                <button
                  onClick={closePreview}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close"
                >
                  ✕
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
      )}
      </div>
    </>
  );
};

export default TemplateSelector;