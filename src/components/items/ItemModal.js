import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { 
  XMarkIcon,
  TagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const ItemModal = ({ isOpen, onClose, onSave, item, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit_price: '',
    category: '',
    is_active: true,
  });
  
  const [customCategory, setCustomCategory] = useState('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        unit_price: item.unit_price?.toString() || '',
        category: item.category || '',
        is_active: item.is_active !== undefined ? item.is_active : true,
      });
      
      // Check if category is not in existing categories (custom)
      if (item.category && !categories.includes(item.category)) {
        setCustomCategory(item.category);
        setUseCustomCategory(true);
      } else {
        setCustomCategory('');
        setUseCustomCategory(false);
      }
    } else {
      setFormData({
        name: '',
        description: '',
        unit_price: '',
        category: '',
        is_active: true,
      });
      setCustomCategory('');
      setUseCustomCategory(false);
    }
  }, [item, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast.info('Please enter an item name');
      return;
    }
    
    if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) {
      toast.info('Please enter a valid unit price');
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      unit_price: parseFloat(formData.unit_price),
      category: useCustomCategory ? customCategory.trim() : formData.category,
    };

    onSave(submitData);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      unit_price: '',
      category: '',
      is_active: true,
    });
    setCustomCategory('');
    setUseCustomCategory(false);
    onClose();
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === '__custom__') {
      setUseCustomCategory(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setUseCustomCategory(false);
      setFormData(prev => ({ ...prev, category: value }));
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-xl font-semibold text-white flex items-center">
                      <TagIcon className="h-6 w-6 mr-2" />
                      {item ? 'Edit Item' : 'New Item'}
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Item Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter item name"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <div className="relative">
                      <DocumentTextIcon className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter item description (optional)"
                      />
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit Price *
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.unit_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, unit_price: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={useCustomCategory ? '__custom__' : formData.category}
                      onChange={handleCategoryChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category (optional)</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                      <option value="__custom__">+ Add new category</option>
                    </select>

                    {/* Custom Category Input */}
                    {useCustomCategory && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2"
                      >
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter new category name"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Item is active
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {item ? 'Update Item' : 'Create Item'}
                    </motion.button>
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

export default ItemModal;