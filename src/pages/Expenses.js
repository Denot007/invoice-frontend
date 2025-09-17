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
  EyeIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import expenseService from '../services/expenseService';
import invoiceService from '../services/invoiceService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'react-toastify';

// Receipt Upload Modal Component
const ReceiptUploadModal = ({ onClose, onReceiptScanned, scanning, setIsScanning: setParentScanning }) => {
  const [dragActive, setDragActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleReceiptScan = async (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload JPG, PNG, or PDF files only.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setParentScanning(true);

    try {
      const result = await expenseService.scanReceipt(file);
      console.log('Full scan result:', result);
      setScanResult(result);
      toast.success('Receipt scanned successfully!');
      // Don't auto-close, let user see the debug info first
    } catch (error) {
      console.error('Receipt scanning error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to scan receipt. Please try again.';
      toast.error(errorMessage);
      setParentScanning(false);
    }
  };

  const handleTextExtraction = async (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload JPG, PNG, or PDF files only.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setParentScanning(true);

    try {
      const result = await expenseService.extractText(file);
      console.log('Text extraction result:', result);
      // Create a mock scan result with just the extracted text for display
      setScanResult({
        ...result,
        debug: {
          extracted_text: result.extracted_text,
          file_type: result.file_type,
          text_length: result.text_length,
          pages_processed: result.pages_processed,
          success: result.success
        }
      });
      toast.success('Text extracted successfully!');
    } catch (error) {
      console.error('Text extraction error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to extract text. Please try again.';
      toast.error(errorMessage);
      setParentScanning(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];

      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload JPG, PNG, or PDF files only.');
        return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error('File too large. Maximum size is 10MB.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload JPG, PNG, or PDF files only.');
        return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error('File too large. Maximum size is 10MB.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUseResult = () => {
    if (scanResult) {
      onReceiptScanned(scanResult);
      onClose();
    }
  };

  const handleRetry = () => {
    setScanResult(null);
    setSelectedFile(null);
    setParentScanning(false);
    setShowDebug(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full mx-4 ${scanResult ? 'max-w-4xl' : 'max-w-md'}`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {scanResult ? 'Receipt Scan Results' : 'Upload Receipt'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {scanResult ? (
            // Show scan results and debug information
            <div className="space-y-6">
              {/* Success message */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    Receipt scanned successfully! Confidence: {scanResult.confidence}
                  </p>
                </div>
              </div>

              {/* Extracted Data Preview */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Extracted Data:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Vendor:</span> {scanResult.vendor}</div>
                  <div><span className="font-medium">Amount:</span> ${scanResult.amount}</div>
                  <div><span className="font-medium">Date:</span> {scanResult.expense_date}</div>
                  <div><span className="font-medium">Category:</span> {scanResult.category_name || 'None'}</div>
                  <div className="col-span-2"><span className="font-medium">Description:</span> {scanResult.description}</div>
                  {scanResult.location && <div className="col-span-2"><span className="font-medium">Location:</span> {scanResult.location}</div>}
                </div>
              </div>

              {/* Debug Information Toggle */}
              <div>
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  {showDebug ? 'Hide' : 'Show'} Debug Information
                </button>
              </div>

              {/* Debug Information */}
              {showDebug && scanResult.debug && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">File Type: {scanResult.debug.file_type}</h5>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Model Used: {scanResult.debug.model_used}</h5>
                  </div>

                  {scanResult.debug.extracted_text !== 'N/A (Image file)' && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Extracted Text:</h5>
                      <pre className="bg-white dark:bg-gray-900 p-3 rounded border text-xs overflow-auto max-h-32">
                        {scanResult.debug.extracted_text}
                      </pre>
                    </div>
                  )}

                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Raw Grok Response:</h5>
                    <pre className="bg-white dark:bg-gray-900 p-3 rounded border text-xs overflow-auto max-h-32">
                      {scanResult.debug.grok_raw_response}
                    </pre>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Parsed JSON Data:</h5>
                    <pre className="bg-white dark:bg-gray-900 p-3 rounded border text-xs overflow-auto max-h-32">
                      {JSON.stringify(scanResult.debug.grok_parsed_data, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Available Categories:</h5>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {scanResult.debug.available_categories?.join(', ')}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Retry
                </button>
                <button
                  onClick={handleUseResult}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Use This Data
                </button>
              </div>
            </div>
          ) : selectedFile ? (
            // Show file actions
            <div className="space-y-6">
              {/* File info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Selected File:</h4>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Name:</span> {selectedFile.name}</div>
                  <div><span className="font-medium">Type:</span> {selectedFile.type}</div>
                  <div><span className="font-medium">Size:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              </div>

              {/* Action buttons */}
              {scanning ? (
                <div className="flex flex-col items-center py-8">
                  <svg className="animate-spin h-8 w-8 text-purple-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-purple-600 font-medium">Processing...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This may take a few moments</p>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => handleReceiptScan(selectedFile)}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    🤖 Scan with AI (Full Processing)
                  </button>
                  <button
                    onClick={() => handleTextExtraction(selectedFile)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    📄 Extract Text Only (Debug)
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="w-full px-4 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    ↺ Choose Different File
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Show upload interface
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Drop your receipt here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  or click to browse files
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                    Select File
                  </button>
                  <div className="text-xs text-gray-400">
                    Or drag and drop files here
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Supports JPG, PNG, and PDF files (max 10MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

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
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [scannedData, setScannedData] = useState(null);
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
  const [isScanning, setIsScanning] = useState(false);

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

  const handleScanReceipt = async () => {
    if (!expenseForm.receipt_file) {
      toast.error('Please select a receipt file first');
      return;
    }

    setIsScanning(true);
    try {
      const scannedData = await expenseService.scanReceipt(expenseForm.receipt_file);

      // Check if expense was automatically created
      if (scannedData.expense_created) {
        // Expense was automatically created - show success and refresh data
        const confidenceColor = {
          'High': 'text-green-600',
          'Medium': 'text-yellow-600',
          'Low': 'text-red-600'
        }[scannedData.confidence] || 'text-gray-600';

        toast.success(
          <div>
            <p className="font-semibold">Expense automatically created!</p>
            <p className="text-sm">Vendor: {scannedData.vendor}</p>
            <p className="text-sm">Amount: ${scannedData.amount}</p>
            <p className={`text-sm ${confidenceColor}`}>
              AI Confidence: {scannedData.confidence}
            </p>
          </div>,
          { autoClose: 6000 }
        );

        // Close the modal and refresh the data
        setShowModal(false);
        resetForm();
        await loadData();

      } else {
        // Expense creation failed or was disabled - populate form for manual creation
        setExpenseForm(prev => ({
          ...prev,
          vendor: scannedData.vendor || prev.vendor,
          amount: scannedData.amount || prev.amount,
          expense_date: scannedData.expense_date || prev.expense_date,
          description: scannedData.description || prev.description,
          location: scannedData.location || prev.location,
          tax_amount: scannedData.tax_amount || prev.tax_amount,
          payment_method: scannedData.payment_method || prev.payment_method,
          reference_number: scannedData.reference_number || prev.reference_number,
          category: scannedData.category_id || prev.category,
        }));

        // Show appropriate message based on whether it was an error or just populated data
        const confidenceColor = {
          'High': 'text-green-600',
          'Medium': 'text-yellow-600',
          'Low': 'text-red-600'
        }[scannedData.confidence] || 'text-gray-600';

        if (scannedData.success === false && scannedData.error_details) {
          // There was an error creating the expense - show warning
          toast.warning(
            <div>
              <p className="font-semibold">Data extracted but expense creation failed</p>
              <p className="text-xs text-gray-600 mt-1">{scannedData.message}</p>
              <p className={`text-sm ${confidenceColor} mt-1`}>
                Confidence: {scannedData.confidence}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Please review the data and save manually.
              </p>
            </div>,
            { autoClose: 7000 }
          );
        } else {
          // Normal extraction for manual creation
          toast.success(
            <div>
              <p>Receipt scanned successfully!</p>
              <p className={`text-sm ${confidenceColor}`}>
                Confidence: {scannedData.confidence}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Please review the extracted data before saving.
              </p>
            </div>,
            { autoClose: 5000 }
          );
        }
      }

      // Store scan result for debug display
      setScanResult(scannedData);

    } catch (error) {
      console.error('Receipt scanning error:', error);

      // Check if it's a timeout error
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.warning(
          <div>
            <p className="font-semibold">Scan may be taking longer than expected</p>
            <p className="text-sm">The receipt is still being processed. Please check your expenses list in a moment.</p>
            <p className="text-xs text-gray-500 mt-1">If the expense appears, the scan was successful.</p>
          </div>,
          { autoClose: 8000 }
        );
      } else {
        // Regular error handling
        toast.error(
          error.response?.data?.error ||
          'Failed to scan receipt. Please check the file and try again.'
        );
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleDirectAIScan = () => {
    // Trigger file input for direct upload
    document.getElementById('direct-upload-input').click();
  };

  const handleDirectFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload JPG, PNG, or PDF files only.');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setIsScanning(true);

    try {
      const result = await expenseService.autoCreateFromScan(file);

      // Check if expense was automatically created
      if (result.expense_created) {
        // Create category action message
        const getCategoryMessage = () => {
          if (!result.category_name) return null;

          switch (result.category_action) {
            case 'exact_match':
              return `Category: ${result.category_name} (matched existing)`;
            case 'partial_match':
              return `Category: ${result.category_name} (similar match found)`;
            case 'created':
              return `Category: ${result.category_name} (newly created)`;
            default:
              return `Category: ${result.category_name}`;
          }
        };

        toast.success(
          <div>
            <p className="font-semibold">Expense Created Successfully!</p>
            <p className="text-sm">{result.description}</p>
            <p className="text-sm">Vendor: {result.vendor}</p>
            <p className="text-sm">Amount: ${result.amount}</p>
            {result.category_name && (
              <p className="text-sm text-blue-600">{getCategoryMessage()}</p>
            )}
            <p className="text-sm text-green-600">AI Confidence: {result.confidence}</p>
          </div>,
          { autoClose: 8000 }
        );

        // Refresh the data to show the new expense
        await loadData();
      } else {
        // Fallback to modal if auto-creation failed
        toast.warning('Auto-creation failed. Opening manual entry...');
        setShowReceiptModal(true);
      }
    } catch (error) {
      console.error('Direct upload error:', error);

      // Check if it's a timeout error
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.warning(
          <div>
            <p className="font-semibold">⏳ Processing in progress...</p>
            <p className="text-sm">Your receipt is still being processed. Check your expenses in a moment!</p>
            <p className="text-xs text-gray-500 mt-1">The expense may appear shortly even if this times out.</p>
          </div>,
          { autoClose: 8000 }
        );
        // Still refresh data in case it was created
        setTimeout(() => loadData(), 5000);
      } else {
        toast.error(
          error.response?.data?.error ||
          'Failed to process receipt. Please try again.'
        );
      }
    } finally {
      setIsScanning(false);
      // Clear the input
      event.target.value = '';
    }
  };

  const handleDirectScanFile = async (file) => {
    if (!file) return;

    // Open expense modal with scan functionality
    setModalType('expense');
    setSelectedExpense(null);
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
      receipt_file: file,
      notes: '',
    });
    setShowModal(true);

    // Start scanning automatically
    setIsScanning(true);
    try {
      const scannedData = await expenseService.scanReceipt(file);

      // Update form with scanned data
      setExpenseForm(prev => ({
        ...prev,
        vendor: scannedData.vendor || prev.vendor,
        amount: scannedData.amount || prev.amount,
        expense_date: scannedData.expense_date || prev.expense_date,
        description: scannedData.description || prev.description,
        location: scannedData.location || prev.location,
        tax_amount: scannedData.tax_amount || prev.tax_amount,
        payment_method: scannedData.payment_method || prev.payment_method,
        reference_number: scannedData.reference_number || prev.reference_number,
        category: scannedData.category_id || prev.category,
      }));

      // Show confidence level to user
      const confidenceColor = {
        'High': 'text-green-600',
        'Medium': 'text-yellow-600',
        'Low': 'text-red-600'
      }[scannedData.confidence] || 'text-gray-600';

      toast.success(
        <div>
          <p>Receipt scanned successfully!</p>
          <p className={`text-sm ${confidenceColor}`}>
            Confidence: {scannedData.confidence}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Please review the extracted data before saving.
          </p>
        </div>,
        { autoClose: 5000 }
      );

    } catch (error) {
      console.error('Receipt scanning error:', error);
      toast.error(
        error.response?.data?.error ||
        'Failed to scan receipt. Please check the file and try again.'
      );
    } finally {
      setIsScanning(false);
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
      uploaded_file: null,
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

  const openModal = (type, item = null, scannedData = null) => {
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
    } else if (scannedData) {
      // Pre-fill form with scanned receipt data
      if (type === 'expense') {
        setExpenseForm({
          vendor: scannedData.vendor || '',
          amount: scannedData.amount || '',
          expense_date: scannedData.expense_date || new Date().toISOString().split('T')[0],
          description: scannedData.description || '',
          location: scannedData.location || '',
          tax_amount: scannedData.tax_amount || '0.00',
          payment_method: scannedData.payment_method || 'other',
          reference_number: scannedData.reference_number || '',
          category: scannedData.category_id || '',
          client: '',
          is_reimbursable: false,
          is_tax_deductible: true,
          notes: `Auto-scanned receipt (Confidence: ${scannedData.confidence || 'Medium'})`,
          receipt_file: null,
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
                {/* AI Receipt Scan Section */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg mr-3">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">AI Receipt Scanner</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Let AI extract expense details from your receipt automatically
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => document.getElementById('receipt-upload').click()}
                      disabled={isScanning}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      {isScanning ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Scanning with AI...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Scan with AI
                        </>
                      )}
                    </button>
                  </div>

                  {/* Hidden file input */}
                  <input
                    id="receipt-upload"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      console.log('Selected file:', file);
                      setForm({ ...form, receipt_file: file });
                      // Auto-scan when file is selected
                      if (file) {
                        setTimeout(() => {
                          handleScanReceipt();
                        }, 100);
                      }
                    }}
                  />

                  {form.receipt_file && (
                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <DocumentArrowUpIcon className="h-4 w-4 mr-2 text-purple-600" />
                        Uploaded: {form.receipt_file.name} ({(form.receipt_file.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional File (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => document.getElementById('additional-file-upload').click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                    Upload Additional File
                  </button>

                  {/* Hidden file input */}
                  <input
                    id="additional-file-upload"
                    type="file"
                    accept="*/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setForm({ ...form, uploaded_file: file });
                    }}
                  />

                  {form.uploaded_file && (
                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <DocumentArrowUpIcon className="h-4 w-4 mr-2 text-gray-600" />
                          Uploaded: {form.uploaded_file.name} ({(form.uploaded_file.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, uploaded_file: null })}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>

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
            onClick={handleDirectAIScan}
            disabled={isScanning}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 shadow-lg"
          >
            {isScanning ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scanning...
              </>
            ) : (
              <>
                <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                Upload Receipt
              </>
            )}
          </button>
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

      {/* Hidden file input for direct upload */}
      <input
        type="file"
        id="direct-upload-input"
        accept="image/*,.pdf"
        style={{ display: 'none' }}
        onChange={handleDirectFileUpload}
      />

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
                        {(expense.receipt_url || expense.uploaded_file_url) && (
                          <div className="flex space-x-1">
                            {expense.receipt_url && (
                              <button
                                onClick={() => window.open(expense.receipt_url, '_blank')}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1"
                                title="View Receipt"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            )}
                            {expense.uploaded_file_url && (
                              <button
                                onClick={() => window.open(expense.uploaded_file_url, '_blank')}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                title="View Attachment"
                              >
                                <PaperClipIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
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

      {/* Hidden file input for direct AI scan */}
      <input
        id="direct-ai-scan-input"
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            handleDirectScanFile(file);
          }
        }}
      />

      {/* Receipt Upload Modal */}
      {showReceiptModal && (
        <ReceiptUploadModal
          onClose={() => {
            setShowReceiptModal(false);
            setScannedData(null);
            setIsScanning(false);
          }}
          onReceiptScanned={(data) => {
            setScannedData(data);
            // Optionally auto-open expense modal with scanned data
            openModal('expense', null, data);
            setShowReceiptModal(false);
          }}
          scanning={isScanning}
          setIsScanning={setIsScanning}
        />
      )}
    </div>
  );
};

export default Expenses;