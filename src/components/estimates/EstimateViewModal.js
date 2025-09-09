import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const EstimateViewModal = ({ isOpen, onClose, estimate, onEdit, onDuplicate, onSend, onExport }) => {
  if (!estimate) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const clientName = estimate.client_details?.client_type === 'business' && estimate.client_details?.company_name
    ? estimate.client_details.company_name
    : estimate.client_details?.name || 'Unknown Client';

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-xl font-semibold text-white flex items-center">
                      <DocumentDuplicateIcon className="h-6 w-6 mr-2" />
                      Estimate {estimate.estimate_number}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  {/* Status and Actions */}
                  <div className="flex items-center justify-between mb-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(estimate.status)}`}>
                      {estimate.status?.charAt(0).toUpperCase() + estimate.status?.slice(1)}
                    </span>
                    
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onExport && onExport(estimate)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 dark:bg-gray-700 dark:text-indigo-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Export PDF
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEdit && onEdit(estimate)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDuplicate && onDuplicate(estimate)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                        Duplicate
                      </motion.button>
                      
                      {estimate.status !== 'accepted' && estimate.status !== 'rejected' && estimate.status !== 'expired' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onSend && onSend(estimate)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                          Send
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Estimate Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Client Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                        <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                        Client Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{clientName}</span>
                        </div>
                        {estimate.client_details?.email && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{estimate.client_details.email}</span>
                          </div>
                        )}
                        {estimate.client_details?.phone && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{estimate.client_details.phone}</span>
                          </div>
                        )}
                        {estimate.client_details?.address && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Address:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{estimate.client_details.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Estimate Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2 text-purple-500" />
                        Estimate Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Issue Date:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{formatDate(estimate.issue_date)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Valid Until:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{formatDate(estimate.expiry_date)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Title:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{estimate.title}</span>
                        </div>
                        {estimate.description && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{estimate.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Items</h3>
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Unit Price
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                          {estimate.items?.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {item.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatCurrency(item.unit_price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(item.total || (item.quantity * item.unit_price))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end mb-6">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(estimate.subtotal)}
                        </span>
                      </div>
                      {estimate.tax_rate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Tax ({estimate.tax_rate}%):</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(estimate.tax_amount)}
                          </span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                        <span className="font-bold text-xl text-purple-600 dark:text-purple-400">
                          {formatCurrency(estimate.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes and Terms */}
                  {(estimate.notes || estimate.terms) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {estimate.notes && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Notes</h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            {estimate.notes}
                          </p>
                        </div>
                      )}
                      {estimate.terms && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Terms</h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            {estimate.terms}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
                  <div className="flex justify-end">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
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

export default EstimateViewModal;