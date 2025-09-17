import React, { useState, useEffect } from 'react';
import { Eye, Plus, Star, Palette } from 'lucide-react';
import documentService from '../../services/documentService';
import { useToast } from '../ui/Toast';

const TemplateGallery = ({ onSelectTemplate, showCreateOption = true }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [cardPreviews, setCardPreviews] = useState({});
  const [previewsLoading, setPreviewsLoading] = useState({});
  const { showToast, ToastComponent } = useToast();

  // Featured professional templates with preview data
  const featuredTemplates = [
    {
      id: 'blue-professional',
      name: 'Blue Professional',
      description: 'Clean professional design with blue accents and centered header',
      category: 'professional',
      preview: '/api/placeholder/300/400',
      colors: {
        primary: '#2563eb',
        secondary: '#333333',
        accent: '#1d4ed8'
      },
      features: ['Centered header', 'Clean typography', 'Professional layout'],
      isPopular: true
    },
    {
      id: 'gray-sidebar',
      name: 'Gray Minimal with Sidebar',
      description: 'Modern sidebar layout with company info and yellow accents',
      category: 'modern',
      preview: '/api/placeholder/300/400',
      colors: {
        primary: '#374151',
        secondary: '#111827',
        accent: '#facc15'
      },
      features: ['Sidebar layout', 'Landscape orientation', 'Company info panel'],
      isPopular: true
    },
    {
      id: 'elegant-green',
      name: 'Elegant Green',
      description: 'Elegant serif design with green color scheme and light background',
      category: 'elegant',
      preview: '/api/placeholder/300/400',
      colors: {
        primary: '#10b981',
        secondary: '#064e3b',
        accent: '#065f46'
      },
      features: ['Serif typography', 'Green theme', 'Elegant styling'],
      isPopular: true
    },
    {
      id: 'dark-terminal',
      name: 'Dark Terminal',
      description: 'Terminal-style dark design with monospace font and teal accents',
      category: 'tech',
      preview: '/api/placeholder/300/400',
      colors: {
        primary: '#00d1b2',
        secondary: '#111111',
        accent: '#444444'
      },
      features: ['Monospace font', 'Dark theme', 'Terminal style'],
      isPopular: true
    },
    {
      id: 'modern-card',
      name: 'Modern Card',
      description: 'Clean modern card design with blue header and shadow effects',
      category: 'modern',
      preview: '/api/placeholder/300/400',
      colors: {
        primary: '#2563eb',
        secondary: '#333333',
        accent: '#f4f6f8'
      },
      features: ['Card layout', 'Modern design', 'Shadow effects'],
      isPopular: true
    },
    {
      id: 'elegant-purple',
      name: 'Elegant Purple',
      description: 'Luxury gradient design with purple theme and sophisticated typography',
      category: 'luxury',
      preview: '/api/placeholder/300/400',
      colors: {
        primary: '#8b5cf6',
        secondary: '#6d28d9',
        accent: '#c4b5fd'
      },
      features: ['Gradient header', 'Luxury design', 'Purple theme'],
      isNew: true
    },
    {
      id: 'minimal-orange',
      name: 'Minimal Orange',
      description: 'Clean geometric design with orange accents and modern card layout',
      category: 'modern',
      preview: '/api/placeholder/300/400',
      colors: {
        primary: '#ff8c00',
        secondary: '#ff6b35',
        accent: '#f7fafc'
      },
      features: ['Geometric design', 'Orange accents', 'Minimal layout'],
      isNew: true
    },
    {
      id: 'corporate-red',
      name: 'Corporate Red',
      description: 'Professional corporate design with red branding and clean lines',
      category: 'professional',
      preview: '/api/placeholder/300/400',
      colors: {
        primary: '#dc3545',
        secondary: '#c82333',
        accent: '#f8f9fa'
      },
      features: ['Corporate design', 'Red branding', 'Professional layout'],
      isNew: true
    },
    {
      id: 'creative-pink',
      name: 'Creative Pink',
      description: 'Creative gradient design with pink waves and modern typography',
      category: 'creative',
      preview: '/api/placeholder/300/400',
      colors: {
        primary: '#ec4899',
        secondary: '#f472b6',
        accent: '#fdf2f8'
      },
      features: ['Wave decoration', 'Pink gradients', 'Creative design'],
      isNew: true
    },
    {
      id: 'ocean-teal',
      name: 'Ocean Teal',
      description: 'Ocean-inspired design with teal gradients and professional layout',
      category: 'nature',
      preview: '/api/placeholder/300/400',
      colors: {
        primary: '#14b8a6',
        secondary: '#0d9488',
        accent: '#f0fdfa'
      },
      features: ['Ocean theme', 'Teal gradients', 'Wave patterns'],
      isNew: true
    },
    {
      id: 'classic-black',
      name: 'Classic Black',
      description: 'Bold classic design with black borders and dramatic typography',
      category: 'classic',
      preview: '/api/placeholder/300/400',
      colors: {
        primary: '#000000',
        secondary: '#2c2c2c',
        accent: '#ffffff'
      },
      features: ['Black borders', 'Bold typography', 'Classic design'],
      isNew: true
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', count: featuredTemplates.length },
    { id: 'professional', name: 'Professional', count: 2 },
    { id: 'modern', name: 'Modern', count: 3 },
    { id: 'elegant', name: 'Elegant', count: 1 },
    { id: 'tech', name: 'Tech', count: 1 },
    { id: 'luxury', name: 'Luxury', count: 1 },
    { id: 'creative', name: 'Creative', count: 1 },
    { id: 'nature', name: 'Nature', count: 1 },
    { id: 'classic', name: 'Classic', count: 1 }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    // Load card previews after templates are loaded
    if (templates.length > 0) {
      loadCardPreviews();
    }
  }, [templates]);

  useEffect(() => {
    // Cleanup blob URLs when component unmounts
    return () => {
      Object.values(cardPreviews).forEach(url => {
        if (url && typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [cardPreviews]);

  const loadTemplates = async () => {
    try {
      const data = await documentService.getTemplates();
      const templateList = data?.results || data || [];
      console.log('Loaded templates:', templateList.map(t => t.name));
      setTemplates(templateList);
      return templateList;
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadCardPreviews = async () => {
    // Load previews for featured templates that exist in backend
    const availableTemplates = featuredTemplates.filter(ft =>
      templates.some(t => t.name === ft.name)
    );

    for (const template of availableTemplates) {
      const backendTemplate = templates.find(t => t.name === template.name);
      if (backendTemplate && !cardPreviews[template.id]) {
        setPreviewsLoading(prev => ({ ...prev, [template.id]: true }));

        try {
          const previewData = {
            format: 'html',
            sample_data: {}
          };

          const response = await documentService.previewTemplate(backendTemplate.id, previewData);

          if (response && response.html_content) {
            const blob = new Blob([response.html_content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            setCardPreviews(prev => ({ ...prev, [template.id]: url }));
          }
        } catch (error) {
          console.error('Error loading card preview for', template.name, ':', error);
          // Don't show error toast for preview loading failures to avoid spam
        } finally {
          setPreviewsLoading(prev => ({ ...prev, [template.id]: false }));
        }
      }
    }
  };

  const filteredTemplates = selectedCategory === 'all'
    ? featuredTemplates
    : featuredTemplates.filter(t => t.category === selectedCategory);

  const handleUseTemplate = async (template) => {
    try {
      // Ensure templates are loaded before checking
      if (templates.length === 0) {
        console.log('Templates not loaded yet, loading...');
        await loadTemplates();
      }

      // Check if template exists in backend
      const existingTemplate = templates.find(t => t.name === template.name);

      if (!existingTemplate) {
        // Template doesn't exist, user needs to install templates
        console.log('Template not found in backend:', template.name);
        console.log('Available templates:', templates.map(t => t.name));
        console.log('Total templates loaded:', templates.length);
        showToast('This template needs to be installed. Please use the "Install Templates" button below.', 'warning');
        return;
      }

      // Set template as default for invoice type
      const result = await documentService.setTemplateAsDefault(existingTemplate.id);

      if (result.success) {
        showToast(`${existingTemplate.name} is now your default invoice template!`, 'success');
        // Reload templates to reflect the default status change
        await loadTemplates();
      } else {
        showToast(`Failed to set template as default: ${result.message}`, 'error');
      }

      // Also call the onSelectTemplate callback if provided
      if (onSelectTemplate) {
        onSelectTemplate(existingTemplate);
      }
    } catch (error) {
      console.error('Error setting template as default:', error);
      showToast(`Error: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handlePreviewTemplate = async (template) => {
    try {
      setPreviewLoading(true);

      // Ensure templates are loaded before checking
      if (templates.length === 0) {
        await loadTemplates();
      }

      // Find the backend template
      const backendTemplate = templates.find(t => t.name === template.name);

      if (!backendTemplate) {
        showToast('This template needs to be installed first.', 'warning');
        return;
      }

      console.log('Previewing template:', backendTemplate);

      // Call the preview API
      const previewData = {
        format: 'html',
        sample_data: {} // Backend will use default sample data
      };

      const response = await documentService.previewTemplate(backendTemplate.id, previewData);

      if (response && response.html_content) {
        const blob = new Blob([response.html_content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPreviewTemplate(backendTemplate);
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
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading templates...</span>
      </div>
    );
  }

  return (
    <>
      <ToastComponent />
      <div className="bg-white dark:bg-gray-800 rounded-lg">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Template Gallery
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Choose from our collection of professional invoice templates
            </p>
          </div>
          {showCreateOption && (
            <button
              onClick={() => console.log('Create custom template')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Custom
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mt-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category.name}
              <span className="ml-1 text-xs opacity-75">({category.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group relative bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col"
            >
              {/* Popular Badge */}
              {template.isPopular && (
                <div className="absolute top-3 left-3 z-10">
                  <div className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Popular
                  </div>
                </div>
              )}

              {/* Default Badge */}
              {(() => {
                const backendTemplate = templates.find(t => t.name === template.name);
                return backendTemplate?.is_default && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Default
                    </div>
                  </div>
                );
              })()}

              {/* Template Preview */}
              <div className="relative h-48 bg-gray-100 dark:bg-gray-600 rounded-t-lg overflow-hidden flex-shrink-0">
                {cardPreviews[template.id] ? (
                  <div className="w-full h-full relative">
                    <iframe
                      src={cardPreviews[template.id]}
                      className="w-full h-full border-none transform scale-[0.35] origin-top-left pointer-events-none"
                      style={{
                        width: '285%',
                        height: '285%',
                        transformOrigin: 'top left'
                      }}
                      title={`Preview of ${template.name}`}
                    />
                    {/* Overlay to prevent iframe interaction */}
                    <div className="absolute inset-0 bg-transparent pointer-events-none"></div>
                  </div>
                ) : previewsLoading[template.id] ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Loading...</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {/* Fallback preview design */}
                    <div className="w-full h-full p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700">
                      <div
                        className="w-full h-6 rounded mb-3"
                        style={{ backgroundColor: template.colors.primary }}
                      ></div>
                      <div className="space-y-1">
                        <div className="h-1.5 bg-gray-300 dark:bg-gray-500 rounded w-3/4"></div>
                        <div className="h-1.5 bg-gray-300 dark:bg-gray-500 rounded w-1/2"></div>
                        <div className="h-1.5 bg-gray-300 dark:bg-gray-500 rounded w-2/3"></div>
                      </div>
                      <div className="mt-4 space-y-0.5">
                        <div className="h-1 bg-gray-200 dark:bg-gray-400 rounded w-full"></div>
                        <div className="h-1 bg-gray-200 dark:bg-gray-400 rounded w-full"></div>
                        <div className="h-1 bg-gray-200 dark:bg-gray-400 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePreviewTemplate(template)}
                    disabled={previewLoading}
                    className="bg-white text-gray-900 px-3 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <Eye className="w-4 h-4" />
                    {previewLoading ? 'Loading...' : 'Preview'}
                  </button>
                  {(() => {
                    const backendTemplate = templates.find(t => t.name === template.name);
                    const isDefault = backendTemplate?.is_default;

                    return (
                      <button
                        onClick={() => handleUseTemplate(template)}
                        disabled={isDefault}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                          isDefault
                            ? 'bg-green-100 text-green-800 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isDefault ? 'Current Default' : 'Set as Default'}
                      </button>
                    );
                  })()}
                </div>
              </div>

              {/* Template Info */}
              <div className="p-4 flex-grow flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {template.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full border border-gray-300"
                      style={{ backgroundColor: template.colors.primary }}
                    ></div>
                    <div
                      className="w-2.5 h-2.5 rounded-full border border-gray-300"
                      style={{ backgroundColor: template.colors.accent }}
                    ></div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 flex-grow">
                  {template.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mt-auto">
                  {template.features.slice(0, 2).map((feature, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                  {template.features.length > 2 && (
                    <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded">
                      +{template.features.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No templates in this category
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try selecting a different category or create your own template.
            </p>
          </div>
        )}
      </div>

      {/* Professional Templates Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-green-50 dark:bg-green-900/20">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Star className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Professional Templates Available
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {templates.length > 0
                  ? 'Choose from our collection of professionally designed invoice templates.'
                  : 'Install our professional template library to get started with beautiful designs.'
                }
              </p>
            </div>
          </div>
          {templates.length === 0 && (
            <button
              onClick={handleInstallTemplates}
              disabled={installing}
              className="ml-4 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm rounded-md transition-colors flex items-center gap-2"
            >
              {installing ? 'Installing...' : 'Install Templates'}
            </button>
          )}
        </div>
      </div>

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

export default TemplateGallery;