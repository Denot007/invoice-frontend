import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const PaymentModal = ({ isOpen, onClose, invoice, onPaymentRecorded }) => {
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: '',
    payment_method: '',
    reference_number: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'direct_transfer', label: 'Direct Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (isOpen && invoice) {
      // Set default values when modal opens
      setFormData({
        amount: invoice.amountDue || '',
        payment_date: new Date().toISOString().split('T')[0], // Today's date
        payment_method: '',
        reference_number: '',
        notes: ''
      });
    }
  }, [isOpen, invoice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:8000/api/invoices/${invoice.id}/record_payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const paymentData = await response.json();
        toast.success('Payment recorded successfully!');
        onPaymentRecorded(paymentData);
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Record Payment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Invoice Info */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Invoice:</strong> {invoice.invoiceNumber}</p>
            <p><strong>Client:</strong> {invoice.client?.name || invoice.client?.displayName}</p>
            <p><strong>Total:</strong> {formatCurrency(invoice.total)}</p>
            <p><strong>Amount Due:</strong> <span className="text-red-600 dark:text-red-400 font-medium">{formatCurrency(invoice.amountDue)}</span></p>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Payment Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
              Payment Amount *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              step="0.01"
              min="0.01"
              max={invoice.amountDue}
              value={formData.amount}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum: {formatCurrency(invoice.amountDue)}
            </p>
          </div>

          {/* Payment Date */}
          <div>
            <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Payment Date *
            </label>
            <input
              type="date"
              id="payment_date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CreditCardIcon className="h-4 w-4 inline mr-1" />
              Payment Method *
            </label>
            <select
              id="payment_method"
              name="payment_method"
              value={formData.payment_method}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select payment method</option>
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reference Number */}
          <div>
            <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reference Number
            </label>
            <input
              type="text"
              id="reference_number"
              name="reference_number"
              value={formData.reference_number}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Check number, transaction ID, etc."
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DocumentTextIcon className="h-4 w-4 inline mr-1" />
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Additional payment details..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Recording...
                </div>
              ) : (
                'Record Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;