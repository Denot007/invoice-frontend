import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import EstimateModal from '../components/estimates/EstimateModal';
import EstimateViewModal from '../components/estimates/EstimateViewModal';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import estimateService from '../services/estimateService';

const Estimates = () => {
  const [estimates, setEstimates] = useState([]);
  const [filteredEstimates, setFilteredEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [viewEstimate, setViewEstimate] = useState(null);
  const [deleteEstimate, setDeleteEstimate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchEstimates();
  }, []);

  const fetchEstimates = async () => {
    try {
      const result = await estimateService.getEstimates();
      if (result.success) {
        setEstimates(result.data || []);
      } else {
        console.error('Error fetching estimates:', result.error);
        setEstimates([]);
      }
    } catch (error) {
      console.error('Error fetching estimates:', error);
      setEstimates([]);
    } finally {
      setLoading(false);
    }
  };

  const _getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'sent':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'expired':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (estimate) => {
    const statusColors = {
      'draft': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'sent': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'accepted': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'expired': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    };

    return (
      <div className="flex items-center gap-2">
        <select
          value={estimate.status}
          onChange={(e) => handleStatusChange(estimate, e.target.value)}
          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[estimate.status] || statusColors.draft}`}
        >
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
        {estimate.converted_to_invoice && (
          <span
            className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 px-2 py-1 rounded-full font-medium"
            title={`Converted to invoice: ${estimate.converted_invoice_number}`}
          >
            📄→ {estimate.converted_invoice_number}
          </span>
        )}
      </div>
    );
  };


  const handleView = (estimate) => {
    setViewEstimate(estimate);
    setIsViewModalOpen(true);
  };

  const handleEdit = (estimate) => {
    setSelectedEstimate(estimate);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (estimate) => {
    setDeleteEstimate(estimate);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteEstimate) return;
    
    setIsDeleting(true);
    try {
      const result = await estimateService.deleteEstimate(deleteEstimate.id);
      if (result.success) {
        await fetchEstimates();
        toast.success(`Estimate ${deleteEstimate.estimate_number || deleteEstimate.estimateNumber} deleted successfully!`);
        setIsDeleteModalOpen(false);
        setDeleteEstimate(null);
      } else {
        console.error('Error deleting estimate:', result.error);
        toast.error('Error deleting estimate: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting estimate:', error);
      toast.error('Error deleting estimate');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (estimate) => {
    try {
      const duplicateData = {
        ...estimate,
        id: undefined,
        estimate_number: undefined, // Will be auto-generated
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        client: estimate.client_details?.id || estimate.client?.id,
        items: estimate.items?.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total
        })) || []
      };

      const result = await estimateService.createEstimate(duplicateData);
      if (result.success) {
        await fetchEstimates();
        toast.success('Estimate duplicated successfully!');
      } else {
        toast.error('Error duplicating estimate: ' + result.error);
      }
    } catch (error) {
      console.error('Error duplicating estimate:', error);
      toast.error('Error duplicating estimate');
    }
  };

  const handleSend = async (estimate) => {
    try {
      const result = await estimateService.updateEstimate(estimate.id, {
        ...estimate,
        status: 'sent'
      });
      
      if (result.success) {
        await fetchEstimates();
        toast.success(`Estimate ${estimate.estimate_number || estimate.estimateNumber} sent successfully!`);
        if (isViewModalOpen) {
          setIsViewModalOpen(false);
        }
      } else {
        toast.error('Error sending estimate: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending estimate:', error);
      toast.error('Error sending estimate');
    }
  };

  const handleExportPDF = async (estimate) => {
    try {
      toast.info('Generating PDF...');
      const result = await estimateService.exportPDF(estimate.id);
      
      if (result.success) {
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `estimate-${estimate.estimate_number || estimate.estimateNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('PDF exported successfully!');
      } else {
        toast.error('Error exporting PDF: ' + result.error);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Error exporting PDF');
    }
  };

  const handleSendEmail = async (estimate) => {
    if (!estimate.client?.email && !estimate.client_details?.email) {
      toast.error('Client email not found. Please add an email address to the client.');
      return;
    }

    try {
      toast.info('Sending email...');
      const result = await estimateService.sendEmail(estimate.id);
      
      if (result.success) {
        toast.success(`Estimate sent successfully to ${result.client_email}`);
        // Refresh estimates to update status
        fetchEstimates();
      } else {
        toast.error('Error sending email: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Error sending email');
    }
  };

  const handleConvertToInvoice = async (estimate) => {
    try {
      const result = await estimateService.convertToInvoice(estimate._id || estimate.id);
      if (result.success) {
        toast.success(`Estimate ${estimate.estimateNumber} converted to invoice successfully!`);
        fetchEstimates();
      } else {
        toast.error('Error converting estimate to invoice: ' + result.error);
      }
    } catch (error) {
      console.error('Error converting estimate:', error);
      toast.error('Error converting estimate to invoice');
    }
  };

  const handleStatusChange = async (estimate, newStatus) => {
    try {
      const result = await estimateService.updateEstimate(estimate.id, { status: newStatus });
      if (result.success) {
        toast.success(`Estimate status updated to ${newStatus}`);
        fetchEstimates();
      } else {
        toast.error('Error updating estimate status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating estimate status');
    }
  };

  // Client-side filtering
  useEffect(() => {
    let filtered = [...estimates];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(estimate =>
        (estimate.estimate_number || estimate.estimateNumber || '').toLowerCase().includes(searchLower) ||
        (estimate.title || '').toLowerCase().includes(searchLower) ||
        (estimate.client_details?.name || estimate.client?.name || '').toLowerCase().includes(searchLower) ||
        (estimate.client_details?.company_name || estimate.client?.company_name || '').toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(estimate => estimate.status === filterStatus);
    }

    setFilteredEstimates(filtered);
  }, [estimates, searchTerm, filterStatus]);

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Estimates</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage project estimates
          </p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedEstimate(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Estimate
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {estimates.length}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">Accepted</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {estimates.filter(e => e.status === 'accepted').length}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">Sent</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {estimates.filter(e => e.status === 'sent').length}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${estimates.reduce((sum, e) => sum + (parseFloat(e.total) || 0), 0).toLocaleString()}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-4"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {estimates.length > 0 ? Math.round((estimates.filter(e => e.status === 'accepted').length / estimates.length) * 100) : 0}%
          </p>
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
                placeholder="Search estimates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
          <button className="btn-secondary flex items-center">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Estimates Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estimate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valid Until
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredEstimates.map((estimate, index) => (
                  <motion.tr
                    key={estimate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusBadge(estimate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {estimate.estimate_number || estimate.estimateNumber}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {estimate.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {estimate.client_details?.client_type === 'business' && estimate.client_details?.company_name
                          ? estimate.client_details.company_name
                          : estimate.client_details?.name || estimate.client?.name || 'Unknown Client'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {estimate.client_details?.email || estimate.client?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(estimate.issue_date || estimate.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(estimate.expiry_date || estimate.validUntil).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${(estimate.total || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(estimate)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleExportPDF(estimate)}
                          className="p-1 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Export PDF"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleSendEmail(estimate)}
                          className="p-1 text-emerald-500 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                          title="Send Email"
                          disabled={!estimate.client?.email && !estimate.client_details?.email}
                        >
                          <EnvelopeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(estimate)}
                          className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(estimate)}
                          className="p-1 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                          title="Duplicate"
                        >
                          <DocumentDuplicateIcon className="h-5 w-5" />
                        </button>
                        {estimate.status === 'accepted' && !estimate.converted_to_invoice && (
                          <button
                            onClick={() => handleConvertToInvoice(estimate)}
                            className="p-1 text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                            title="Convert to Invoice"
                          >
                            <ArrowRightIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(estimate)}
                          className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Estimate Modal */}
      <EstimateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEstimate(null);
        }}
        estimate={selectedEstimate}
        onSave={async (estimateData) => {
          try {
            let result;
            if (selectedEstimate) {
              // Update existing estimate
              result = await estimateService.updateEstimate(selectedEstimate._id || selectedEstimate.id, estimateData);
            } else {
              // Create new estimate
              result = await estimateService.createEstimate(estimateData);
            }
            
            if (result.success) {
              fetchEstimates();
              setIsModalOpen(false);
              setSelectedEstimate(null);
              toast.success(selectedEstimate ? 'Estimate updated successfully!' : 'Estimate created successfully!');
            } else {
              console.error('Error saving estimate:', result.error);
              toast.error('Error saving estimate: ' + result.error);
            }
          } catch (error) {
            console.error('Error saving estimate:', error);
            toast.error('Error saving estimate');
          }
        }}
      />

      {/* Estimate View Modal */}
      <EstimateViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewEstimate(null);
        }}
        estimate={viewEstimate}
        onEdit={(estimate) => {
          setIsViewModalOpen(false);
          setSelectedEstimate(estimate);
          setIsModalOpen(true);
        }}
        onDuplicate={handleDuplicate}
        onSend={handleSend}
        onExport={handleExportPDF}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteEstimate(null);
        }}
        onConfirm={handleDelete}
        title="Delete Estimate"
        message={`Are you sure you want to delete estimate ${deleteEstimate?.estimate_number || deleteEstimate?.estimateNumber}? This action cannot be undone.`}
        confirmText="Delete Estimate"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Estimates;