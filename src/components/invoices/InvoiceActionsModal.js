import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  PaperAirplaneIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const InvoiceActionsModal = ({ 
  isOpen, 
  onClose, 
  invoice, 
  onView,
  onEdit, 
  onDelete, 
  onDuplicate, 
  onSend, 
  onDownloadPDF, 
  onRecordPayment,
  position = { x: 0, y: 0 }
}) => {
  if (!invoice) return null;

  const getInvoiceBalance = (invoice) => {
    if (invoice.balance_due !== undefined) {
      return invoice.balance_due;
    }
    const total = invoice.total || 0;
    const amountPaid = invoice.amountPaid || invoice.amount_paid || 0;
    return total - amountPaid;
  };

  const actions = [
    {
      id: 'view',
      label: 'View Details',
      icon: EyeIcon,
      color: 'text-slate-700 dark:text-slate-300',
      hoverColor: 'hover:text-slate-900 dark:hover:text-slate-100',
      bgColor: 'bg-slate-50/80 dark:bg-slate-800/50',
      hoverBgColor: 'hover:bg-slate-100 dark:hover:bg-slate-700/70',
      borderColor: 'border-slate-200/50 dark:border-slate-700/50',
      onClick: () => { onClose(); setTimeout(() => onView(invoice), 100); },
    },
    {
      id: 'download',
      label: 'Download PDF',
      icon: ArrowDownTrayIcon,
      color: 'text-indigo-700 dark:text-indigo-300',
      hoverColor: 'hover:text-indigo-900 dark:hover:text-indigo-100',
      bgColor: 'bg-indigo-50/80 dark:bg-indigo-900/30',
      hoverBgColor: 'hover:bg-indigo-100 dark:hover:bg-indigo-800/50',
      borderColor: 'border-indigo-200/50 dark:border-indigo-700/50',
      onClick: () => { onClose(); setTimeout(() => onDownloadPDF(invoice), 100); },
    },
    {
      id: 'payment',
      label: 'Record Payment',
      icon: CurrencyDollarIcon,
      color: 'text-emerald-700 dark:text-emerald-300',
      hoverColor: 'hover:text-emerald-900 dark:hover:text-emerald-100',
      bgColor: 'bg-emerald-50/80 dark:bg-emerald-900/30',
      hoverBgColor: 'hover:bg-emerald-100 dark:hover:bg-emerald-800/50',
      borderColor: 'border-emerald-200/50 dark:border-emerald-700/50',
      onClick: () => { onClose(); setTimeout(() => onRecordPayment(invoice), 100); },
      show: invoice.status !== 'paid' && getInvoiceBalance(invoice) > 0,
    },
    {
      id: 'edit',
      label: 'Edit Invoice',
      icon: PencilIcon,
      color: 'text-blue-700 dark:text-blue-300',
      hoverColor: 'hover:text-blue-900 dark:hover:text-blue-100',
      bgColor: 'bg-blue-50/80 dark:bg-blue-900/30',
      hoverBgColor: 'hover:bg-blue-100 dark:hover:bg-blue-800/50',
      borderColor: 'border-blue-200/50 dark:border-blue-700/50',
      onClick: () => { onClose(); setTimeout(() => onEdit(invoice), 100); },
      show: invoice.status !== 'paid', // Hide edit button for paid invoices
    },
    {
      id: 'duplicate',
      label: 'Duplicate Invoice',
      icon: DocumentDuplicateIcon,
      color: 'text-purple-700 dark:text-purple-300',
      hoverColor: 'hover:text-purple-900 dark:hover:text-purple-100',
      bgColor: 'bg-purple-50/80 dark:bg-purple-900/30',
      hoverBgColor: 'hover:bg-purple-100 dark:hover:bg-purple-800/50',
      borderColor: 'border-purple-200/50 dark:border-purple-700/50',
      onClick: () => { onClose(); setTimeout(() => onDuplicate(invoice), 100); },
    },
    {
      id: 'send',
      label: 'Send Invoice',
      icon: PaperAirplaneIcon,
      color: 'text-green-700 dark:text-green-300',
      hoverColor: 'hover:text-green-900 dark:hover:text-green-100',
      bgColor: 'bg-green-50/80 dark:bg-green-900/30',
      hoverBgColor: 'hover:bg-green-100 dark:hover:bg-green-800/50',
      borderColor: 'border-green-200/50 dark:border-green-700/50',
      onClick: () => { onClose(); setTimeout(() => onSend(invoice), 100); },
    },
    {
      id: 'delete',
      label: 'Delete Invoice',
      icon: TrashIcon,
      color: 'text-red-700 dark:text-red-300',
      hoverColor: 'hover:text-red-900 dark:hover:text-red-100',
      bgColor: 'bg-red-50/80 dark:bg-red-900/30',
      hoverBgColor: 'hover:bg-red-100 dark:hover:bg-red-800/50',
      borderColor: 'border-red-200/50 dark:border-red-700/50',
      onClick: () => { onClose(); setTimeout(() => onDelete(invoice), 100); },
      show: invoice.status === 'draft', // Only show delete for draft invoices
    },
  ];

  const visibleActions = actions.filter(action => action.show !== false);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 overflow-y-auto pointer-events-none">
          <div className="relative">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel 
                className="w-72 transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all pointer-events-auto"
                style={{
                  position: 'fixed',
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  zIndex: 50
                }}
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <Dialog.Title className="text-xl font-semibold text-white flex items-center">
                        <Cog6ToothIcon className="h-6 w-6 mr-2" />
                        Invoice Actions
                      </Dialog.Title>
                      <button
                        type="button"
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  {/* Invoice Info */}
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invoice.invoiceNumber || invoice.invoice_number}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {invoice.client?.name || 'Unknown Client'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        Total: ${(invoice.total || 0).toLocaleString()}
                        {getInvoiceBalance(invoice) > 0 && (
                          <span className="text-orange-600 dark:text-orange-400 ml-2">
                            Balance: ${getInvoiceBalance(invoice).toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions List */}
                  <div className="p-3">
                    <div className="grid grid-cols-2 gap-3">
                      {visibleActions.map((action) => (
                        <motion.button
                          key={action.id}
                          onClick={action.onClick}
                          className={`flex flex-col items-center px-3 py-3 rounded-xl transition-all duration-200 border ${action.color} ${action.hoverColor} ${action.bgColor} ${action.hoverBgColor} ${action.borderColor} text-center shadow-sm hover:shadow-md`}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <action.icon className="h-5 w-5 mb-2 flex-shrink-0" />
                          <span className="text-xs font-medium leading-tight">{action.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default InvoiceActionsModal;