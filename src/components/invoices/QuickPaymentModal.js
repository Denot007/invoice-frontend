import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import invoiceService from '../../services/invoiceService';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { marketplaceService } from '../../services/marketplaceService';

// Get Stripe key - same as in PaymentModal
const getStripeKey = () => {
  const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  if (!key || key === 'pk_test_...' || key.includes('...')) {
    return 'pk_test_51RaJzwPwZVx974bpPB3doRRjtXTPSKAYJ2M3d5wwoVwi9pLMdNj00dPnjw5tSljOk4uDdDVhc15SxyAKVpfOxHi800omsELDUg';
  }
  return key;
};

const stripePromise = loadStripe(getStripeKey());

// Stripe Card Form Component
const StripeCardForm = ({ amount, invoice, onSuccess, onBack, isSubmitting, setIsSubmitting }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState('');
  const [error, setError] = useState('');

  const handleStripePayment = async () => {
    if (!stripe || !elements) {
      setError('Stripe is not loaded yet. Please try again.');
      return;
    }

    if (!cardholderName.trim()) {
      setError('Please enter the cardholder name');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Get payment setup from backend
      const paymentSetup = await marketplaceService.listHandymen();
      const handymen = paymentSetup.handymen || [];

      // For now, use the first handyman or a default setup
      const handymanId = handymen.length > 0 ? handymen[0].id : 1;

      // Create payment intent
      const paymentIntent = await marketplaceService.processPayment(
        handymanId,
        invoice.client?.email || 'client@example.com',
        amount,
        invoice.id
      );

      // Confirm payment with card
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardholderName,
              email: invoice.client?.email || 'client@example.com',
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setIsSubmitting(false);
      } else if (confirmedPayment.status === 'succeeded') {
        // Update invoice status manually for localhost
        try {
          await marketplaceService.updateInvoiceStatus(invoice.id, confirmedPayment.id, amount);
        } catch (updateError) {
          console.error('Failed to update invoice status:', updateError);
        }

        toast.success('Payment processed successfully!');
        onSuccess({
          amount: amount,
          payment_method: 'credit_card',
          reference_number: confirmedPayment.id,
          notes: `Stripe payment processed. Payment ID: ${confirmedPayment.id}`
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment processing failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center"
      >
        <ArrowRightIcon className="h-4 w-4 mr-1 rotate-180" />
        Back to payment methods
      </button>

      {/* Card Form */}
      <div className="space-y-4">
        {/* Cardholder Name */}
        <div>
          <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            id="cardholderName"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="John Doe"
          />
        </div>

        {/* Card Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Card Details
          </label>
          <div className="relative">
            <div className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#111827', // Very dark text for maximum contrast
                      backgroundColor: 'transparent',
                      '::placeholder': {
                        color: '#9ca3af',
                      },
                      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                      lineHeight: '24px',
                    },
                    invalid: {
                      color: '#dc2626',
                      iconColor: '#dc2626',
                    },
                    complete: {
                      color: '#059669',
                    },
                  },
                  hidePostalCode: false,
                }}
              />
            </div>
            <div className="absolute inset-0 pointer-events-none rounded-lg ring-1 ring-inset ring-gray-300 dark:ring-gray-600"></div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <ExclamationCircleIcon className="h-4 w-4 mr-1" />
              {error}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleStripePayment}
          disabled={!stripe || isSubmitting}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Pay ${amount.toLocaleString()}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

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
  const [showStripeForm, setShowStripeForm] = useState(false);

  // Enhanced payment method options with better icons and descriptions
  const paymentMethods = [
    {
      value: 'cash',
      label: 'Cash',
      icon: BanknotesIcon,
      description: 'Record cash payment',
      color: 'green'
    },
    {
      value: 'check',
      label: 'Check',
      icon: DocumentTextIcon,
      description: 'Record check payment',
      color: 'blue'
    },
    {
      value: 'bank_transfer',
      label: 'Bank Transfer',
      icon: BanknotesIcon,
      description: 'Record wire/ACH transfer',
      color: 'indigo'
    },
    {
      value: 'credit_card',
      label: 'Credit Card',
      icon: CreditCardIcon,
      description: 'Process card payment',
      color: 'purple',
      special: true
    },
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
      setShowStripeForm(false);
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

  const handleMethodSelect = (method) => {
    setPaymentData(prev => ({ ...prev, payment_method: method }));

    // If credit card is selected and form is valid, show Stripe form
    if (method === 'credit_card' && paymentData.amount && parseFloat(paymentData.amount) > 0) {
      setShowStripeForm(true);
    } else {
      setShowStripeForm(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // If credit card, show the Stripe form
    if (paymentData.payment_method === 'credit_card') {
      setShowStripeForm(true);
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

  const handleStripeSuccess = async (stripePaymentData) => {
    if (onPaymentRecorded) {
      await onPaymentRecorded(stripePaymentData);
    }
    onClose();
  };

  if (!invoice) return null;

  const balance = invoice.balance_due !== undefined ? invoice.balance_due : (invoice.total || 0) - (invoice.amount_paid || 0);

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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <CurrencyDollarIcon className="h-7 w-7 text-white" />
                      </div>
                      <div className="ml-4">
                        <Dialog.Title as="h3" className="text-xl font-bold text-white">
                          Record Payment
                        </Dialog.Title>
                        <p className="text-sm text-blue-100 mt-0.5">
                          Invoice #{invoice.invoice_number}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="rounded-lg bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Invoice Summary Card */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                          {invoice.client?.name || 'No Client'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance Due</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                              ${balance.toLocaleString()}
                            </p>
                          </div>
                          <div className="border-l border-gray-300 dark:border-gray-600 pl-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</p>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-1">
                              ${(invoice.total || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {showStripeForm && paymentData.payment_method === 'credit_card' ? (
                      <motion.div
                        key="stripe-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <Elements stripe={stripePromise}>
                          <StripeCardForm
                            amount={parseFloat(paymentData.amount)}
                            invoice={invoice}
                            onSuccess={handleStripeSuccess}
                            onBack={() => setShowStripeForm(false)}
                            isSubmitting={isSubmitting}
                            setIsSubmitting={setIsSubmitting}
                          />
                        </Elements>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="payment-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                      >
                        {/* Payment Method Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Select Payment Method
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {paymentMethods.map((method) => {
                              const IconComponent = method.icon;
                              const isSelected = paymentData.payment_method === method.value;
                              const colorClasses = {
                                green: 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400',
                                blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400',
                                indigo: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400',
                                purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400',
                              };

                              return (
                                <motion.button
                                  key={method.value}
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleMethodSelect(method.value)}
                                  className={`relative p-4 border-2 rounded-xl text-left transition-all overflow-hidden ${
                                    isSelected
                                      ? colorClasses[method.color]
                                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                  }`}
                                >
                                  {method.special && (
                                    <div className="absolute top-0 right-0">
                                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg flex items-center">
                                        <SparklesIcon className="h-3 w-3 mr-1" />
                                        Online
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex items-start space-x-3">
                                    <div className={`p-2 rounded-lg ${isSelected ? `bg-${method.color}-100 dark:bg-${method.color}-900/30` : 'bg-gray-100 dark:bg-gray-700'}`}>
                                      <IconComponent className={`h-6 w-6 ${
                                        isSelected ? `text-${method.color}-600 dark:text-${method.color}-400` : 'text-gray-500 dark:text-gray-400'
                                      }`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className={`text-sm font-semibold ${
                                        isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                      }`}>
                                        {method.label}
                                      </p>
                                      <p className={`text-xs mt-1 ${
                                        isSelected ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
                                      }`}>
                                        {method.description}
                                      </p>
                                    </div>
                                    {isSelected && (
                                      <CheckCircleIcon className={`h-5 w-5 text-${method.color}-600 dark:text-${method.color}-400`} />
                                    )}
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                          {errors.payment_method && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                              <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                              {errors.payment_method}
                            </p>
                          )}
                        </div>

                        {/* Payment Amount */}
                        <div>
                          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Payment Amount
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 text-lg font-medium">$</span>
                            </div>
                            <input
                              type="number"
                              name="amount"
                              id="amount"
                              step="0.01"
                              min="0.01"
                              className={`w-full pl-8 pr-3 py-2 border rounded-lg text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white ${
                                errors.amount ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                              }`}
                              placeholder="0.00"
                              value={paymentData.amount}
                              onChange={handleInputChange}
                            />
                            {balance > 0 && (
                              <button
                                type="button"
                                onClick={() => setPaymentData(prev => ({ ...prev, amount: balance.toString() }))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                              >
                                Full Balance
                              </button>
                            )}
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
                          <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Payment Date
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CalendarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="date"
                              name="payment_date"
                              id="payment_date"
                              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white ${
                                errors.payment_date ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                              }`}
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
                          <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reference Number (Optional)
                          </label>
                          <input
                            type="text"
                            name="reference_number"
                            id="reference_number"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                            placeholder="Check number, transaction ID, etc."
                            value={paymentData.reference_number}
                            onChange={handleInputChange}
                          />
                        </div>

                        {/* Notes */}
                        <div>
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Notes (Optional)
                          </label>
                          <textarea
                            name="notes"
                            id="notes"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none dark:bg-gray-700 dark:text-white"
                            placeholder="Additional payment details..."
                            value={paymentData.notes}
                            onChange={handleInputChange}
                          />
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            disabled={isSubmitting}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-2.5 rounded-lg font-medium flex items-center transition-all ${
                              paymentData.payment_method === 'credit_card'
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {paymentData.payment_method === 'credit_card' ? (
                              <>
                                <CreditCardIcon className="h-5 w-5 mr-2" />
                                Continue to Payment
                              </>
                            ) : (
                              <>
                                <CheckCircleIcon className="h-5 w-5 mr-2" />
                                {isSubmitting ? 'Recording...' : 'Record Payment'}
                              </>
                            )}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default QuickPaymentModal;