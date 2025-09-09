import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  PrinterIcon,
 
  PaperAirplaneIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const InvoiceViewModal = ({ isOpen, onClose, invoice, onEdit, onDuplicate, onSend }) => {
  if (!invoice) return null;

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
      currency: invoice.currency || 'USD',
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

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
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="p-6"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {invoice.invoiceNumber || invoice.invoice_number || 'Invoice'}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                        {(invoice.status || 'draft').charAt(0).toUpperCase() + (invoice.status || 'draft').slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(invoice)}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit Invoice"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDuplicate(invoice)}
                        className="p-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        title="Duplicate Invoice"
                      >
                        <DocumentDuplicateIcon className="h-5 w-5" />
                      </button>
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => onSend && onSend(invoice)}
                          className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Send Invoice"
                        >
                          <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => window.print()}
                        className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-colors"
                        title="Print Invoice"
                      >
                        <PrinterIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Invoice Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Left Column - Invoice Details */}
                    <div className="space-y-6">
                      {/* Client Information */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <UserIcon className="h-5 w-5 mr-2" />
                          Bill To
                        </h4>
                        <div className="text-gray-700 dark:text-gray-300">
                          <p className="font-medium">
                            {invoice.client_details?.client_type === 'business' && invoice.client_details?.company_name 
                              ? invoice.client_details.company_name 
                              : invoice.client?.name || invoice.client_details?.name || 'Unknown Client'}
                          </p>
                          {invoice.client_details?.client_type === 'business' && invoice.client_details?.company_name && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">Contact: {invoice.client_details.name}</p>
                          )}
                          <p>{invoice.client?.email || invoice.client_details?.email || 'No email'}</p>
                          {(invoice.client?.phone || invoice.client_details?.phone) && (
                            <p className="text-sm">{invoice.client?.phone || invoice.client_details?.phone}</p>
                          )}
                          {(invoice.client?.address || invoice.client_details?.address) && (
                            <div className="mt-2 text-sm">
                              <p>{invoice.client?.address || invoice.client_details?.address}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Invoice Details */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <CalendarIcon className="h-5 w-5 mr-2" />
                          Invoice Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Issue Date:</span>
                            <span className="text-gray-900 dark:text-white">
                              {formatDate(invoice.issueDate || invoice.issue_date || invoice.date)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                            <span className="text-gray-900 dark:text-white">
                              {formatDate(invoice.dueDate || invoice.due_date)}
                            </span>
                          </div>
                          {invoice.title && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Title:</span>
                              <span className="text-gray-900 dark:text-white">{invoice.title}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Currency:</span>
                            <span className="text-gray-900 dark:text-white">
                              {invoice.currency || 'USD'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Amount Summary */}
                    <div className="space-y-6">
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                          Amount Summary
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                            <span className="text-gray-900 dark:text-white">
                              {formatCurrency(invoice.subtotal)}
                            </span>
                          </div>
                          {(invoice.taxAmount || invoice.tax_amount || invoice.tax > 0) && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Tax ({invoice.tax_rate || invoice.tax || 0}%):</span>
                              <span className="text-gray-900 dark:text-white">
                                {formatCurrency(invoice.taxAmount || invoice.tax_amount || invoice.tax)}
                              </span>
                            </div>
                          )}
                          {(invoice.discountAmount || invoice.discount?.value) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                              <span className="text-gray-900 dark:text-white">
                                -{formatCurrency(invoice.discountAmount || invoice.discount?.value)}
                              </span>
                            </div>
                          )}
                          <hr className="border-gray-300 dark:border-gray-600" />
                          <div className="flex justify-between text-lg font-semibold">
                            <span className="text-gray-900 dark:text-white">Total:</span>
                            <span className="text-gray-900 dark:text-white">
                              {formatCurrency(invoice.total)}
                            </span>
                          </div>
                          {(invoice.amountPaid || invoice.amount_paid) > 0 && (
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                              <span>Amount Paid:</span>
                              <span>{formatCurrency(invoice.amountPaid || invoice.amount_paid)}</span>
                            </div>
                          )}
                          {(invoice.amountDue || invoice.balance_due || (invoice.total - (invoice.amountPaid || invoice.amount_paid || 0))) > 0 && (
                            <div className="flex justify-between text-red-600 dark:text-red-400 font-medium">
                              <span>Amount Due:</span>
                              <span>{formatCurrency(invoice.amountDue || invoice.balance_due || (invoice.total - (invoice.amountPaid || invoice.amount_paid || 0)))}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment History Section */}
                      {invoice.payments && invoice.payments.length > 0 && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                            Payment History
                          </h4>
                          <div className="space-y-2">
                            {invoice.payments.map((payment, index) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(payment.amount)}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {payment.payment_method?.replace('_', ' ').toUpperCase()} • {formatDate(payment.payment_date)}
                                  </div>
                                  {payment.notes && (
                                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                      {payment.notes}
                                    </div>
                                  )}
                                </div>
                                {payment.reference_number && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Ref: {payment.reference_number}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Qty
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Rate
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {(invoice.items || []).map((item, index) => (
                            <tr key={index} className="bg-white dark:bg-gray-800">
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {item.description || 'No description'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                                {item.quantity || 0}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                                {formatCurrency(item.unit_price || item.rate)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                                {formatCurrency(item.total || item.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Notes and Terms */}
                  {(invoice.notes || invoice.terms) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {invoice.notes && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notes</h4>
                          <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            {invoice.notes}
                          </p>
                        </div>
                      )}
                      {invoice.terms && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Terms & Conditions</h4>
                          <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            {invoice.terms}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default InvoiceViewModal;