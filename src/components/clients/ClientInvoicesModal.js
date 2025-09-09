import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  PaperAirplaneIcon,
 
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import invoiceService from '../../services/invoiceService';

const ClientInvoicesModal = ({ isOpen, onClose, client, onEditInvoice, onDuplicateInvoice, onViewInvoice, onStatsRefresh, refreshTrigger }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchClientInvoices = async () => {
      if (!client || !isOpen) return;
      
      setLoading(true);
      try {
        // Fetch invoices for this specific client
        const result = await invoiceService.getInvoices({ client: client.id || client._id });
        if (result.success) {
          const clientInvoices = (result.data || []).filter(invoice => {
            const invoiceClientId = invoice.client?.id || invoice.client_details?.id || invoice.client;
            const clientId = client.id || client._id;
            return invoiceClientId === clientId || invoiceClientId === parseInt(clientId);
          });
          
          setInvoices(clientInvoices);
          
          // Calculate stats
          const total = clientInvoices.length;
          const paid = clientInvoices.filter(inv => inv.status === 'paid').length;
          const overdue = clientInvoices.filter(inv => inv.status === 'overdue').length;
          const totalAmount = clientInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
          const paidAmount = clientInvoices.reduce((sum, inv) => 
            inv.status === 'paid' ? sum + (parseFloat(inv.total) || 0) : sum, 0);
          const outstandingAmount = totalAmount - paidAmount;
          
          setStats({
            total,
            paid,
            overdue,
            totalAmount,
            paidAmount,
            outstandingAmount
          });
        } else {
          setInvoices([]);
          setStats({});
        }
      } catch (error) {
        console.error('Error fetching client invoices:', error);
        toast.error('Failed to load client invoices');
        setInvoices([]);
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    fetchClientInvoices();
  }, [client, isOpen, refreshTrigger]);

  const getStatusIcon = (status) => {
    const icons = {
      draft: <DocumentTextIcon className="h-4 w-4" />,
      sent: <PaperAirplaneIcon className="h-4 w-4" />,
      paid: <CheckCircleIcon className="h-4 w-4" />,
      partial: <ClockIcon className="h-4 w-4" />,
      overdue: <ExclamationCircleIcon className="h-4 w-4" />,
      cancelled: <XMarkIcon className="h-4 w-4" />,
    };
    return icons[status] || <DocumentTextIcon className="h-4 w-4" />;
  };

  const getStatusBadge = (status) => {
    const badgeClasses = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeClasses[status] || badgeClasses.draft}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>
      </span>
    );
  };

  const handleSendInvoice = async (invoice) => {
    try {
      const result = await invoiceService.sendInvoice(invoice.id || invoice._id);
      if (result.success) {
        toast.success(result.message || 'Invoice sent successfully!');
        // Refresh the invoices list
        const updatedResult = await invoiceService.getInvoices({ client: client.id || client._id });
        if (updatedResult.success) {
          const clientInvoices = (updatedResult.data || []).filter(inv => {
            const invoiceClientId = inv.client?.id || inv.client_details?.id || inv.client;
            const clientId = client.id || client._id;
            return invoiceClientId === clientId || invoiceClientId === parseInt(clientId);
          });
          setInvoices(clientInvoices);
        }
        // Refresh parent component stats
        if (onStatsRefresh) {
          onStatsRefresh();
        }
      } else {
        throw new Error(result.error || 'Failed to send invoice');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice. Please try again.');
    }
  };

  const clientDisplayName = client?.client_type === 'business' && client?.company_name 
    ? client.company_name 
    : client?.name || 'Unknown Client';

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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
                <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-500" />
                      Invoices for {clientDisplayName}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Stats Cards */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Invoices</p>
                          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-500" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">Paid</p>
                          <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.paid || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <div className="flex items-center">
                        <ExclamationCircleIcon className="h-8 w-8 text-red-500" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">Overdue</p>
                          <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.overdue || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Outstanding</p>
                          <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                            ${(stats.outstandingAmount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoices List */}
                <div className="px-6 pb-6">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="text-center py-12">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No invoices</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        This client doesn't have any invoices yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Invoice
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                          <AnimatePresence>
                            {invoices.map((invoice) => (
                              <motion.tr
                                key={invoice.id || invoice._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {invoice.invoiceNumber || invoice.invoice_number || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                      {invoice.title || 'Untitled Invoice'}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-white">
                                    {invoice.issueDate || invoice.issue_date || 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Due: {invoice.dueDate || invoice.due_date || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    ${(parseFloat(invoice.total) || 0).toLocaleString()}
                                  </div>
                                  {invoice.amountDue !== undefined && invoice.amountDue > 0 && (
                                    <div className="text-sm text-red-500">
                                      Due: ${(parseFloat(invoice.amountDue) || 0).toLocaleString()}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {getStatusBadge(invoice.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={() => onViewInvoice && onViewInvoice(invoice)}
                                      className="text-gray-400 hover:text-blue-500 transition-colors"
                                      title="View Invoice"
                                    >
                                      <EyeIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => onEditInvoice && onEditInvoice(invoice)}
                                      className="text-gray-400 hover:text-green-500 transition-colors"
                                      title="Edit Invoice"
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => onDuplicateInvoice && onDuplicateInvoice(invoice)}
                                      className="text-gray-400 hover:text-purple-500 transition-colors"
                                      title="Duplicate Invoice"
                                    >
                                      <DocumentDuplicateIcon className="h-4 w-4" />
                                    </button>
                                    {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                      <button
                                        onClick={() => handleSendInvoice(invoice)}
                                        className="text-gray-400 hover:text-blue-500 transition-colors"
                                        title="Send Invoice"
                                      >
                                        <PaperAirplaneIcon className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      Total Revenue: <span className="font-medium">${(stats.paidAmount || 0).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={onClose}
                      className="btn-secondary"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ClientInvoicesModal;