import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ArchiveBoxIcon,
  ArchiveBoxArrowDownIcon,

  EyeIcon,
} from '@heroicons/react/24/outline';
import ClientModal from '../components/clients/ClientModal';
import ClientDetailsModal from '../components/clients/ClientDetailsModal';
import ClientInvoicesModal from '../components/clients/ClientInvoicesModal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import InvoiceModal from '../components/invoices/InvoiceModal';
import InvoiceViewModal from '../components/invoices/InvoiceViewModal';
import clientService from '../services/clientService';
import invoiceService from '../services/invoiceService';
// import { useAuth } from '../context/AuthContext';

const Clients = () => {
  // const { user } = useAuth();
  const [allClients, setAllClients] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dataSource, setDataSource] = useState(null);
  const [stats, setStats] = useState({});
  const [clientInvoiceStats, setClientInvoiceStats] = useState({});
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [clientToView, setClientToView] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Invoice modal states
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedClientForInvoice, setSelectedClientForInvoice] = useState(null);
  
  // Client invoices modal states
  const [isClientInvoicesModalOpen, setIsClientInvoicesModalOpen] = useState(false);
  const [clientForInvoicesView, setClientForInvoicesView] = useState(null);
  const [clientInvoicesRefreshTrigger, setClientInvoicesRefreshTrigger] = useState(0);
  
  // Invoice view modal states
  const [isInvoiceViewModalOpen, setIsInvoiceViewModalOpen] = useState(false);
  const [invoiceToView, setInvoiceToView] = useState(null);

  // Fetch all clients (no search/filter parameters)
  const fetchClients = async () => {
    setLoading(true);
    try {
      const result = await clientService.getClients();
      setAllClients(result.data || []);
      setDataSource(result.source);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setAllClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchClients();
    fetchClientInvoiceStats();
  }, []);

  // Calculate stats whenever allClients changes
  useEffect(() => {
    if (allClients.length > 0) {
      calculateStats(allClients);
    }
  }, [allClients]);

  // Client-side filtering
  useEffect(() => {
    let filteredClients = [...allClients];

    // Apply status filter
    if (filterStatus && filterStatus !== 'all') {
      filteredClients = filteredClients.filter(client => client.status === filterStatus);
    }

    // Apply type filter
    if (filterType && filterType !== 'all') {
      filteredClients = filteredClients.filter(client => client.client_type === filterType);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredClients = filteredClients.filter(client =>
        client.name?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.company_name?.toLowerCase().includes(searchLower) ||
        client.phone?.toLowerCase().includes(searchLower)
      );
    }

    setClients(filteredClients);
  }, [allClients, filterStatus, filterType, searchTerm]);


  const calculateStats = (clientList) => {
    const stats = {
      total: clientList.length,
      active: clientList.filter(c => c.status === 'active').length,
      inactive: clientList.filter(c => c.status === 'inactive').length,
      blocked: clientList.filter(c => c.status === 'blocked').length,
      business: clientList.filter(c => c.client_type === 'business').length,
      individual: clientList.filter(c => c.client_type === 'individual').length,
    };
    setStats(stats);
  };

  const fetchClientInvoiceStats = async () => {
    try {
      // Fetch all invoices to calculate client statistics
      const invoicesResult = await invoiceService.getInvoices();
      if (invoicesResult.success && invoicesResult.data) {
        const invoicesByClient = {};
        
        // Group invoices by client
        invoicesResult.data.forEach(invoice => {
          const clientId = invoice.client?.id || invoice.client_details?.id || invoice.client;
          if (clientId) {
            if (!invoicesByClient[clientId]) {
              invoicesByClient[clientId] = {
                totalInvoices: 0,
                totalPaid: 0,
                totalDue: 0,
                totalRevenue: 0
              };
            }
            
            const invoiceTotal = parseFloat(invoice.total || 0);
            const amountPaid = parseFloat(invoice.amountPaid || 0);
            const balanceDue = parseFloat(invoice.amountDue || invoice.balance_due || 0);
            
            invoicesByClient[clientId].totalInvoices += 1;
            invoicesByClient[clientId].totalRevenue += invoiceTotal;
            
            // Calculate paid amount based on status
            if (invoice.status === 'paid') {
              invoicesByClient[clientId].totalPaid += invoiceTotal;
            } else if (invoice.status === 'partial') {
              invoicesByClient[clientId].totalPaid += amountPaid;
              invoicesByClient[clientId].totalDue += balanceDue;
            } else if (['sent', 'overdue'].includes(invoice.status)) {
              invoicesByClient[clientId].totalDue += invoiceTotal;
            }
          }
        });
        
        setClientInvoiceStats(invoicesByClient);
      }
    } catch (error) {
      console.error('Error fetching client invoice stats:', error);
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleView = (client) => {
    setClientToView(client);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    
    setIsDeleting(true);
    try {
      await clientService.deleteClient(clientToDelete._id || clientToDelete.id);
      await fetchClients();
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
      toast.success('Client deleted successfully!');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveToggle = async (client) => {
    try {
      await clientService.toggleClientArchive(client._id || client.id);
      await fetchClients();
    } catch (error) {
      console.error('Error archiving client:', error);
      toast.error('Failed to archive client. Please try again.');
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const result = await clientService.exportClientsPDF();
      if (result.success) {
        toast.success(result.message || 'Client directory PDF exported successfully!');
      } else {
        throw new Error(result.error || 'Failed to export client directory PDF');
      }
    } catch (error) {
      console.error('Error exporting clients PDF:', error);
      toast.error('Failed to export client directory PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleNewInvoice = (client) => {
    setSelectedClientForInvoice(client);
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceModalClose = () => {
    setIsInvoiceModalOpen(false);
    setSelectedClientForInvoice(null);
    setInvoiceToView(null);
  };

  const handleInvoiceSave = async (invoiceData, invoiceId = null) => {
    try {
      let result;
      if (invoiceId) {
        // Update existing invoice
        result = await invoiceService.updateInvoice(invoiceId, invoiceData);
        if (result.success) {
          toast.success('Invoice updated successfully!');
        } else {
          throw new Error(result.error || 'Failed to update invoice');
        }
      } else {
        // Create new invoice
        result = await invoiceService.createInvoice(invoiceData);
        if (result.success) {
          toast.success('Invoice created successfully!');
        } else {
          throw new Error(result.error || 'Failed to create invoice');
        }
      }
      
      handleInvoiceModalClose();
      
      // If we were editing from client invoices modal, trigger a refresh
      if (invoiceId && clientForInvoicesView) {
        setClientInvoicesRefreshTrigger(prev => prev + 1);
        setIsClientInvoicesModalOpen(true);
      }
      
      // Refresh client invoice stats
      fetchClientInvoiceStats();
    } catch (error) {
      console.error('Error saving invoice:', error);
      const action = invoiceId ? 'update' : 'create';
      toast.error(`Failed to ${action} invoice. Please try again.`);
    }
  };

  const handleViewInvoices = (client) => {
    setClientForInvoicesView(client);
    setIsClientInvoicesModalOpen(true);
  };

  const handleCloseClientInvoicesModal = () => {
    setIsClientInvoicesModalOpen(false);
    setClientForInvoicesView(null);
  };

  const handleViewInvoice = (invoice) => {
    setInvoiceToView(invoice);
    setIsInvoiceViewModalOpen(true);
  };

  const handleEditInvoice = (invoice) => {
    // Close client invoices modal and open invoice edit modal
    setIsClientInvoicesModalOpen(false);
    setSelectedClientForInvoice(clientForInvoicesView);
    setInvoiceToView(invoice); // This will be used as the invoice to edit
    setIsInvoiceModalOpen(true);
  };

  const handleDuplicateInvoice = async (invoice) => {
    try {
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
      
      const result = await invoiceService.createInvoice(newInvoiceData);
      if (result.success) {
        toast.success('Invoice duplicated successfully!');
        // Refresh client invoice stats
        fetchClientInvoiceStats();
      } else {
        throw new Error(result.error || 'Failed to duplicate invoice');
      }
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      toast.error('Failed to duplicate invoice. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusClasses = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    if (!type) return null;
    
    const typeClasses = {
      company: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      business: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      individual: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    };

    const typeIcons = {
      company: <BuildingOfficeIcon className="h-3 w-3 mr-1" />,
      business: <BuildingOfficeIcon className="h-3 w-3 mr-1" />,
      individual: <UserGroupIcon className="h-3 w-3 mr-1" />,
    };

    const displayType = type === 'business' ? 'Business' : type.charAt(0).toUpperCase() + type.slice(1);

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeClasses[type]}`}>
        {typeIcons[type]}
        {displayType}
      </span>
    );
  };

  // Since filtering is now handled by the API, just use the clients directly
  const filteredClients = clients || [];

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-600 dark:text-gray-400">
              Manage your client relationships
            </p>
            {dataSource && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                dataSource === 'api' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {dataSource === 'api' ? '🟢 Live Data' : '🟡 Demo Mode'}
              </span>
            )}
          </div>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedClient(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Client
        </motion.button>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total || 0}
              </p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-primary-500" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.active || stats.total || 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Business</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.business || 0}
              </p>
            </div>
            <BuildingOfficeIcon className="h-8 w-8 text-blue-500" />
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
                ${clients.reduce((sum, c) => sum + (c.totalPaid || 0), 0).toLocaleString()}
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Types</option>
            <option value="business">Business</option>
            <option value="individual">Individual</option>
          </select>
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

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {(client.client_type === 'business' && client.company_name 
                        ? client.company_name.substring(0, 2).toUpperCase()
                        : client.name.substring(0, 2).toUpperCase())}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {client.client_type === 'business' && client.company_name 
                        ? client.company_name 
                        : client.name}
                    </h3>
                    {client.client_type === 'business' && client.company_name && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Contact: {client.name}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {getTypeBadge(client.client_type || client.type)}
                      {getStatusBadge(client.status)}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleView(client)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(client)}
                    className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Edit Client"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleArchiveToggle(client)}
                    className="p-1 text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                    title={client.status === 'active' ? 'Archive Client' : 'Restore Client'}
                  >
                    {client.status === 'active' ? (
                      <ArchiveBoxIcon className="h-4 w-4" />
                    ) : (
                      <ArchiveBoxArrowDownIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(client)}
                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete Client"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  {client.phone}
                </div>
                {client.address && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span className="truncate">{client.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Invoices</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {clientInvoiceStats[client.id || client._id]?.totalInvoices || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Total Paid</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      ${(clientInvoiceStats[client.id || client._id]?.totalPaid || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Due</p>
                    <p className="font-semibold text-orange-600 dark:text-orange-400">
                      ${(clientInvoiceStats[client.id || client._id]?.totalDue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => handleViewInvoices(client)}
                  className="flex-1 btn-secondary text-sm py-1.5 flex items-center justify-center"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  View Invoices
                </button>
                <button 
                  onClick={() => handleNewInvoice(client)}
                  className="flex-1 btn-primary text-sm py-1.5"
                >
                  New Invoice
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Client Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSave={async (clientData) => {
          try {
            if (selectedClient) {
              // Update existing client
              await clientService.updateClient(selectedClient._id || selectedClient.id, clientData);
            } else {
              // Add new client
              await clientService.createClient(clientData);
            }
            await fetchClients();
                  setIsModalOpen(false);
            setSelectedClient(null);
            toast.success(selectedClient ? 'Client updated successfully!' : 'Client created successfully!');
          } catch (error) {
            console.error('Error saving client:', error);
            toast.error('Failed to save client. Please try again.');
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <ClientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setClientToView(null);
        }}
        client={clientToView}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setClientToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone and will remove all associated data."
        itemName={clientToDelete ? `${clientToDelete.name || 'Client'} (${clientToDelete.email || 'No email'})` : ''}
        confirmText="Delete Client"
        isLoading={isDeleting}
        isDangerous={true}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={handleInvoiceModalClose}
        onSave={handleInvoiceSave}
        invoice={invoiceToView}
        preSelectedClient={selectedClientForInvoice}
      />

      {/* Client Invoices Modal */}
      <ClientInvoicesModal
        isOpen={isClientInvoicesModalOpen}
        onClose={handleCloseClientInvoicesModal}
        client={clientForInvoicesView}
        onViewInvoice={handleViewInvoice}
        onEditInvoice={handleEditInvoice}
        onDuplicateInvoice={handleDuplicateInvoice}
        onStatsRefresh={fetchClientInvoiceStats}
        refreshTrigger={clientInvoicesRefreshTrigger}
      />

      {/* Invoice View Modal */}
      <InvoiceViewModal
        isOpen={isInvoiceViewModalOpen}
        onClose={() => {
          setIsInvoiceViewModalOpen(false);
          setInvoiceToView(null);
        }}
        invoice={invoiceToView}
      />
    </div>
  );
};

export default Clients;