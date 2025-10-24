import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  XCircleIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import InvoiceModal from '../components/invoices/InvoiceModal';
import InvoiceViewModal from '../components/invoices/InvoiceViewModal';
import PaymentModal from '../components/invoices/PaymentModal';
import QuickPaymentModal from '../components/invoices/QuickPaymentModal';
import InvoiceActionsModal from '../components/invoices/InvoiceActionsModal';
import TemplateSelectionModal from '../components/invoices/TemplateSelectionModal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import UpgradeModal from '../components/common/UpgradeModal';
import StripeSetupBanner from '../components/stripe/StripeSetupBanner';
import invoiceService from '../services/invoiceService';
import documentService from '../services/documentService';
import { useAuth } from '../context/AuthContext';

const Invoices = () => {
  const { user: _user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isQuickPaymentModalOpen, setIsQuickPaymentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
  const [isTemplateSelectionModalOpen, setIsTemplateSelectionModalOpen] = useState(false);
  const [actionsModalPosition, setActionsModalPosition] = useState({ x: 0, y: 0 });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [newlyCreatedInvoice, setNewlyCreatedInvoice] = useState(null);
  const [isDuplicatedInvoice, setIsDuplicatedInvoice] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [dataSource, setDataSource] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState(new Set());
  const [isExportingMultiple, setIsExportingMultiple] = useState(false);
  const [stats, setStats] = useState({});
  const [usageLimits, setUsageLimits] = useState(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchUsageLimits();
  }, [filterStatus]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus && filterStatus !== 'all') {
        params.status = filterStatus;
      }
      // Remove search from API call - we'll filter on client side

      const result = await invoiceService.getInvoices(params);
      const invoiceData = result.data || [];
      setInvoices(invoiceData);
      setDataSource(result.source);

      // Calculate stats from fetched invoices
      calculateStats(invoiceData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageLimits = async () => {
    try {
      const result = await invoiceService.getUsageLimits();
      console.log('📊 Invoice Usage Limits Response:', result);
      console.log('📊 Can add more?', result?.can_add_more);
      console.log('📊 Current usage:', result?.current_usage);
      console.log('📊 Limit:', result?.limit);
      setUsageLimits(result);
    } catch (error) {
      console.error('❌ Error fetching usage limits:', error);
    }
  };

  const calculateStats = (invoiceList) => {
    const totalRevenue = invoiceList.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const totalPaid = invoiceList.reduce((sum, inv) => sum + parseFloat(inv.amount_paid || 0), 0);
    const totalOutstanding = invoiceList.reduce((sum, inv) => sum + parseFloat(inv.balance_due || 0), 0);

    const stats = {
      total: invoiceList.length,
      paid: invoiceList.filter(inv => inv.status === 'paid').length,
      unpaid: invoiceList.filter(inv => inv.status === 'unpaid').length,
      overdue: invoiceList.filter(inv => inv.status === 'overdue').length,
      partial: invoiceList.filter(inv => inv.status === 'partial').length,
      draft: invoiceList.filter(inv => inv.status === 'draft').length,
      totalRevenue,
      totalPaid,
      totalOutstanding,
    };
    setStats(stats);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'sent':
        return <PaperAirplaneIcon className="h-5 w-5 text-blue-500" />;
      case 'partial':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'overdue':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      case 'draft':
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30';
      case 'sent':
        return 'bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30';
      case 'partial':
        return 'bg-yellow-100 dark:bg-yellow-900/20 hover:bg-yellow-200 dark:hover:bg-yellow-900/30';
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30';
      case 'cancelled':
        return 'bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800/70';
      case 'draft':
        return 'bg-slate-100 dark:bg-slate-900/20 hover:bg-slate-200 dark:hover:bg-slate-900/30';
      default:
        return 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800';
    }
  };

  const getInvoiceBalance = (invoice) => {
    if (!invoice) return 0;
    
    // Use backend calculated balance_due if available
    if (invoice.balance_due !== undefined) {
      return invoice.balance_due;
    }
    
    // Fallback calculation
    const total = invoice.total || 0;
    const amountPaid = invoice.amountPaid || invoice.amount_paid || 0;
    const status = invoice.status || 'draft';
    
    // Calculate balance based on status
    switch (status) {
      case 'paid':
        return 0; // Fully paid, no balance
      case 'partial':
        return total - amountPaid; // Remaining balance after partial payment
      case 'cancelled':
        return 0; // Cancelled invoices have no balance due
      default:
        // For draft, sent, overdue - full amount is due
        return total;
    }
  };

  const getStatusBadge = (invoice) => {
    const safeStatus = invoice.status || 'draft';
    
    const statusColors = {
      'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      'sent': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'paid': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'partial': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'overdue': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'cancelled': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
    };

    return (
      <select
        value={safeStatus}
        onChange={(e) => handleStatusChange(invoice, e.target.value)}
        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[safeStatus] || statusColors.draft}`}
      >
        <option value="draft">Draft</option>
        <option value="sent">Sent</option>
        <option value="paid">Paid</option>
        <option value="partial">Partially Paid</option>
        <option value="overdue">Overdue</option>
        <option value="cancelled">Cancelled</option>
      </select>
    );
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handlePayment = (invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentRecorded = async (_paymentData) => {
    // Refresh invoices to show updated status and amounts
    await fetchInvoices();
    toast.success('Payment recorded successfully!');
  };

  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;

    setIsDeleting(true);
    try {
      await invoiceService.deleteInvoice(invoiceToDelete._id || invoiceToDelete.id);
      await fetchInvoices();
      await fetchUsageLimits(); // Refresh usage counter
      setIsDeleteModalOpen(false);
      setInvoiceToDelete(null);
      toast.success('Invoice deleted successfully!');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendInvoice = async (invoice) => {
    try {
      const invoiceId = invoice.id || invoice._id;
      const result = await invoiceService.sendInvoice(invoiceId);
      
      if (result.success) {
        await fetchInvoices(); // Refresh the list to show updated status
        toast.success(result.message || 'Invoice sent successfully!');
      } else {
        throw new Error(result.error || 'Failed to send invoice');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error(error.message || 'Failed to send invoice. Please try again.');
    }
  };

  const handleDuplicate = async (invoice) => {
    try {
      // Check usage limits first
      if (usageLimits && !usageLimits.can_add_more) {
        setIsUpgradeModalOpen(true);
        return;
      }

      // Map items to the correct format for the backend
      const mappedItems = (invoice.items || []).map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity || 0),
        unit_price: parseFloat(item.unit_price || item.rate || 0),
      }));

      const newInvoiceData = {
        client: invoice.client?.id || invoice.client_details?.id || invoice.client || invoice._id,
        title: `${invoice.title || 'Invoice'} (Copy)`,
        description: invoice.description || '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: mappedItems,
        notes: invoice.notes || '',
        terms: invoice.terms || '',
        tax_rate: parseFloat(invoice.tax_rate || invoice.tax || 0),
        status: 'draft',
      };

      console.log('🔄 Duplicating invoice with data:', newInvoiceData);
      const result = await invoiceService.createInvoice(newInvoiceData);
      console.log('📊 Duplicate result:', result);

      if (result.success) {
        const duplicatedInvoice = result.data;
        await fetchInvoices();
        await fetchUsageLimits(); // Refresh usage counter
        toast.success('Invoice duplicated successfully!');

        // Show template selection modal for the duplicated invoice
        setNewlyCreatedInvoice(duplicatedInvoice);
        setIsDuplicatedInvoice(true);
        setIsTemplateSelectionModalOpen(true);
      } else {
        // Check if it's a subscription limit error
        if (result.error && result.error.includes('limit')) {
          setIsUpgradeModalOpen(true);
        } else {
          throw new Error(result.error || 'Failed to duplicate invoice');
        }
      }
    } catch (error) {
      console.error('❌ Error duplicating invoice:', error);
      console.error('Error details:', error.response?.data || error.message);

      // Check if it's a 403 subscription error
      if (error.response?.status === 403) {
        setIsUpgradeModalOpen(true);
      } else {
        toast.error(error.response?.data?.error || error.message || 'Failed to duplicate invoice. Please try again.');
      }
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const result = await invoiceService.exportInvoicesPDF();
      if (result.success) {
        toast.success(result.message || 'PDF report exported successfully!');
      } else {
        throw new Error(result.error || 'Failed to export PDF report');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPDF = async (invoice) => {
    try {
      const invoiceId = invoice.id || invoice._id;
      // Use the selected template if available, otherwise use default
      const templateId = invoice.selected_template || null;
      await documentService.downloadInvoicePDF(invoiceId, templateId, `invoice-${invoice.invoice_number}.pdf`);
      toast.success('Invoice PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error(error.message || 'Failed to download PDF. Please try again.');
    }
  };

  const handleStatusChange = async (invoice, newStatus) => {
    try {
      // If changing to partial, open payment modal
      if (newStatus === 'partial') {
        setSelectedInvoice(invoice);
        setPendingStatusChange(newStatus);
        setIsQuickPaymentModalOpen(true);
      } else if (newStatus === 'paid') {
        // If changing to paid, open payment modal to record full payment
        setSelectedInvoice(invoice);
        setPendingStatusChange(newStatus);
        setIsQuickPaymentModalOpen(true);
      } else {
        // Regular status change (draft, sent, overdue, cancelled)
        const result = await invoiceService.updateInvoice(invoice.id, { status: newStatus });
        if (result.success) {
          toast.success(`Invoice status updated to ${newStatus}`);
          await fetchInvoices();
        } else {
          toast.error('Error updating invoice status: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating invoice status');
    }
  };

  const handleQuickPaymentRecorded = async () => {
    // Refresh invoices after payment is recorded
    await fetchInvoices();
    setIsQuickPaymentModalOpen(false);
    setSelectedInvoice(null);
    setPendingStatusChange(null);
  };

  const handleSelectInvoice = (invoiceId, checked) => {
    const newSelected = new Set(selectedInvoices);
    if (checked) {
      newSelected.add(invoiceId);
    } else {
      newSelected.delete(invoiceId);
    }
    setSelectedInvoices(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = new Set(filteredInvoices.map(invoice => invoice.id));
      setSelectedInvoices(allIds);
    } else {
      setSelectedInvoices(new Set());
    }
  };

  const handleBulkExportPDF = async () => {
    if (selectedInvoices.size === 0) {
      toast.error('Please select at least one invoice to export');
      return;
    }

    setIsExportingMultiple(true);
    try {
      const result = await invoiceService.exportMultipleInvoicesPDF(Array.from(selectedInvoices));
      if (result.success) {
        toast.success(result.message);
        setSelectedInvoices(new Set()); // Clear selection after export
      } else {
        toast.error(result.error || 'Failed to export multiple invoices');
      }
    } catch (error) {
      console.error('Error exporting multiple invoices:', error);
      toast.error('Failed to export multiple invoices. Please try again.');
    } finally {
      setIsExportingMultiple(false);
    }
  };

  const filteredInvoices = (invoices || []).filter(invoice => {
    if (!invoice) return false;
    
    const clientName = invoice.client?.name || '';
    const invoiceNumber = invoice.invoiceNumber || invoice.invoice_number || '';
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = invoiceNumber.toLowerCase().includes(searchTermLower) ||
                         clientName.toLowerCase().includes(searchTermLower);
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-600 dark:text-gray-400">
              Manage and track all your invoices
            </p>
            {dataSource && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                dataSource === 'api' 
                  ? '' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {dataSource === 'api' ? '' : '🟡 Demo Mode'}
              </span>
            )}
          </div>
        </motion.div>
        <div className="flex flex-col items-end gap-2">
          {usageLimits && usageLimits.is_free_tier && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {usageLimits.current_usage} / {usageLimits.limit} invoices used
            </span>
          )}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (usageLimits && !usageLimits.can_add_more) {
                setIsUpgradeModalOpen(true);
                return;
              }
              setSelectedInvoice(null);
              setIsModalOpen(true);
            }}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              usageLimits && !usageLimits.can_add_more
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/50'
                : 'btn-primary'
            }`}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {usageLimits && !usageLimits.can_add_more ? 'Upgrade to Add More' : 'New Invoice'}
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total || 0}
              </p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-primary-500" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.paid || 0}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.unpaid || 0}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${(stats.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>
      </div>

      {/* Stripe Setup Banner (Compact) */}
      <StripeSetupBanner compact />

      {/* Filters and Search */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="partial">Partially Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="status">Status</option>
            <option value="client">Client</option>
          </select>

          {/* Export Button */}
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedInvoices.size > 0 && (
        <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedInvoices.size} invoice{selectedInvoices.size > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedInvoices(new Set())}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                Clear selection
              </button>
            </div>
            <button
              onClick={handleBulkExportPDF}
              disabled={isExportingMultiple}
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              {isExportingMultiple ? 'Exporting...' : 'Export Selected PDFs'}
            </button>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.size > 0 && selectedInvoices.size === filteredInvoices.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredInvoices.map((invoice, index) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${getStatusBackgroundColor(invoice.status || 'draft')} transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.has(invoice.id)}
                        onChange={(e) => handleSelectInvoice(invoice.id, e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap ">
                      <div className="flex items-center">
                        {getStatusIcon(invoice.status || 'draft')}
                        <select
                          value={invoice.status || 'draft'}
                          onChange={(e) => handleStatusChange(invoice, e.target.value)}
                          className="ml-2 text-xs font-medium border-0 bg-transparent focus:ring-0 focus:outline-none text-gray-900 dark:text-white cursor-pointer border-r-2 border-purple-600 dark:border-purple-700 rounded-full px-2 py-1"
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="paid">Paid</option>
                          <option value="partial">Partially Paid</option>
                          <option value="overdue">Overdue</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.invoiceNumber || invoice.invoice_number || 'No number'}
                      </div>
                     
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {invoice.client?.name || 'Unknown Client'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {invoice.client?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 
                       invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() :
                       invoice.date ? new Date(invoice.date).toLocaleDateString() : 'No date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 
                       invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${(invoice.total || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        getInvoiceBalance(invoice) > 0 
                          ? 'text-orange-600 dark:text-orange-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        ${getInvoiceBalance(invoice).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const modalWidth = 300; // Approximate modal width
                          const modalHeight = 350; // Approximate modal height
                          const padding = 10;
                          
                          // Smart horizontal positioning
                          let x = rect.right - modalWidth - padding;
                          if (x < padding) {
                            // If modal would go off left edge, position to the right
                            x = rect.left + padding;
                          }
                          
                          // Smart vertical positioning
                          let y = rect.bottom + padding;
                          if (y + modalHeight > window.innerHeight - padding) {
                            // If modal would go off bottom, position above
                            y = rect.top - modalHeight - padding;
                          }
                          
                          setActionsModalPosition({ x, y });
                          setSelectedInvoice(invoice);
                          setIsActionsModalOpen(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        title="Invoice Actions"
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-1" />
                        Actions
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onSave={async (invoiceData) => {
          try {
            // Remove invoice_number if empty to allow backend auto-generation
            const cleanedData = { ...invoiceData };
            if (!cleanedData.invoice_number || cleanedData.invoice_number.trim() === '') {
              delete cleanedData.invoice_number;
            }

            let savedInvoice;
            if (selectedInvoice) {
              // Update existing invoice
              savedInvoice = await invoiceService.updateInvoice(selectedInvoice._id || selectedInvoice.id, cleanedData);
            } else {
              // Add new invoice
              const result = await invoiceService.createInvoice(cleanedData);
              savedInvoice = result.success ? result.data : result;

              // For new invoices, show template selection modal instead of success message
              setNewlyCreatedInvoice(savedInvoice);
              setIsModalOpen(false);
              setSelectedInvoice(null);

              // Mark expenses and mileage as invoiced before showing template modal
              if (invoiceData._expenseIds && invoiceData._expenseIds.length > 0) {
                try {
                  const { default: expenseService } = await import('../services/expenseService');
                  await expenseService.addExpensesToInvoice(savedInvoice.id, invoiceData._expenseIds);
                  console.log('Marked expenses as invoiced:', invoiceData._expenseIds);
                } catch (expenseError) {
                  console.error('Error marking expenses as invoiced:', expenseError);
                }
              }

              if (invoiceData._mileageIds && invoiceData._mileageIds.length > 0) {
                try {
                  const { default: expenseService } = await import('../services/expenseService');
                  await expenseService.addMileageToInvoice(savedInvoice.id, invoiceData._mileageIds);
                  console.log('Marked mileage as invoiced:', invoiceData._mileageIds);
                } catch (mileageError) {
                  console.error('Error marking mileage as invoiced:', mileageError);
                }
              }

              await fetchInvoices();
              await fetchUsageLimits(); // Refresh usage counter
              setIsTemplateSelectionModalOpen(true);
              return; // Exit early - don't show success toast yet
            }

            // For updates only: Mark expenses and mileage as invoiced if they were added during editing
            if (invoiceData._expenseIds && invoiceData._expenseIds.length > 0) {
              try {
                const { default: expenseService } = await import('../services/expenseService');
                await expenseService.addExpensesToInvoice(savedInvoice.id, invoiceData._expenseIds);
                console.log('Marked expenses as invoiced:', invoiceData._expenseIds);
              } catch (expenseError) {
                console.error('Error marking expenses as invoiced:', expenseError);
                // Don't fail the whole operation, just warn
                toast.warning('Invoice created but failed to mark some expenses as invoiced');
              }
            }
            
            if (invoiceData._mileageIds && invoiceData._mileageIds.length > 0) {
              try {
                const { default: expenseService } = await import('../services/expenseService');
                await expenseService.addMileageToInvoice(savedInvoice.id, invoiceData._mileageIds);
                console.log('Marked mileage as invoiced:', invoiceData._mileageIds);
              } catch (mileageError) {
                console.error('Error marking mileage as invoiced:', mileageError);
                // Don't fail the whole operation, just warn
                toast.warning('Invoice created but failed to mark some mileage as invoiced');
              }
            }
            
            await fetchInvoices();
            setIsModalOpen(false);
            setSelectedInvoice(null);
            toast.success(selectedInvoice ? 'Invoice updated successfully!' : 'Invoice created successfully!');
          } catch (error) {
            console.error('Error saving invoice:', error);
            toast.error('Failed to save invoice. Please try again.');
          }
        }}
      />

      {/* Invoice View Modal */}
      <InvoiceViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onEdit={(invoice) => {
          setIsViewModalOpen(false);
          setSelectedInvoice(invoice);
          setIsModalOpen(true);
        }}
        onDuplicate={handleDuplicate}
        onSend={handleSendInvoice}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onPaymentRecorded={handlePaymentRecorded}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setInvoiceToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        itemName={invoiceToDelete ? `${invoiceToDelete.invoiceNumber || 'Invoice'} - ${invoiceToDelete.client?.name || 'Unknown Client'}` : ""}
        confirmText="Delete Invoice"
        isLoading={isDeleting}
        isDangerous={true}
      />

      {/* Quick Payment Modal for Status Change */}
      <QuickPaymentModal
        isOpen={isQuickPaymentModalOpen}
        onClose={() => {
          setIsQuickPaymentModalOpen(false);
          setSelectedInvoice(null);
          setPendingStatusChange(null);
        }}
        invoice={selectedInvoice}
        pendingStatusChange={pendingStatusChange}
        onPaymentRecorded={handleQuickPaymentRecorded}
      />

      {/* Template Selection Modal - Appears after creating new invoice */}
      <TemplateSelectionModal
        isOpen={isTemplateSelectionModalOpen}
        onClose={async () => {
          setIsTemplateSelectionModalOpen(false);
          const wasDuplicated = isDuplicatedInvoice;
          setNewlyCreatedInvoice(null);
          setIsDuplicatedInvoice(false);
          await fetchInvoices(); // Refresh to get latest data
          toast.success(wasDuplicated ? 'Invoice duplicated successfully!' : 'Invoice created successfully!');
        }}
        invoice={newlyCreatedInvoice}
      />

      {/* Invoice Actions Modal */}
      <InvoiceActionsModal
        isOpen={isActionsModalOpen}
        onClose={() => {
          setIsActionsModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        position={actionsModalPosition}
        onView={handleViewInvoice}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onDuplicate={handleDuplicate}
        onSend={handleSendInvoice}
        onDownloadPDF={handleDownloadPDF}
        onRecordPayment={handlePayment}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
};

export default Invoices;