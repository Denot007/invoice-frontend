import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import invoiceService from '../../services/invoiceService';
import { marketplaceService } from '../../services/marketplaceService';

// Get Stripe key
const getStripeKey = () => {
  const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  if (!key || key === 'pk_test_...' || key.includes('...')) {
    return 'pk_test_51RaJzwPwZVx974bpPB3doRRjtXTPSKAYJ2M3d5wwoVwi9pLMdNj00dPnjw5tSljOk4uDdDVhc15SxyAKVpfOxHi800omsELDUg';
  }
  return key;
};

const stripePromise = loadStripe(getStripeKey());

// CardElement styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1f2937',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#9ca3af',
      },
      backgroundColor: '#ffffff',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: false,
};

// Stripe Payment Form Component
const StripePaymentForm = ({ invoice, amount, onSuccess, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe is not loaded. Please refresh the page.');
      return;
    }

    if (!cardholderName.trim()) {
      setError('Please enter cardholder name');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Get handyman account
      const handymenData = await marketplaceService.listHandymen();
      const handymen = handymenData.handymen || [];

      if (handymen.length === 0) {
        throw new Error('Payment account not set up. Please configure Stripe Connect first.');
      }

      const handymanId = handymen[0].id;

      // Create payment intent
      const paymentIntent = await marketplaceService.processPayment(
        handymanId,
        invoice.client?.email || 'client@example.com',
        amount,
        invoice.id
      );

      // Confirm card payment
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
      } else if (confirmedPayment.status === 'succeeded') {
        // Update invoice status manually (for localhost compatibility)
        try {
          await marketplaceService.updateInvoiceStatus(
            invoice.id,
            'paid',
            amount,
            confirmedPayment.id
          );
        } catch (updateError) {
          console.log('Webhook will handle invoice update:', updateError);
        }

        toast.success('Payment processed successfully!');
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Invoice Details */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Invoice #{invoice.invoice_number}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {invoice.client?.name || 'N/A'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Amount to collect:
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${parseFloat(amount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={processing}
        />
      </div>

      {/* Card Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Card Details
        </label>
        <div className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {processing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCardIcon className="w-5 h-5" />
              <span>Collect ${parseFloat(amount).toFixed(2)}</span>
            </>
          )}
        </button>
      </div>

      {/* Security Notice */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        🔒 Secured by Stripe • PCI Compliant • Your card details are never stored
      </p>
    </form>
  );
};

// Main Modal Component
const CollectPaymentModal = ({ isOpen, onClose, onPaymentSuccess }) => {
  const [step, setStep] = useState('select'); // 'select' or 'payment'
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [traditionalPayment, setTraditionalPayment] = useState({
    method: '',
    reference: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchUnpaidInvoices();
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter invoices based on search term
    const filtered = invoices.filter(invoice => {
      const searchLower = searchTerm.toLowerCase();
      return (
        invoice.invoice_number?.toLowerCase().includes(searchLower) ||
        invoice.client?.name?.toLowerCase().includes(searchLower) ||
        invoice.client?.email?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredInvoices(filtered);
  }, [searchTerm, invoices]);

  const fetchUnpaidInvoices = async () => {
    setLoading(true);
    try {
      const result = await invoiceService.getInvoices();
      console.log('Fetched invoice result:', result);

      // Extract the actual invoice data array (same as Invoices.js line 64)
      const invoiceData = result.data || result || [];
      console.log('Invoice data array:', invoiceData);

      // Filter unpaid or partially paid invoices
      // Handle both camelCase and snake_case field names
      const unpaid = invoiceData.filter(inv => {
        const balanceDue = parseFloat(
          inv.balanceDue || inv.balance_due || inv.totalAmount || inv.total_amount || 0
        );
        return inv.status !== 'paid' && balanceDue > 0;
      });

      console.log('Unpaid invoices:', unpaid);
      setInvoices(unpaid);
      setFilteredInvoices(unpaid);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceSelect = (invoice) => {
    setSelectedInvoice(invoice);
    const balanceDue = invoice.balanceDue || invoice.balance_due || invoice.totalAmount || invoice.total_amount;
    setPaymentAmount(balanceDue);
    setStep('payment');
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    if (method !== 'credit_card') {
      setTraditionalPayment({ ...traditionalPayment, method });
    }
  };

  const handleTraditionalPayment = async () => {
    if (!traditionalPayment.method) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      await invoiceService.addPayment(selectedInvoice.id, {
        amount: paymentAmount,
        payment_method: traditionalPayment.method,
        reference_number: traditionalPayment.reference,
        notes: traditionalPayment.notes,
      });

      toast.success('Payment recorded successfully!');
      handleClose();
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to record payment');
    }
  };

  const handleStripePaymentSuccess = () => {
    handleClose();
    if (onPaymentSuccess) onPaymentSuccess();
  };

  const handleClose = () => {
    setStep('select');
    setSelectedInvoice(null);
    setPaymentMethod('');
    setPaymentAmount('');
    setSearchTerm('');
    setTraditionalPayment({ method: '', reference: '', notes: '' });
    onClose();
  };

  const handleBack = () => {
    if (step === 'payment' && paymentMethod === 'credit_card') {
      setPaymentMethod('');
    } else if (step === 'payment') {
      setStep('select');
      setSelectedInvoice(null);
      setPaymentMethod('');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <BanknotesIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-bold text-white">
                          Collect Payment
                        </Dialog.Title>
                        <p className="text-sm text-blue-100">
                          {step === 'select' ? 'Select an invoice to collect payment' : `Invoice #${selectedInvoice?.invoice_number}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {step === 'select' && (
                      <motion.div
                        key="select"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                      >
                        {/* Search Bar */}
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search by invoice #, client name, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Invoice List */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {loading ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : filteredInvoices.length === 0 ? (
                            <div className="text-center py-12">
                              <BanknotesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 dark:text-gray-400">
                                {searchTerm ? 'No invoices match your search' : 'No unpaid invoices found'}
                              </p>
                            </div>
                          ) : (
                            filteredInvoices.map((invoice) => (
                              <button
                                key={invoice.id}
                                onClick={() => handleInvoiceSelect(invoice)}
                                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Invoice #{invoice.invoice_number}
                                      </span>
                                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                        invoice.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                      }`}>
                                        {invoice.status}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {invoice.client?.name || 'N/A'} • Due: {new Date(invoice.due_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                      ${parseFloat(invoice.balance_due || invoice.total_amount).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Balance Due
                                    </p>
                                  </div>
                                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 ml-4" />
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}

                    {step === 'payment' && !paymentMethod && (
                      <motion.div
                        key="method"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                      >
                        {/* Invoice Summary */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                {selectedInvoice.client?.name}
                              </p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                Invoice #{selectedInvoice.invoice_number}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                Amount Due
                              </p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${parseFloat(selectedInvoice.balance_due || selectedInvoice.total_amount).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Select Payment Method
                        </h3>

                        {/* Payment Method Options */}
                        <div className="space-y-3">
                          {/* Credit Card Option */}
                          <button
                            onClick={() => handlePaymentMethodSelect('credit_card')}
                            className="w-full p-4 border-2 border-blue-300 dark:border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-all group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                                  <CreditCardIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-left">
                                  <p className="font-semibold text-gray-900 dark:text-white flex items-center">
                                    Credit Card
                                    <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                                      Online
                                    </span>
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Process card payment with Stripe
                                  </p>
                                </div>
                              </div>
                              <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                            </div>
                          </button>

                          {/* Traditional Methods */}
                          {['cash', 'check', 'bank_transfer', 'other'].map((method) => (
                            <button
                              key={method}
                              onClick={() => handlePaymentMethodSelect(method)}
                              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    <BanknotesIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                  </div>
                                  <div className="text-left">
                                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                                      {method.replace('_', ' ')}
                                    </p>
                                  </div>
                                </div>
                                <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                              </div>
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={handleBack}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
                        >
                          Back to Invoice Selection
                        </button>
                      </motion.div>
                    )}

                    {step === 'payment' && paymentMethod === 'credit_card' && (
                      <motion.div
                        key="stripe"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <Elements stripe={stripePromise}>
                          <StripePaymentForm
                            invoice={selectedInvoice}
                            amount={paymentAmount}
                            onSuccess={handleStripePaymentSuccess}
                            onBack={handleBack}
                          />
                        </Elements>
                      </motion.div>
                    )}

                    {step === 'payment' && paymentMethod && paymentMethod !== 'credit_card' && (
                      <motion.div
                        key="traditional"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                      >
                        {/* Invoice Summary */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Invoice #{selectedInvoice.invoice_number}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full capitalize">
                              {paymentMethod.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              Payment Amount:
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="text-2xl font-bold text-blue-600 dark:text-blue-400 bg-transparent text-right focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Reference Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reference Number (Optional)
                          </label>
                          <input
                            type="text"
                            value={traditionalPayment.reference}
                            onChange={(e) => setTraditionalPayment({ ...traditionalPayment, reference: e.target.value })}
                            placeholder="Check #, Transaction ID, etc."
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Payment Notes (Optional)
                          </label>
                          <textarea
                            value={traditionalPayment.notes}
                            onChange={(e) => setTraditionalPayment({ ...traditionalPayment, notes: e.target.value })}
                            placeholder="Additional details about this payment..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                          <button
                            onClick={handleBack}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleTraditionalPayment}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                            <span>Record Payment</span>
                          </button>
                        </div>
                      </motion.div>
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

export default CollectPaymentModal;
