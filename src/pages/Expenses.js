import  { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ReceiptPercentIcon,
  TruckIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
  UserIcon,
  TagIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import expenseService from '../services/expenseService';
import invoiceService from '../services/invoiceService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'react-toastify';

const Expenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [mileage, setMileage] = useState([]);
  const [categories, setCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState({ id: null, type: null, description: '' });
  const [showAddToInvoiceModal, setShowAddToInvoiceModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [availableInvoices, setAvailableInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [modalType, setModalType] = useState('expense'); // 'expense', 'mileage'
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState([]);
  const [selectedMileageIds, setSelectedMileageIds] = useState([]);
  const [showAutoCreateOption, setShowAutoCreateOption] = useState(false);
  const [autoCreateClientId, setAutoCreateClientId] = useState('');
  const [autoCreateClientName, setAutoCreateClientName] = useState('');
  const [autoCreateCompanyName, setAutoCreateCompanyName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Separate state for input value
  const searchInputRef = useRef(null); // Ref to maintain focus
  const [filters, setFilters] = useState({
    category: '',
    client: '',
    is_reimbursable: '',
    is_invoiced: '',
    is_tax_deductible: '',
    start_date: '',
    end_date: '',
  });
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses', 'mileage', 'categories'
  const [summary, setSummary] = useState({});
  const [mileageSummary, setMileageSummary] = useState({});

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    category: '',
    tax_type: 'none',
    tax_rate: '',
    payment_method: 'cash',
    reference_number: '',
    vendor: '',
    location: '',
    client: '',
    is_reimbursable: false,
    is_tax_deductible: false,
    receipt_file: null,
    notes: '',
  });

  const [mileageForm, setMileageForm] = useState({
    description: '',
    date: new Date().toISOString().split('T')[0],
    start_location: '',
    end_location: '',
    miles: '',
    mileage_type: 'business',
    rate_per_mile: '0.655', // Default IRS rate
    client: '',
    is_reimbursable: false,
    notes: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    loadData();
  }, [filters, searchTerm, activeTab]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadData = async () => {
    try {
      // Store current focus element
      const currentFocus = document.activeElement;
      const isSearchFocused = currentFocus === searchInputRef.current;
      
      // Only set loading for initial load, not for searches
      if (!expenses.length && !mileage.length && !categories.length) {
        setLoading(true);
      }
      
      // Load different data based on active tab
      let dataPromises = [
        expenseService.getCategories(),
      ];
      
      if (activeTab === 'expenses') {
        dataPromises.push(
          expenseService.getExpenseSummary(),
          expenseService.getExpenses({ ...filters, search: searchTerm })
        );
      } else if (activeTab === 'mileage') {
        dataPromises.push(
          expenseService.getMileageSummary(),
          expenseService.getMileage({ ...filters, search: searchTerm })
        );
      } else {
        // Load both for categories tab
        dataPromises.push(
          expenseService.getExpenseSummary(),
          expenseService.getExpenses({ ...filters, search: searchTerm }),
          expenseService.getMileage({ ...filters, search: searchTerm })
        );
      }
      
      const results = await Promise.all(dataPromises);
     
      
      // Handle categories response (always an array from DRF ViewSet)
      const categoriesData = results[0];
      setCategories(Array.isArray(categoriesData) ? categoriesData : (categoriesData?.results || []));
      
      if (activeTab === 'expenses') {
        // Handle expense summary and data
        setSummary(results[1] || {});
        const expensesData = results[2];
        setExpenses(Array.isArray(expensesData) ? expensesData : (expensesData?.results || []));
      } else if (activeTab === 'mileage') {
        // Handle mileage summary and data
        setMileageSummary(results[1] || {});
        const mileageData = results[2];
        setMileage(Array.isArray(mileageData) ? mileageData : (mileageData?.results || []));
      } else if (activeTab === 'categories') {
        // Handle both summaries and data
        setSummary(results[1] || {});
        if (results[2]) {
          const expensesData = results[2];
          setExpenses(Array.isArray(expensesData) ? expensesData : (expensesData?.results || []));
        }
        if (results[3]) {
          const mileageData = results[3];
          setMileage(Array.isArray(mileageData) ? mileageData : (mileageData?.results || []));
        }
      }
      
      // Restore focus to search input if it was focused before
      if (isSearchFocused && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current.focus();
          // Restore cursor position to end
          const length = searchInputRef.current.value.length;
          searchInputRef.current.setSelectionRange(length, length);
        }, 0);
      }
      
    } catch (error) {
      // Set empty arrays on error to prevent UI issues
      setExpenses([]);
      setMileage([]);
      setCategories([]);
      setSummary({});
    } finally {
      // Only update loading state if it was set to true
      if (loading) {
        setLoading(false);
      }
    }
  };

  const loadClients = async () => {
    try {
      // Try multiple token sources
      const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!accessToken) {
        console.error('No authentication token found!');
        return;
      }
      
      // Use direct fetch with explicit headers
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/clients/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Clients API error:', response.status);
        return;
      }
      
      const clientsData = await response.json();
      setClients(Array.isArray(clientsData) ? clientsData : (clientsData?.results || []));
      
    } catch (error) {
      console.error('Error loading clients:', error);
      // Set empty array on error
      setClients([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = modalType === 'expense' ? expenseForm : mileageForm;
      
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Handle form data properly
      Object.keys(data).forEach(key => {
        let value = data[key];
        
        // Skip null/empty values except for booleans and required fields
        if (value === null || value === '' || value === undefined) {
          // Always include boolean fields even if false
          if (typeof value === 'boolean') {
            // Convert and include
          } else if (value === '') {
            // For empty strings, only include required fields
            if (!['amount', 'miles', 'description', 'expense_date', 'date'].includes(key)) {
              return;
            }
          } else {
            // For null/undefined, skip optional fields like category, client
            if (!['amount', 'miles', 'description', 'expense_date', 'date'].includes(key)) {
              return;
            }
          }
        }
        
        // Convert boolean values to strings for Django
        if (typeof value === 'boolean') {
          value = value.toString();
        }
        
        // Handle file uploads specially
        if (key === 'receipt_file') {
          if (value instanceof File) {
            formData.append(key, value);
            console.log('Appending file:', value.name, value.type, value.size);
          }
          // Skip if no file selected (don't append null/empty)
        } else {
          formData.append(key, value);
        }
      });

      console.log('Submitting form data:', data);
      console.log('FormData entries:', Array.from(formData.entries()));

      let result;
      if (selectedExpense) {
        if (modalType === 'expense') {
          result = await expenseService.updateExpense(selectedExpense.id, formData);
        } else {
          result = await expenseService.updateMileage(selectedExpense.id, formData);
        }
        console.log('Update result:', result);
      } else {
        if (modalType === 'expense') {
          result = await expenseService.createExpense(formData);
        } else {
          result = await expenseService.createMileage(formData);
        }
        console.log('Create result:', result);
      }

      setShowModal(false);
      resetForm();
      await loadData();
      
      // Show success message
      toast.success(selectedExpense ? 'Updated successfully!' : 'Created successfully!');
      
    } catch (error) {
      console.error('Error saving:', error);
      
      // Show error details to user
      let errorMessage = 'Error saving data';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          const errors = Object.entries(errorData).map(([field, messages]) => {
            return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
          }).join('\n');
          errorMessage = errors;
        } else {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting category:', categoryForm);
      
      let result;
      if (selectedExpense) {
        result = await expenseService.updateCategory(selectedExpense.id, categoryForm);
        console.log('Category update result:', result);
      } else {
        result = await expenseService.createCategory(categoryForm);
        console.log('Category create result:', result);
      }
      
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '', is_active: true });
      setSelectedExpense(null);
      await loadData();
      
      toast.success(selectedExpense ? 'Category updated successfully!' : 'Category created successfully!');
      
    } catch (error) {
      console.error('Error saving category:', error);
      
      let errorMessage = 'Error saving category';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errors = Object.entries(errorData).map(([field, messages]) => {
            return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
          }).join('\n');
          errorMessage = errors;
        } else {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleDelete = (id, type = 'expense', description = '') => {
    setDeleteItem({ id, type, description });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteItem.type === 'expense') {
        await expenseService.deleteExpense(deleteItem.id);
        toast.success('Expense deleted successfully');
      } else if (deleteItem.type === 'mileage') {
        await expenseService.deleteMileage(deleteItem.id);
        toast.success('Mileage entry deleted successfully');
      } else if (deleteItem.type === 'category') {
        await expenseService.deleteCategory(deleteItem.id);
        toast.success('Category deleted successfully');
      }
      
      setShowDeleteModal(false);
      setDeleteItem({ id: null, type: null, description: '' });
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete item. Please try again.');
    }
  };

  const resetForm = () => {
    setExpenseForm({
      description: '',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      category: '',
      tax_type: 'none',
      tax_rate: '',
      payment_method: 'cash',
      reference_number: '',
      vendor: '',
      location: '',
      client: '',
      is_reimbursable: false,
      is_tax_deductible: false,
      receipt_file: null,
      notes: '',
    });
    setMileageForm({
      description: '',
      date: new Date().toISOString().split('T')[0],
      start_location: '',
      end_location: '',
      miles: '',
      mileage_type: 'business',
      rate_per_mile: '0.655',
      client: '',
      is_reimbursable: false,
      notes: '',
    });
    setSelectedExpense(null);
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedExpense(item);
    
    // Force reload clients every time modal opens to ensure fresh data
    console.log('Force reloading clients for modal...');
    loadClients();
    
    if (item) {
      if (type === 'expense') {
        setExpenseForm({
          ...item,
          expense_date: item.expense_date || new Date().toISOString().split('T')[0],
          receipt_file: null, // Don't prefill file input
        });
      } else {
        setMileageForm({
          ...item,
          date: item.date || new Date().toISOString().split('T')[0],
        });
      }
    } else {
      resetForm();
    }
    
    setShowModal(true);
  };

  const openCategoryModal = (category = null) => {
    setSelectedExpense(category);
    if (category) {
      setCategoryForm(category);
    } else {
      setCategoryForm({ name: '', description: '', is_active: true });
    }
    setShowCategoryModal(true);
  };

  const openAddToInvoiceModal = (items, type) => {
    setSelectedItems(items);
    setModalType(type);
    loadInvoices(items);
    setShowAddToInvoiceModal(true);
  };

  const loadInvoices = async (items = []) => {
    try {
      // Extract unique client IDs from the selected items
      const clientIds = [...new Set(items.map(item => item.client).filter(Boolean))];
      console.log('Loading invoices for client IDs:', clientIds);
      
      let invoices;
      if (clientIds.length === 1) {
        // Filter by specific client
        console.log('Loading invoices with draft status for client:', clientIds[0]);
        invoices = await invoiceService.getInvoices({ status: 'draft', client: clientIds[0] });
      } else if (clientIds.length === 0) {
        // No client specified, load all draft invoices
        console.log('Loading all draft invoices (no client specified)');
        invoices = await invoiceService.getInvoices({ status: 'draft' });
      } else {
        // Multiple clients - show message and load all drafts as fallback
        console.log('Multiple clients detected, loading all draft invoices');
        toast.warning('Selected items have different clients. Showing all draft invoices.');
        invoices = await invoiceService.getInvoices({ status: 'draft' });
      }
      
      console.log('Raw invoice response:', invoices);
      const invoiceArray = Array.isArray(invoices) ? invoices : (invoices?.data || invoices?.results || []);
      console.log('Processed invoice array:', invoiceArray);
      console.log('Invoice array length:', invoiceArray.length);
      
      if (invoiceArray.length > 0) {
        console.log('First invoice sample:', invoiceArray[0]);
      }
      
      // If no invoices exist and we have a single client, offer to auto-create
      if (invoiceArray.length === 0 && clientIds.length === 1) {
        console.log('No invoices found, will offer auto-creation option');
        setShowAutoCreateOption(true);
        setAutoCreateClientId(clientIds[0]);
        setAutoCreateClientName(items[0].client_name);
        setAutoCreateCompanyName(items[0].client_company);
      } else {
        setShowAutoCreateOption(false);
      }
      
      setAvailableInvoices(invoiceArray);
    } catch (error) {
      console.error('Error loading invoices:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load invoices');
    }
  };

  const handleAutoCreateInvoice = async () => {
    if (!autoCreateClientId) {
      toast.error('Client information missing');
      return;
    }

    try {
      // Generate invoice number with timestamp
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const invoiceNumber = `INV-${autoCreateClientName.replace(/\s+/g, '').slice(0, 4).toUpperCase()}-${timestamp}`;
      
      const invoiceData = {
        client: autoCreateClientId,
        invoice_number: invoiceNumber,
        title: `Reimbursement Invoice - ${autoCreateClientName}`,
        description: `Reimbursement for business expenses`,
        status: 'draft',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        subtotal: 0,
        tax_rate: 0,
        tax_amount: 0,
        total: 0,
        amount_paid: 0,
        balance_due: 0
      };

      const response = await invoiceService.createInvoice(invoiceData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create invoice');
      }
      
      const newInvoice = response.data;
      toast.success(`Created new invoice: ${newInvoice.invoiceNumber}`);
      
      // Add the new invoice to the list and select it
      setAvailableInvoices([newInvoice]);
      setSelectedInvoice(newInvoice.id);
      setShowAutoCreateOption(false);
      
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    }
  };

  const handleAddToInvoice = async () => {
    if (!selectedInvoice) {
      toast.error('Please select an invoice');
      return;
    }

    if (!selectedItems.length) {
      toast.error('No items selected');
      return;
    }

    try {
      const itemIds = selectedItems.map(item => item.id);
      
      let result;
      if (modalType === 'expense') {
        result = await expenseService.addExpensesToInvoice(selectedInvoice, itemIds);
      } else {
        result = await expenseService.addMileageToInvoice(selectedInvoice, itemIds);
      }

      toast.success(result.message);
      setShowAddToInvoiceModal(false);
      setSelectedItems([]);
      setSelectedInvoice('');
      
      // Clear selected IDs based on modal type
      if (modalType === 'expense') {
        setSelectedExpenseIds([]);
      } else {
        setSelectedMileageIds([]);
      }
      
      await loadData(); // Refresh the data
    } catch (error) {
      console.error('Error adding to invoice:', error);
      toast.error(error.response?.data?.error || 'Failed to add items to invoice');
    }
  };

  const getReimbursableItems = (items) => {
    return items.filter(item => item.is_reimbursable && !item.is_invoiced);
  };


  const renderSummaryCards = () => {
    if (activeTab === 'mileage') {
      // Mileage-specific stats
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <TruckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Miles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(mileageSummary.total_miles || 0).toLocaleString()} mi
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <ReceiptPercentIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(mileageSummary.total_amount || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <UserIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reimbursable</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(mileageSummary.total_reimbursable || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <DocumentArrowUpIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Miles/Trip</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(mileageSummary.average_miles || 0).toFixed(1)} mi
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Expense stats (default)
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <ReceiptPercentIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summary.total_expenses || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tax Deductible</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summary.total_tax_deductible || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <UserIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reimbursable</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summary.total_reimbursable || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <DocumentArrowUpIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Invoiced</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summary.total_invoiced || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderExpenseModal = () => {
    const form = modalType === 'expense' ? expenseForm : mileageForm;
    const setForm = modalType === 'expense' ? setExpenseForm : setMileageForm;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedExpense ? 'Edit' : 'Add'} {modalType === 'expense' ? 'Expense' : 'Mileage'}
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {modalType === 'expense' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.expense_date}
                      onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Client
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.client}
                      onChange={(e) => setForm({ ...form, client: e.target.value })}
                    >
                      <option value="">Select client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}{client.company_name ? ` - ${client.company_name}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vendor
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.vendor}
                      onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Method
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.payment_method}
                      onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                    >
                      <option value="cash">Cash</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="check">Check</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tax Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.tax_type}
                      onChange={(e) => setForm({ ...form, tax_type: e.target.value })}
                    >
                      <option value="none">No Tax</option>
                      <option value="inclusive">Tax Inclusive</option>
                      <option value="exclusive">Tax Exclusive</option>
                    </select>
                  </div>

                  {form.tax_type !== 'none' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        value={form.tax_rate}
                        onChange={(e) => setForm({ ...form, tax_rate: e.target.value })}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Receipt
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        console.log('Selected file:', file);
                        setForm({ ...form, receipt_file: file });
                      }}
                    />
                    {form.receipt_file && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Selected: {form.receipt_file.name} ({(form.receipt_file.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      checked={form.is_reimbursable}
                      onChange={(e) => setForm({ ...form, is_reimbursable: e.target.checked })}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Reimbursable</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      checked={form.is_tax_deductible}
                      onChange={(e) => setForm({ ...form, is_tax_deductible: e.target.checked })}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Tax Deductible</span>
                  </label>
                </div>
              </>
            ) : (
              <>
                {/* Mileage Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Miles *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.miles}
                      onChange={(e) => setForm({ ...form, miles: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Location
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.start_location}
                      onChange={(e) => setForm({ ...form, start_location: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Location
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.end_location}
                      onChange={(e) => setForm({ ...form, end_location: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mileage Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.mileage_type}
                      onChange={(e) => setForm({ ...form, mileage_type: e.target.value })}
                    >
                      <option value="business">Business</option>
                      <option value="medical">Medical</option>
                      <option value="charity">Charity</option>
                      <option value="moving">Moving</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rate per Mile ($)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.rate_per_mile}
                      onChange={(e) => setForm({ ...form, rate_per_mile: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Client
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      value={form.client}
                      onChange={(e) => setForm({ ...form, client: e.target.value })}
                    >
                      <option value="">Select client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}{client.company_name ? ` - ${client.company_name}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      checked={form.is_reimbursable}
                      onChange={(e) => setForm({ ...form, is_reimbursable: e.target.checked })}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Reimbursable</span>
                  </label>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {selectedExpense ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your business expenses</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => openModal('mileage')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <TruckIcon className="h-4 w-4 mr-2" />
            Add Mileage
          </button>
          <button
            onClick={() => openModal('expense')}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'expenses', label: 'Expenses', icon: ReceiptPercentIcon },
            { id: 'mileage', label: 'Mileage', icon: TruckIcon },
            { id: 'categories', label: 'Categories', icon: TagIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search expenses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {activeTab === 'categories' && (
          <button
            onClick={() => openCategoryModal()}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Category
          </button>
        )}

        {/* Add to Invoice buttons for selected reimbursable items */}
        {activeTab === 'expenses' && selectedExpenseIds.length > 0 && (
          <button
            onClick={() => openAddToInvoiceModal(expenses.filter(e => selectedExpenseIds.includes(e.id)), 'expense')}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
            Add Selected to Invoice ({selectedExpenseIds.length})
          </button>
        )}

        {activeTab === 'mileage' && selectedMileageIds.length > 0 && (
          <button
            onClick={() => openAddToInvoiceModal(mileage.filter(m => selectedMileageIds.includes(m.id)), 'mileage')}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
            Add Selected to Invoice ({selectedMileageIds.length})
          </button>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'mileage' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={mileage.filter(m => m.is_reimbursable && !m.is_invoiced).length > 0 && selectedMileageIds.length === mileage.filter(m => m.is_reimbursable && !m.is_invoiced).length}
                      onChange={(e) => {
                        const reimbursableMileageIds = mileage.filter(m => m.is_reimbursable && !m.is_invoiced).map(m => m.id);
                        if (e.target.checked) {
                          setSelectedMileageIds(reimbursableMileageIds);
                        } else {
                          setSelectedMileageIds([]);
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Miles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mileage.map((mileageItem) => (
                  <tr key={mileageItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4">
                      {mileageItem.is_reimbursable && !mileageItem.is_invoiced && (
                        <input
                          type="checkbox"
                          checked={selectedMileageIds.includes(mileageItem.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMileageIds([...selectedMileageIds, mileageItem.id]);
                            } else {
                              setSelectedMileageIds(selectedMileageIds.filter(id => id !== mileageItem.id));
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {mileageItem.description}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {mileageItem.mileage_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(mileageItem.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {mileageItem.start_location && mileageItem.end_location ? (
                          `${mileageItem.start_location} → ${mileageItem.end_location}`
                        ) : (
                          mileageItem.start_location || mileageItem.end_location || '-'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {mileageItem.miles}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {formatCurrency(mileageItem.rate_per_mile)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {formatCurrency(mileageItem.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {mileageItem.client_name ? (
                        <div>
                          <div className="font-medium">{mileageItem.client_name}</div>
                          {mileageItem.client_company && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{mileageItem.client_company}</div>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {mileageItem.is_reimbursable && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            Reimbursable
                          </span>
                        )}
                        {mileageItem.is_invoiced && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                            Invoiced
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal('mileage', mileageItem)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(mileageItem.id, 'mileage', mileageItem.description)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={expenses.filter(e => e.is_reimbursable && !e.is_invoiced).length > 0 && selectedExpenseIds.length === expenses.filter(e => e.is_reimbursable && !e.is_invoiced).length}
                      onChange={(e) => {
                        const reimbursableExpenseIds = expenses.filter(e => e.is_reimbursable && !e.is_invoiced).map(e => e.id);
                        if (e.target.checked) {
                          setSelectedExpenseIds(reimbursableExpenseIds);
                        } else {
                          setSelectedExpenseIds([]);
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4">
                      {expense.is_reimbursable && !expense.is_invoiced && (
                        <input
                          type="checkbox"
                          checked={selectedExpenseIds.includes(expense.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedExpenseIds([...selectedExpenseIds, expense.id]);
                            } else {
                              setSelectedExpenseIds(selectedExpenseIds.filter(id => id !== expense.id));
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {expense.description}
                      </div>
                      {expense.vendor && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {expense.vendor}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {formatCurrency(expense.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {expense.category_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {expense.client_name ? (
                        <div>
                          <div className="font-medium">{expense.client_name}</div>
                          {expense.client_company && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{expense.client_company}</div>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {expense.is_tax_deductible && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                            Tax Deductible
                          </span>
                        )}
                        {expense.is_reimbursable && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            Reimbursable
                          </span>
                        )}
                        {expense.is_invoiced && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                            Invoiced
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal('expense', expense)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id, 'expense', expense.description)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Expenses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {category.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {category.expense_count || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {formatCurrency(category.total_amount || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                      }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openCategoryModal(category)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, 'category', category.name)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && renderExpenseModal()}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/50 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
                Confirm Deletion
              </h3>
              
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete{' '}
                {deleteItem.description ? (
                  <span className="font-semibold">"{deleteItem.description}"</span>
                ) : (
                  `this ${deleteItem.type || 'item'}`
                )}
                ? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteItem({ id: null, type: null, description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedExpense ? 'Edit' : 'Add'} Category
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {selectedExpense ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add to Invoice Modal */}
      {showAddToInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add {selectedItems.length} {modalType === 'expense' ? 'Expense(s)' : 'Mileage Entries'} to Invoice
              </h3>
              <button
                onClick={() => {
                  setShowAddToInvoiceModal(false);
                  setSelectedItems([]);
                  setSelectedInvoice('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Invoice
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  value={selectedInvoice}
                  onChange={(e) => setSelectedInvoice(e.target.value)}
                >
                  <option value="">Select an invoice...</option>
                  {availableInvoices.map(invoice => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number || invoice.invoiceNumber || `Invoice ${invoice.id}`} - 
                      {invoice.client_details?.name || invoice.client?.name || 'Unknown Client'}
                      {(invoice.client_details?.company_name || invoice.client?.company_name) && 
                        ` (${invoice.client_details?.company_name || invoice.client?.company_name})`
                      } - {formatCurrency(invoice.total || 0)}
                    </option>
                  ))}
                </select>
                
                {/* Auto-create invoice option when no invoices exist */}
                {showAutoCreateOption && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                          No invoices found for {autoCreateClientName}
                          {autoCreateCompanyName && ` (${autoCreateCompanyName})`}
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          Would you like to create a new draft invoice automatically?
                        </p>
                      </div>
                      <button
                        onClick={handleAutoCreateInvoice}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create Invoice
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Items to be added:
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.description}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(modalType === 'expense' ? item.total_amount : item.total_amount)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(
                        selectedItems.reduce((sum, item) => 
                          sum + (modalType === 'expense' ? item.total_amount : item.total_amount), 0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddToInvoiceModal(false);
                    setSelectedItems([]);
                    setSelectedInvoice('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToInvoice}
                  disabled={!selectedInvoice}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Add to Invoice
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Expenses;