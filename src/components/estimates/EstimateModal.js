import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  CalculatorIcon,
  
  UserGroupIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import clientService from '../../services/clientService';

const EstimateModal = ({ isOpen, onClose, estimate, onSave }) => {
  const [formData, setFormData] = useState({
    client: null,
    clientId: '',
    estimate_number: '',
    title: '',
    description: '',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }],
    notes: '',
    terms: 'Valid for 30 days',
    tax_rate: 0,
    discount_rate: 0,
    status: 'draft',
  });

  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (estimate) {
      // Map estimate data from backend format
      setFormData({
        client: estimate.client_details || estimate.client,
        clientId: estimate.client?.id || estimate.client_details?.id || estimate.client,
        estimate_number: estimate.estimate_number || '',
        title: estimate.title || '',
        description: estimate.description || '',
        issue_date: estimate.issue_date || new Date().toISOString().split('T')[0],
        expiry_date: estimate.expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: (estimate.items || []).length > 0 ? estimate.items.map(item => ({
          description: item.description || '',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          total: (item.quantity || 1) * (item.unit_price || 0),
        })) : [{ description: '', quantity: 1, unit_price: 0, total: 0 }],
        notes: estimate.notes || '',
        terms: estimate.terms || 'Valid for 30 days',
        tax_rate: estimate.tax_rate || 0,
        discount_rate: estimate.discount_rate || 0,
        status: estimate.status || 'draft',
      });
    } else {
      // Generate new estimate number for new estimate
      const newEstimateNumber = `EST-${Date.now().toString().slice(-4)}`;
      setFormData(prev => ({ 
        ...prev, 
        estimate_number: newEstimateNumber,
        client: null,
        clientId: '',
        title: '',
        description: '',
      }));
    }
  }, [estimate, isOpen]);

  // Fetch clients when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchClients = async () => {
        try {
          const result = await clientService.getClients();
          if (result.success) {
            setClients(result.data || []);
          }
        } catch (error) {
          console.error('Error fetching clients:', error);
        }
      };
      fetchClients();
    }
  }, [isOpen]);

  const handleClientSelect = (e) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;
    
    const selectedClient = clients.find(c => {
      const clientId = c._id || c.id;
      return clientId === selectedValue || clientId === parseInt(selectedValue);
    });
    
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        client: selectedClient,
        clientId: selectedClient._id || selectedClient.id,
      }));
    }
  };

  const handleInputChange = (e, field, subfield = null) => {
    if (subfield) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subfield]: e.target.value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value,
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Calculate total if quantity or unit_price changes
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0, total: 0 }],
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * (formData.tax_rate || 0)) / 100;
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * (formData.discount_rate || 0)) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discount = calculateDiscount();
    return subtotal + tax - discount;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.clientId) {
      alert('Please select a client');
      return;
    }
    
    if (!formData.title) {
      alert('Please enter an estimate title');
      return;
    }
    
    if (formData.items.length === 0 || formData.items.every(item => !item.description)) {
      alert('Please add at least one item');
      return;
    }
    
    // Auto-generate estimate number if empty
    let estimateNumber = formData.estimate_number;
    if (!estimateNumber || estimateNumber.trim() === '') {
      estimateNumber = `EST-${Date.now().toString().slice(-6)}`;
    }
    
    // Map form data to Django model structure
    const estimateData = {
      client: formData.clientId,
      estimate_number: estimateNumber,
      title: formData.title,
      description: formData.description,
      issue_date: formData.issue_date,
      expiry_date: formData.expiry_date,
      notes: formData.notes,
      terms: formData.terms,
      tax_rate: parseFloat(formData.tax_rate) || 0,
      status: formData.status,
      items: formData.items.map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        unit_price: parseFloat(item.unit_price) || 0,
      })),
    };
    
    onSave(estimateData);
  };

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
          <div className="fixed inset-0 bg-black bg-opacity-50" />
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                <form onSubmit={handleSubmit}>
                  {/* Header */}
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <Dialog.Title className="text-xl font-semibold text-white flex items-center">
                        <DocumentDuplicateIcon className="h-6 w-6 mr-2" />
                        {estimate ? 'Edit Estimate' : 'Create New Estimate'}
                      </Dialog.Title>
                      <button
                        type="button"
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Estimate Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Estimate Number
                        </label>
                        <input
                          type="text"
                          value={formData.estimate_number}
                          onChange={(e) => handleInputChange(e, 'estimate_number')}
                          className="input"
                          placeholder="Auto-generated if empty"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select Client
                        </label>
                        <select
                          onChange={handleClientSelect}
                          className="input"
                          value={formData.clientId || ""}
                        >
                          <option value="" disabled>Choose a client...</option>
                          {clients.map(client => (
                            <option key={client._id || client.id} value={client._id || client.id}>
                              {client.client_type === 'business' && client.company_name 
                                ? client.company_name 
                                : client.name || 'Unknown Client'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Title and Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Estimate Title *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => handleInputChange(e, 'title')}
                          className="input"
                          placeholder="e.g., Website Development Proposal"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          value={formData.description}
                          onChange={(e) => handleInputChange(e, 'description')}
                          className="input"
                          placeholder="Brief description of the work"
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Estimate Date
                        </label>
                        <input
                          type="date"
                          value={formData.issue_date}
                          onChange={(e) => handleInputChange(e, 'issue_date')}
                          className="input"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Valid Until
                        </label>
                        <input
                          type="date"
                          value={formData.expiry_date}
                          onChange={(e) => handleInputChange(e, 'expiry_date')}
                          className="input"
                          required
                        />
                      </div>
                    </div>

                    {/* Client Details */}
                    {formData.client && formData.client.name && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                          <UserGroupIcon className="h-5 w-5 mr-2" />
                          Client Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Name:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{formData.client?.name || ''}</span>
                          </div>
                          {formData.client?.email && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Email:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{formData.client.email}</span>
                            </div>
                          )}
                          {formData.client?.address && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Address:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{formData.client.address}</span>
                            </div>
                          )}
                          {formData.client?.phone && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{formData.client.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Line Items */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Line Items
                      </h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          <div className="col-span-5">Description</div>
                          <div className="col-span-2">Quantity</div>
                          <div className="col-span-2">Rate</div>
                          <div className="col-span-2">Amount</div>
                          <div className="col-span-1"></div>
                        </div>
                        {formData.items.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-12 gap-2"
                          >
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              className="col-span-5 input text-sm"
                              placeholder="Service description"
                              required
                            />
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="col-span-2 input text-sm"
                              min="0"
                              step="0.01"
                              required
                            />
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="col-span-2 input text-sm"
                              min="0"
                              step="0.01"
                              required
                            />
                            <div className="col-span-2 input text-sm bg-gray-100 dark:bg-gray-700">
                              ${(item.total || 0).toFixed(2)}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="col-span-1 p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addItem}
                        className="mt-3 btn-secondary flex items-center text-sm"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Item
                      </button>
                    </div>

                    {/* Totals */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${calculateSubtotal().toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center">
                            <span className="text-gray-600 dark:text-gray-400 mr-2">Tax</span>
                            <input
                              type="number"
                              value={formData.tax_rate}
                              onChange={(e) => handleInputChange(e, 'tax_rate')}
                              className="w-16 px-2 py-1 text-xs border rounded"
                              min="0"
                              step="0.01"
                            />
                            <span className="ml-1 text-gray-500">%</span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${calculateTax().toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center">
                            <span className="text-gray-600 dark:text-gray-400 mr-2">Discount</span>
                            <input
                              type="number"
                              value={formData.discount_rate}
                              onChange={(e) => handleInputChange(e, 'discount_rate')}
                              className="w-16 px-2 py-1 text-xs border rounded"
                              min="0"
                              step="0.01"
                            />
                            <span className="ml-1 text-gray-500">%</span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            -${calculateDiscount().toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                          <span className="font-bold text-xl text-purple-600 dark:text-purple-400">
                            ${calculateTotal().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notes and Terms */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => handleInputChange(e, 'notes')}
                          className="input"
                          rows="3"
                          placeholder="Additional notes about this estimate..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Terms & Conditions
                        </label>
                        <textarea
                          value={formData.terms}
                          onChange={(e) => handleInputChange(e, 'terms')}
                          className="input"
                          rows="3"
                          placeholder="Terms and conditions..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex items-center"
                    >
                      <CalculatorIcon className="h-5 w-5 mr-2" />
                      {estimate ? 'Update Estimate' : 'Create Estimate'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EstimateModal;