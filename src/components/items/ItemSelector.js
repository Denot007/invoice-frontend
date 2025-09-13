import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CurrencyDollarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import itemService from '../../services/itemService';

const ItemSelector = ({ onItemSelect, buttonClassName, allowMultiple = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (isOpen && items.length === 0) {
      loadItems();
    }
  }, [isOpen]);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm]);

  const loadItems = async () => {
    setLoading(true);
    const result = await itemService.getItems({ is_active: true });
    if (result.success) {
      const itemsData = result.data.results || result.data;
      setItems(itemsData);
    }
    setLoading(false);
  };

  const filterItems = () => {
    if (!searchTerm) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredItems(filtered);
  };

  const handleItemSelect = (item) => {
    if (allowMultiple) {
      const isSelected = selectedItems.find(selected => selected.id === item.id);
      if (isSelected) {
        setSelectedItems(prev => prev.filter(selected => selected.id !== item.id));
      } else {
        setSelectedItems(prev => [...prev, item]);
      }
    } else {
      // Single selection mode - immediately select and close
      onItemSelect(item);
      setIsOpen(false);
      setSearchTerm('');
      setSelectedItems([]);
    }
  };

  const handleAddSelected = () => {
    if (selectedItems.length > 0) {
      selectedItems.forEach(item => onItemSelect(item));
      setIsOpen(false);
      setSearchTerm('');
      setSelectedItems([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...filteredItems]);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClassName || `
          inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 
          rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 
          bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        `}
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        {allowMultiple ? 'Add from Library' : 'Select from Library'}
        <ChevronDownIcon 
          className={`ml-2 h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 z-20 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
            >
              {/* Search Box */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
              </div>

              {/* Select All Header - Only show in multiple selection mode */}
              {allowMultiple && filteredItems.length > 0 && (
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 mr-2"
                    />
                    Select All ({selectedItems.length} of {filteredItems.length})
                  </button>
                </div>
              )}

              {/* Items List */}
              <div className="max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading items...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="p-4 text-center">
                    <TagIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No items found' : 'No items available'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchTerm ? 'Try adjusting your search' : 'Create items in the Items Library'}
                    </p>
                  </div>
                ) : (
                  <div className="py-1">
                    {filteredItems.map((item) => (
                      <motion.button
                        key={item.id}
                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                        onClick={() => handleItemSelect(item)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            {/* Checkbox for multiple selection mode */}
                            {allowMultiple && (
                              <input
                                type="checkbox"
                                checked={selectedItems.some(selected => selected.id === item.id)}
                                onChange={() => handleItemSelect(item)}
                                className="rounded border-gray-300 text-blue-600 mt-0.5"
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                  {item.name}
                                </span>
                              {item.category && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {item.category}
                                </span>
                              )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center text-green-600 dark:text-green-400 ml-2">
                            <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                            <span className="text-sm font-medium">
                              {formatCurrency(item.unit_price)}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!loading && items.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  {allowMultiple ? (
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {filteredItems.length} of {items.length} items shown
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddSelected}
                        disabled={selectedItems.length === 0}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedItems.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        Add Selected ({selectedItems.length})
                      </motion.button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {filteredItems.length} of {items.length} items shown
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItemSelector;