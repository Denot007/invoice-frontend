import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ReceiptPercentIcon,
  TruckIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import expenseService from '../../services/expenseService';

const ExpenseSelector = ({ clientId, onExpensesSelected, buttonClassName, allowMultiple = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [mileage, setMileage] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filteredMileage, setFilteredMileage] = useState([]);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [selectedMileage, setSelectedMileage] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');

  useEffect(() => {
    if (isOpen && clientId && expenses.length === 0 && mileage.length === 0) {
      loadClientData();
    }
  }, [isOpen, clientId]);

  useEffect(() => {
    filterData();
  }, [expenses, mileage, searchTerm]);

  const loadClientData = async () => {
    if (!clientId) return;
    
    setLoading(true);
    try {
      const [expenseData, mileageData] = await Promise.all([
        expenseService.getClientExpenses(clientId),
        expenseService.getClientMileage(clientId)
      ]);
      
      setExpenses(expenseData.expenses || []);
      setMileage(mileageData.mileage || []);
    } catch (error) {
      console.error('Error loading client expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    if (!searchTerm) {
      setFilteredExpenses(expenses);
      setFilteredMileage(mileage);
      return;
    }

    const filteredExp = expenses.filter(expense => 
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const filteredMil = mileage.filter(mile => 
      mile.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mile.start_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mile.end_location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredExpenses(filteredExp);
    setFilteredMileage(filteredMil);
  };

  const handleExpenseToggle = (expenseId) => {
    if (!allowMultiple) {
      setSelectedExpenses([expenseId]);
      return;
    }
    
    setSelectedExpenses(prev => 
      prev.includes(expenseId) 
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const handleMileageToggle = (mileageId) => {
    if (!allowMultiple) {
      setSelectedMileage([mileageId]);
      return;
    }
    
    setSelectedMileage(prev => 
      prev.includes(mileageId) 
        ? prev.filter(id => id !== mileageId)
        : [...prev, mileageId]
    );
  };

  const handleAddSelected = () => {
    if (selectedExpenses.length === 0 && selectedMileage.length === 0) {
      return;
    }
    
    onExpensesSelected({
      expenses: selectedExpenses,
      mileage: selectedMileage
    });
    
    // Reset state
    setSelectedExpenses([]);
    setSelectedMileage([]);
    setIsOpen(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTotalSelected = () => {
    const selectedExpenseItems = expenses.filter(e => selectedExpenses.includes(e.id));
    const selectedMileageItems = mileage.filter(m => selectedMileage.includes(m.id));
    
    return [...selectedExpenseItems, ...selectedMileageItems]
      .reduce((sum, item) => sum + parseFloat(item.total_amount), 0);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={!clientId}
        className={buttonClassName || `
          inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 
          rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 
          bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <ReceiptPercentIcon className="h-4 w-4 mr-2" />
        Add from Expenses
        <ChevronDownIcon 
          className={`ml-2 h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 z-50 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4">
              {/* Search */}
              <div className="relative mb-3">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-3">
                <button
                  onClick={() => setActiveTab('expenses')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'expenses'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <ReceiptPercentIcon className="h-4 w-4 inline mr-2" />
                  Expenses ({filteredExpenses.length})
                </button>
                <button
                  onClick={() => setActiveTab('mileage')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'mileage'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <TruckIcon className="h-4 w-4 inline mr-2" />
                  Mileage ({filteredMileage.length})
                </button>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {activeTab === 'expenses' ? (
                    filteredExpenses.length > 0 ? (
                      <div className="space-y-2">
                        {filteredExpenses.map((expense) => (
                          <div
                            key={expense.id}
                            onClick={() => handleExpenseToggle(expense.id)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedExpenses.includes(expense.id)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                  selectedExpenses.includes(expense.id)
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {selectedExpenses.includes(expense.id) && (
                                    <CheckIcon className="w-2.5 h-2.5 text-white" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                                    {expense.description}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {expense.category_name} • {formatDate(expense.expense_date)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(expense.total_amount)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <ReceiptPercentIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">No expenses found</p>
                      </div>
                    )
                  ) : (
                    filteredMileage.length > 0 ? (
                      <div className="space-y-2">
                        {filteredMileage.map((mile) => (
                          <div
                            key={mile.id}
                            onClick={() => handleMileageToggle(mile.id)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedMileage.includes(mile.id)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                  selectedMileage.includes(mile.id)
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                  {selectedMileage.includes(mile.id) && (
                                    <CheckIcon className="w-2.5 h-2.5 text-white" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                                    {mile.description}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {mile.miles} miles @ {formatCurrency(mile.rate_per_mile)}/mile • {formatDate(mile.date)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(mile.total_amount)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <TruckIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">No mileage found</p>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Footer */}
              {(selectedExpenses.length > 0 || selectedMileage.length > 0) && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total: {formatCurrency(getTotalSelected())}
                      <span className="ml-2">
                        ({selectedExpenses.length + selectedMileage.length} items)
                      </span>
                    </div>
                    <button
                      onClick={handleAddSelected}
                      className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Add Selected
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpenseSelector;