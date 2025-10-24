import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import documentService from '../../services/documentService';
import invoiceService from '../../services/invoiceService';

const TemplateSelectionModal = ({ isOpen, onClose, invoice }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Professional templates preview colors
  const professionalTemplates = [
    { id: 'blue-professional', name: 'Blue Professional', preview_color: '#2563eb' },
    { id: 'gray-sidebar', name: 'Gray Minimal with Sidebar', preview_color: '#374151' },
    { id: 'elegant-green', name: 'Elegant Green', preview_color: '#10b981' },
    { id: 'dark-terminal', name: 'Dark Terminal', preview_color: '#00d1b2' },
    { id: 'modern-card', name: 'Modern Card', preview_color: '#2563eb' },
    { id: 'elegant-purple', name: 'Elegant Purple', preview_color: '#8b5cf6' },
    { id: 'minimal-orange', name: 'Minimal Orange', preview_color: '#ff8c00' },
    { id: 'corporate-red', name: 'Corporate Red', preview_color: '#dc3545' },
    { id: 'creative-pink', name: 'Creative Pink', preview_color: '#ec4899' },
    { id: 'ocean-teal', name: 'Ocean Teal', preview_color: '#14b8a6' },
    { id: 'classic-black', name: 'Classic Black', preview_color: '#000000' },
  ];

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    // Load preview when template is selected
    if (selectedTemplate && invoice) {
      loadPreview(selectedTemplate);
    }
  }, [selectedTemplate, invoice]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const result = await documentService.getTemplatesByType('invoice');
      const backendTemplates = Array.isArray(result) ? result : [];

      // Enhance with preview colors
      const enhancedTemplates = backendTemplates.map(bt => ({
        ...bt,
        preview_color: professionalTemplates.find(pt => pt.name === bt.name)?.preview_color || bt.primary_color || '#4f46e5'
      }));

      setTemplates(enhancedTemplates);

      // Auto-select default template
      const defaultTemplate = enhancedTemplates.find(t => t.is_default) || enhancedTemplates[0];
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async (template) => {
    try {
      setPreviewLoading(true);

      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      console.log('Loading preview for template:', template.name);
      console.log('Invoice data:', invoice);

      // Prepare invoice data for preview
      const invoiceData = {
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        client_name: invoice.client?.name || invoice.client_details?.name || 'Client',
        client_email: invoice.client?.email || invoice.client_details?.email || '',
        client_address: invoice.client?.address || invoice.client_details?.address || '',
        items: invoice.items || [],
        subtotal: invoice.subtotal || 0,
        tax: invoice.tax || 0,
        total: invoice.total_amount || invoice.total || 0,
        notes: invoice.notes || '',
        terms: invoice.terms || '',
      };

      const response = await documentService.previewTemplate(template.id, {
        format: 'html',
        invoice_data: invoiceData
      });

      if (response && response.html_content) {
        const blob = new Blob([response.html_content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } else {
        throw new Error('Invalid preview response');
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error('Failed to generate preview: ' + (error.response?.data?.detail || error.message));
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    if (!invoice?.client?.email && !invoice?.client_details?.email) {
      toast.error('Client email not available');
      return;
    }

    try {
      setSending(true);

      const recipientEmail = invoice.client?.email || invoice.client_details?.email;

      // Send invoice with selected template
      const response = await invoiceService.sendInvoice(invoice.id, {
        template_id: selectedTemplate.id,
        recipient_email: recipientEmail,
      });

      toast.success(`Invoice sent to ${recipientEmail} successfully!`);
      onClose();
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to send invoice');
    } finally {
      setSending(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-7xl h-[90vh] transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-bold text-white">
                          Choose Invoice Template
                        </Dialog.Title>
                        <p className="text-sm text-blue-100">
                          Invoice #{invoice?.invoice_number} to {invoice?.client?.name || invoice?.client_details?.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-600 dark:text-gray-400">
                        No templates available. Please create templates first.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Preview Area */}
                    <div className="flex-1 p-6 overflow-hidden">
                      <div className="h-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden shadow-inner">
                        {previewLoading ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                              <p className="text-gray-600 dark:text-gray-400">Loading preview...</p>
                            </div>
                          </div>
                        ) : previewUrl ? (
                          <iframe
                            src={previewUrl}
                            className="w-full h-full border-none bg-white"
                            title="Invoice Preview"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-gray-500 dark:text-gray-400">Select a template to preview</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Template List - Bottom Scrollable - Smaller Height */}
                    <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-3">
                      <div className="mb-2">
                        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                          Templates
                        </h3>
                      </div>
                      <div className="overflow-x-auto pb-2">
                        <div className="flex space-x-2 min-w-max">
                          {templates.map((template) => (
                            <motion.button
                              key={template.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedTemplate(template)}
                              className={`relative flex-shrink-0 w-32 h-20 rounded-lg border-2 transition-all overflow-hidden ${
                                selectedTemplate?.id === template.id
                                  ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 shadow-lg'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                              }`}
                            >
                              {/* Color Preview */}
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ backgroundColor: template.preview_color }}
                              >
                                <div className="text-white text-center px-2">
                                  <div className="text-[10px] font-semibold mb-1 opacity-90 truncate px-1">
                                    {template.name}
                                  </div>
                                  {template.is_default && (
                                    <span className="inline-block px-1.5 py-0.5 bg-white/20 rounded text-[9px] font-medium">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Selected Indicator */}
                              {selectedTemplate?.id === template.id && (
                                <div className="absolute top-1.5 right-1.5">
                                  <CheckCircleIcon className="w-5 h-5 text-white drop-shadow-lg" />
                                </div>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <div className="flex items-center justify-between gap-4">
                        <button
                          onClick={handleSkip}
                          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
                        >
                          Skip for Now
                        </button>
                        <button
                          onClick={handleSendInvoice}
                          disabled={!selectedTemplate || sending}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {sending ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <PaperAirplaneIcon className="w-5 h-5" />
                              <span>Send Invoice to {invoice?.client?.name || invoice?.client_details?.name}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TemplateSelectionModal;
