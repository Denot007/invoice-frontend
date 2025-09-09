import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion} from 'framer-motion';
import { toast } from 'react-toastify';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  CalculatorIcon,
 
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

import clientService from '../../services/clientService';

const InvoiceModal = ({ isOpen, onClose, invoice, onSave, preSelectedClient }) => {
  const [formData, setFormData] = useState({
    client: null,
    clientId: '',
    invoice_number: '',
    title: '',
    description: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }],
    notes: '',
    terms: 'Net 30',
    tax_rate: 0,
    status: 'draft',
    // Payment fields for partial payments during creation AnimatePresence
    initial_payment: '',
    payment_method: '',
    payment_reference: '',
    payment_notes: '',
  });

  const [clients, setClients] = useState([]);

  // Load clients when modal opens
  useEffect(() => {
    const loadClients = async () => {
      try {
        const result = await clientService.getClients({ status: 'active' });
        if (result.success) {
          setClients(result.data || []);
        }
      } catch (error) {
        console.error('Error loading clients:', error);
      }
    };

    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (invoice) {
      console.log('Invoice data received:', invoice);
      // Map from both Django API format and frontend format
      const mappedItems = (invoice.items || []).map(item => ({
        description: item.description || '',
        quantity: parseFloat(item.quantity || 0),
        unit_price: parseFloat(item.unit_price || item.rate || 0),
        total: parseFloat(item.total || item.amount || 0),
      }));
      
      const formDataToSet = {
        client: invoice.client_details || invoice.client || null,
        clientId: invoice.client_details?.id || invoice.client?.id || invoice.client || '',
        invoice_number: invoice.invoice_number || invoice.invoiceNumber || '',
        title: invoice.title || '',
        description: invoice.description || '',
        issue_date: invoice.issue_date || invoice.issueDate || new Date().toISOString().split('T')[0],
        due_date: invoice.due_date || invoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: mappedItems.length > 0 ? mappedItems : [{ description: '', quantity: 1, unit_price: 0, total: 0 }],
        notes: invoice.notes || '',
        terms: invoice.terms || 'Net 30',
        tax_rate: parseFloat(invoice.tax_rate || invoice.tax || 0),
        status: invoice.status || 'draft',
      };
      console.log('Setting form data:', formDataToSet);
      setFormData(formDataToSet);
    } else {
      // Reset form for new invoice
      setFormData({
        client: null,
        clientId: '',
        invoice_number: '',
        title: '',
        description: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }],
        notes: '',
        terms: 'Net 30',
        tax_rate: 0,
        status: 'draft',
        // Payment fields for partial payments during creation
        initial_payment: '',
        payment_method: '',
        payment_reference: '',
        payment_notes: '',
      });
    }
  }, [invoice]);

  // Handle preSelectedClient when modal opens with a specific client
  useEffect(() => {
    if (preSelectedClient && isOpen && !invoice) {
      setFormData(prev => ({
        ...prev,
        client: preSelectedClient,
        clientId: preSelectedClient.id || preSelectedClient._id,
      }));
    }
  }, [preSelectedClient, isOpen, invoice]);

  const handleClientSelect = (e) => {
    const selectedClient = clients.find(c => c.id === parseInt(e.target.value) || c._id === e.target.value);
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        client: selectedClient,
        clientId: selectedClient.id || selectedClient._id,
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

  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * (formData.tax_rate || 0)) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTaxAmount();
    return subtotal + tax;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.clientId) {
      toast.error('Please select a client');
      return;
    }
    
    if (!formData.title) {
      toast.error('Please enter an invoice title');
      return;
    }
    
    if (formData.items.length === 0 || formData.items.every(item => !item.description)) {
      toast.error('Please add at least one item');
      return;
    }
    
    // Map form data to Django model structure
    const invoiceData = {
      client: formData.clientId,
      invoice_number: formData.invoice_number,
      title: formData.title,
      description: formData.description,
      issue_date: formData.issue_date,
      due_date: formData.due_date,
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

    // Add initial payment data if provided
    if (formData.initial_payment && parseFloat(formData.initial_payment) > 0) {
      invoiceData.initial_payment = {
        amount: parseFloat(formData.initial_payment),
        payment_method: formData.payment_method,
        reference_number: formData.payment_reference,
        notes: formData.payment_notes,
        payment_date: formData.issue_date, // Use invoice date as payment date
      };
    }
    
    // Pass invoice ID if we're editing an existing invoice
    const isEditing = invoice && (invoice.id || invoice._id);
    onSave(invoiceData, isEditing ? (invoice.id || invoice._id) : null);
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
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <Dialog.Title className="text-xl font-semibold text-white flex items-center">
                        <DocumentTextIcon className="h-6 w-6 mr-2" />
                        {invoice ? 'Edit Invoice' : 'Create New Invoice'}
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
                    {/* Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Invoice Number
                        </label>
                        <input
                          type="text"
                          value={formData.invoice_number}
                          onChange={(e) => handleInputChange(e, 'invoice_number')}
                          className="input"
                          placeholder="Will be auto-generated if left empty"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select Client
                        </label>
                        <select
                          onChange={handleClientSelect}
                          className="input"
                          value={formData.clientId || ''}
                          required
                        >
                          <option value="" disabled>Choose a client...</option>
                          {clients.map(client => {
                            const displayName = client.client_type === 'business' && client.company_name 
                              ? client.company_name 
                              : client.name;
                            return (
                              <option key={client.id || client._id} value={client.id || client._id}>
                                {displayName}
                                {client.client_type === 'business' && client.company_name && ` (${client.name})`}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Invoice Date
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
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={formData.due_date}
                          onChange={(e) => handleInputChange(e, 'due_date')}
                          className="input"
                          required
                        />
                      </div>
                    </div>

                    {/* Invoice Title and Description */}
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Invoice Title *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => handleInputChange(e, 'title')}
                          className="input"
                          placeholder="Invoice title"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description (Optional)
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange(e, 'description')}
                          className="input"
                          rows="2"
                          placeholder="Brief description of this invoice..."
                        />
                      </div>
                    </div>

                    {/* Client Details */}
                    {formData.client && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                          <UserGroupIcon className="h-5 w-5 mr-2" />
                          Client Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Name:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{formData.client.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Email:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{formData.client.email}</span>
                          </div>
                          {formData.client.address && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Address:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{formData.client.address}</span>
                            </div>
                          )}
                          {formData.client.phone && (
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
                          <div className="col-span-2">Unit Price</div>
                          <div className="col-span-2">Total</div>
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
                              placeholder="Item description"
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
                              ${item.total.toFixed(2)}
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
                            <span className="text-gray-600 dark:text-gray-400 mr-2">Tax Rate</span>
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
                            ${calculateTaxAmount().toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                          <span className="font-bold text-xl text-primary-600 dark:text-primary-400">
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
                          placeholder="Additional notes for the invoice..."
                        />
                      </div>
                      <div className="space-y-4">
                        {/* <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Payment Terms
                          </label>
                          <textarea
                            value={formData.terms}
                            onChange={(e) => handleInputChange(e, 'terms')}
                            className="input"
                            rows="2"
                            placeholder="Payment terms and conditions..."
                          />
                        </div> */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Status
                          </label>
                          <select
                            value={formData.status}
                            onChange={(e) => handleInputChange(e, 'status')}
                            className="input"
                          >
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="partial">Partially Paid</option>
                            <option value="overdue">Overdue</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Initial Payment Section */}
                    <div className="border bg-slate-200 dark:bg-slate-900 border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                        <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                        Initial Payment (Optional)
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Record an initial payment received when creating this invoice
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Payment Amount
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={calculateTotal()}
                            value={formData.initial_payment}
                            onChange={(e) => handleInputChange(e, 'initial_payment')}
                            className="input"
                            placeholder="0.00"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Max: ${calculateTotal().toFixed(2)}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Payment Method
                          </label>
                          <select
                            value={formData.payment_method}
                            onChange={(e) => handleInputChange(e, 'payment_method')}
                            className="input"
                            disabled={!formData.initial_payment}
                          >
                            <option value="">Select method</option>
                            <option value="cash">Cash</option>
                            <option value="check">Check</option>
                            <option value="direct_transfer">Direct Transfer</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="paypal">PayPal</option>
                            <option value="stripe">Stripe</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reference Number
                          </label>
                          <input
                            type="text"
                            value={formData.payment_reference}
                            onChange={(e) => handleInputChange(e, 'payment_reference')}
                            className="input"
                            placeholder="Check #, transaction ID, etc."
                            disabled={!formData.initial_payment}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Payment Notes
                          </label>
                          <input
                            type="text"
                            value={formData.payment_notes}
                            onChange={(e) => handleInputChange(e, 'payment_notes')}
                            className="input"
                            placeholder="Additional payment details"
                            disabled={!formData.initial_payment}
                          />
                        </div>
                      </div>
                      
                      {formData.initial_payment && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                          <div className="flex items-center text-sm text-green-700 dark:text-green-300">
                            <CreditCardIcon className="h-4 w-4 mr-2" />
                            <span>
                              Balance after initial payment: ${(calculateTotal() - parseFloat(formData.initial_payment || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
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
                      {invoice ? 'Update Invoice' : 'Create Invoice'}
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

export default InvoiceModal;