import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import invoiceService from '../../services/invoiceService';

const QuickPaymentModal = ({ isOpen, onClose, invoice, onPaymentRecorded, pendingStatusChange }) => {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Traditional payment method options
  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: CurrencyDollarIcon, description: 'Record cash payment' },
    { value: 'check', label: 'Check', icon: DocumentTextIcon, description: 'Record check payment' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: BanknotesIcon, description: 'Record wire/ACH transfer' },
    { value: 'credit_card', label: 'Credit Card', icon: CreditCardIcon, description: 'Record card payment' },
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && invoice) {
      const balance = invoice.balance_due !== undefined ? invoice.balance_due : (invoice.total || 0) - (invoice.amount_paid || 0);
      
      // Pre-fill amount if changing status to 'paid'
      const defaultAmount = pendingStatusChange === 'paid' ? balance.toString() : '';
      const defaultNotes = pendingStatusChange === 'paid' ? 'Full payment recorded via status change' : 'Payment recorded via status change';
      
      setPaymentData({
        amount: defaultAmount,
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        reference_number: '',
        notes: pendingStatusChange ? defaultNotes : '',
      });
      setErrors({});
    }
  }, [isOpen, invoice, pendingStatusChange]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid payment amount';
    }

    if (!paymentData.payment_method) {
      newErrors.payment_method = 'Please select a payment method';
    }

    if (!paymentData.payment_date) {
      newErrors.payment_date = 'Please select a payment date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Handle traditional payment recording
    setIsSubmitting(true);
    try {
      const result = await invoiceService.recordPayment(invoice.id, paymentData);
      
      if (result.success) {
        toast.success(`Payment of $${parseFloat(paymentData.amount).toLocaleString()} recorded successfully`);
        if (onPaymentRecorded) {
          await onPaymentRecorded(paymentData);
        }
        onClose();
      } else {
        toast.error(result.error || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!invoice) return null;

  const balance = invoice.balance_due !== undefined ? invoice.balance_due : (invoice.total || 0) - (invoice.amount_paid || 0);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-6 text-gray-900 dark:text-white"
                  >
                    Record Payment
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Invoice Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Invoice #{invoice.invoice_number}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {invoice.client?.name || 'No Client'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Balance Due: ${balance.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Total: ${(invoice.total || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods.map((method) => {
                        const IconComponent = method.icon;
                        const isSelected = paymentData.payment_method === method.value;
                        
                        return (
                          <motion.button
                            key={method.value}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPaymentData(prev => ({ ...prev, payment_method: method.value }))}
                            className={`p-4 border-2 rounded-xl text-left transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <IconComponent className={`h-6 w-6 mt-0.5 ${
                                isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                              }`} />
                              <div className="min-w-0 flex-1">
                                <p className={`text-sm font-semibold ${
                                  isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                                }`}>
                                  {method.label}
                                </p>
                                <p className={`text-xs mt-1 ${
                                  isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {method.description}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                    {errors.payment_method && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors.payment_method}
                      </p>
                    )}
                  </div>

                  {/* Payment Amount */}
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment Amount
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        step="0.01"
                        min="0.01"
                        className={`form-input pl-10 ${errors.amount ? 'border-red-300' : ''}`}
                        placeholder="0.00"
                        value={paymentData.amount}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors.amount}
                      </p>
                    )}
                  </div>

                  {/* Payment Date */}
                  <div>
                    <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment Date
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="payment_date"
                        id="payment_date"
                        className={`form-input pl-10 ${errors.payment_date ? 'border-red-300' : ''}`}
                        value={paymentData.payment_date}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.payment_date && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors.payment_date}
                      </p>
                    )}
                  </div>

                  {/* Reference Number */}
                  <div>
                    <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      name="reference_number"
                      id="reference_number"
                      className="form-input mt-1"
                      placeholder="Check number, transaction ID, etc."
                      value={paymentData.reference_number}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows={3}
                      className="form-input mt-1"
                      placeholder="Additional payment details..."
                      value={paymentData.notes}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-secondary"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary flex items-center"
                    >
                      <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                      {isSubmitting ? 'Recording...' : 'Record Payment'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default QuickPaymentModal;