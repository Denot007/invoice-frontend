import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const ClientModal = ({ isOpen, onClose, client, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    client_type: 'business',
    company_name: '',
    tax_id: '',
    address: '',
    website: '',
    status: 'active',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      console.log('ClientModal received client data:', client);
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        client_type: client.client_type || 'business',
        company_name: client.company_name || '',
        tax_id: client.tax_id || '',
        address: client.address || '',
        website: client.website || '',
        status: client.status || 'active',
        notes: client.notes || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        client_type: 'business',
        company_name: '',
        tax_id: '',
        address: '',
        website: '',
        status: 'active',
        notes: '',
      });
    }
    setErrors({});
  }, [client, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    if (formData.client_type === 'business' && !formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required for businesses';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing 
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                <form onSubmit={handleSubmit}>
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <Dialog.Title className="text-xl font-semibold text-white flex items-center">
                        <UserGroupIcon className="h-6 w-6 mr-2" />
                        {client ? 'Edit Client' : 'Add New Client'}
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
                    {/* Client Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Client Type
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => handleInputChange({ target: { name: 'client_type', value: 'business' } })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.client_type === 'business'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <BuildingOfficeIcon className={`h-8 w-8 mx-auto mb-2 ${
                            formData.client_type === 'business' ? 'text-blue-500' : 'text-gray-400'
                          }`} />
                          <span className={`block text-sm font-medium ${
                            formData.client_type === 'business' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            Business
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange({ target: { name: 'client_type', value: 'individual' } })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.client_type === 'individual'
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <UserIcon className={`h-8 w-8 mx-auto mb-2 ${
                            formData.client_type === 'individual' ? 'text-purple-500' : 'text-gray-400'
                          }`} />
                          <span className={`block text-sm font-medium ${
                            formData.client_type === 'individual' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            Individual
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {formData.client_type === 'business' ? 'Contact Name' : 'Full Name'} *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`input ${errors.name ? 'border-red-500' : ''}`}
                          placeholder={formData.client_type === 'business' ? 'John Smith' : 'John Doe'}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      {formData.client_type === 'business' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Company Name *
                          </label>
                          <input
                            type="text"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleInputChange}
                            className={`input ${errors.company_name ? 'border-red-500' : ''}`}
                            placeholder="Acme Corporation"
                          />
                          {errors.company_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <div className="relative">
                          <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                            placeholder="contact@example.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone *
                        </label>
                        <div className="relative">
                          <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`input pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Address Information */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                        <MapPinIcon className="h-5 w-5 mr-2" />
                        Address Information
                      </h3>
                      <div>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="Full Address"
                        />
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Website
                        </label>
                        <div className="relative">
                          <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            className="input pl-10"
                            placeholder="www.example.com"
                          />
                        </div>
                      </div>

                      {formData.client_type === 'business' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tax ID
                          </label>
                          <input
                            type="text"
                            name="tax_id"
                            value={formData.tax_id}
                            onChange={handleInputChange}
                            className="input"
                            placeholder="XX-XXXXXXX"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="input"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="input"
                        rows="3"
                        placeholder="Additional notes about this client..."
                      />
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
                      <UserGroupIcon className="h-5 w-5 mr-2" />
                      {client ? 'Update Client' : 'Add Client'}
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

export default ClientModal;