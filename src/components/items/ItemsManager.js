import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import itemService from '../../services/itemService';
import ItemModal from './ItemModal';

const ItemsManager = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showInactiveItems, setShowInactiveItems] = useState(false);

  // Load items and categories
  useEffect(() => {
    loadItems();
    loadCategories();
  }, []);

  // Filter items when search term, category, or show inactive changes
  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedCategory, showInactiveItems]);

  const loadItems = async () => {
    setLoading(true);
    const result = await itemService.getItems();
    if (result.success) {
      setItems(result.data.results || result.data);
    } else {
      toast.error('Failed to load items');
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    const result = await itemService.getCategories();
    if (result.success) {
      setCategories(result.data);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Filter by active status
    if (!showInactiveItems) {
      filtered = filtered.filter(item => item.is_active);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDeleteItem = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      const result = await itemService.deleteItem(item.id);
      if (result.success) {
        toast.success('Item deleted successfully');
        loadItems();
      } else {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleToggleActive = async (item) => {
    const result = await itemService.updateItem(item.id, {
      ...item,
      is_active: !item.is_active
    });
    if (result.success) {
      toast.success(`Item ${item.is_active ? 'deactivated' : 'activated'} successfully`);
      loadItems();
    } else {
      toast.error('Failed to update item status');
    }
  };

  const handleSaveItem = async (itemData) => {
    let result;
    if (editingItem) {
      result = await itemService.updateItem(editingItem.id, itemData);
    } else {
      result = await itemService.createItem(itemData);
    }

    if (result.success) {
      toast.success(`Item ${editingItem ? 'updated' : 'created'} successfully`);
      setShowModal(false);
      loadItems();
      loadCategories(); // Reload in case new category was added
    } else {
      toast.error(result.error || `Failed to ${editingItem ? 'update' : 'create'} item`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Items Library</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your reusable items for invoices and estimates
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateItem}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Item
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Show Inactive Toggle */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showInactiveItems}
              onChange={(e) => setShowInactiveItems(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Show inactive items</span>
          </label>

          {/* Items Count */}
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <TagIcon className="h-4 w-4 mr-1" />
            {filteredItems.length} items
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No items found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || selectedCategory ? 'Try adjusting your filters' : 'Get started by creating your first item'}
          </p>
          {!searchTerm && !selectedCategory && (
            <div className="mt-6">
              <button
                onClick={handleCreateItem}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add New Item
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border-l-4 ${
                  item.is_active 
                    ? 'border-blue-500 hover:shadow-lg' 
                    : 'border-gray-400 opacity-60'
                } transition-shadow duration-200`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    {item.category && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditItem(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteItem(item)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {item.description || 'No description'}
                </p>

                <div className="flex justify-between items-center">
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                    <span className="font-medium">{formatCurrency(item.unit_price)}</span>
                  </div>
                  
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {item.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Item Modal */}
      <ItemModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveItem}
        item={editingItem}
        categories={categories}
      />
    </div>
  );
};

export default ItemsManager;