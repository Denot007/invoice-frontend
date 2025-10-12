import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../../services/urls';
import { marketplaceService } from '../../services/marketplaceService';
import { useAuth } from '../../context/AuthContext';

// Get Stripe publishable key from environment
const getStripeKey = () => {
  const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  console.log('Stripe key from env:', key ? `${key.slice(0, 20)}...` : 'undefined'); // Debug log (masked)

  if (!key || key === 'pk_test_...' || key.includes('...')) {
    console.error('❌ Stripe publishable key not set properly! Please update REACT_APP_STRIPE_PUBLISHABLE_KEY in .env file');
    // Return the known working key as fallback during development
    return 'pk_test_51RaJzwPwZVx974bpPB3doRRjtXTPSKAYJ2M3d5wwoVwi9pLMdNj00dPnjw5tSljOk4uDdDVhc15SxyAKVpfOxHi800omsELDUg';
  }

  return key;
};

const stripePromise = loadStripe(getStripeKey());
// Stripe Card Payment Component
const StripeCardPayment = ({ amount, invoice, onPaymentSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSetup, setPaymentSetup] = useState(null);
  const [clientEmail, setClientEmail] = useState('');

  useEffect(() => {
    checkHandymanSetup();
  }, []);

  const checkHandymanSetup = async () => {
    try {
      const handymen = await marketplaceService.listHandymen();
      const userHandyman = handymen.handymen.find(h => h.user__email === user.email);

      if (userHandyman) {
        const dashboardData = await marketplaceService.getHandymanDashboard(userHandyman.id);
        setPaymentSetup(dashboardData);
      }
    } catch (error) {
      console.error('Error checking handyman setup:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentSetup?.onboarding_complete) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const paymentIntent = await marketplaceService.processPayment(
        paymentSetup.handyman_id,
        clientEmail || invoice.client?.email || 'client@example.com',
        amount,
        invoice.id // Pass invoice ID for webhook updates
      );

      // Confirm payment with card
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: invoice.client?.name || 'Client',
              email: clientEmail || invoice.client?.email || 'client@example.com',
            },
          },
        }
      );

      if (error) {
        toast.error(error.message || 'Payment failed');
      } else if (confirmedPayment.status === 'succeeded') {
        // Webhook will automatically update invoice status
        toast.success('Payment processed successfully!');
        onPaymentSuccess({
          amount: amount,
          payment_method: 'stripe_card',
          reference_number: confirmedPayment.id,
          notes: `Stripe payment processed. Payment ID: ${confirmedPayment.id}`
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if Stripe is properly configured
  if (!stripePromise) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Stripe Not Configured
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
          Please add your Stripe publishable key to the <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">.env</code> file.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left max-w-lg mx-auto">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            <strong>Steps to fix:</strong>
          </p>
          <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Stripe Dashboard</a></li>
            <li>Copy your Test Publishable Key</li>
            <li>Update <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">REACT_APP_STRIPE_PUBLISHABLE_KEY</code> in .env</li>
            <li>Restart the development server</li>
          </ol>
        </div>
        <button
          onClick={onCancel}
          className="mt-6 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Use Different Payment Method
        </button>
      </div>
    );
  }

  if (!paymentSetup) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Checking payment setup...</p>
      </div>
    );
  }

  if (!paymentSetup.onboarding_complete) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCardIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Payment Processing Not Set Up
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You need to set up payment processing in the Payments section first.
        </p>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Use Different Payment Method
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Client Email (for receipt)
        </label>
        <input
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          placeholder={invoice.client?.email || "client@example.com"}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-gray-900 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 font-medium"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <CreditCardIcon className="w-4 h-4 inline mr-2" />
          Card Information
        </label>
        <div className="space-y-4">
          <div className="relative">
            <div className="p-4 pr-28 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:border-primary-300 dark:hover:border-primary-500 focus-within:border-primary-500 dark:focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-500/10 dark:focus-within:ring-primary-400/20 transition-all duration-300 hover:shadow-lg dark:hover:shadow-2xl">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#1f2937',
                      backgroundColor: 'transparent',
                      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontWeight: '500',
                      letterSpacing: '0.025em',
                      lineHeight: '24px',
                      '::placeholder': {
                        color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                        fontWeight: '400',
                      },
                      ':-webkit-autofill': {
                        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#1f2937',
                      },
                    },
                    invalid: {
                      color: '#ef4444',
                      iconColor: '#ef4444',
                    },
                    complete: {
                      color: '#10b981',
                      iconColor: '#10b981',
                    },
                  },
                  hidePostalCode: true,
                }}
              />
            </div>
            <div className="absolute top-3 right-3 flex space-x-1.5">
              <div className="w-8 h-5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-md text-white text-xs flex items-center justify-center font-bold shadow-sm">
                VISA
              </div>
              <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-orange-500 dark:from-red-400 dark:to-orange-400 rounded-md text-white text-xs flex items-center justify-center font-bold shadow-sm">
                MC
              </div>
              <div className="w-8 h-5 bg-gradient-to-r from-emerald-500 to-green-500 dark:from-emerald-400 dark:to-green-400 rounded-md text-white text-xs flex items-center justify-center font-bold shadow-sm">
                AE
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-2">
            <span>Card number, expiry, and CVC are all in one field above</span>
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 flex items-center bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <svg className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">256-bit SSL encryption</span>
          <span className="mx-2">•</span>
          <span>PCI DSS compliant</span>
        </p>
      </div>

      <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50 dark:from-primary-900/30 dark:via-blue-900/20 dark:to-indigo-900/20 p-5 rounded-2xl border border-primary-200 dark:border-primary-700/50 shadow-lg dark:shadow-primary-900/20">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 dark:from-primary-400 dark:to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-primary-900 dark:text-primary-100 mb-3 flex items-center">
              Payment Breakdown
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 rounded-full">
                SECURE
              </span>
            </h4>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center py-2 border-b border-primary-200/50 dark:border-primary-700/50">
                <span className="text-primary-700 dark:text-primary-300 font-medium">Total Charge:</span>
                <span className="font-bold text-lg text-primary-900 dark:text-primary-100">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-primary-200/50 dark:border-primary-700/50">
                <span className="text-primary-700 dark:text-primary-300 font-medium">You Receive:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">${(amount * 0.98).toFixed(2)}</span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                    98%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-primary-600 dark:text-primary-400 text-sm">Platform Fee (2%):</span>
                <span className="text-primary-700 dark:text-primary-300 font-medium">${(amount * 0.02).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 pt-8">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-500/20 dark:focus:ring-gray-400/20 transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <div className="flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </div>
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-6 py-4 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 dark:from-emerald-500 dark:via-green-500 dark:to-emerald-600 border border-transparent rounded-xl hover:from-emerald-700 hover:via-green-700 hover:to-emerald-800 dark:hover:from-emerald-600 dark:hover:via-green-600 dark:hover:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-emerald-500/30 dark:focus:ring-emerald-400/30 shadow-xl hover:shadow-2xl disabled:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:active:scale-100"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-base">Processing Payment...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-base">Secure Charge ${amount.toFixed(2)}</span>
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

const PaymentModal = ({ isOpen, onClose, invoice, onPaymentRecorded }) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: '',
    payment_method: '',
    reference_number: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethods = [
    {
      value: 'cash',
      label: 'Cash',
      icon: BanknotesIcon,
      description: 'Record cash payment'
    },
    {
      value: 'check',
      label: 'Check',
      icon: CheckIcon,
      description: 'Record check payment'
    },
    {
      value: 'bank_transfer',
      label: 'Bank Transfer',
      icon: BuildingLibraryIcon,
      description: 'Record wire/ACH transfer'
    },
    {
      value: 'stripe_card',
      label: 'Credit Card',
      icon: CreditCardIcon,
      description: 'Process card payment with Stripe'
    }
  ];

  useEffect(() => {
    if (isOpen && invoice) {
      // Reset state when modal opens
      setSelectedMethod('');
      setFormData({
        amount: invoice.amountDue || '',
        payment_date: new Date().toISOString().split('T')[0],
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

  const handleStripePaymentSuccess = async (paymentData) => {
    // Record the successful payment in the invoice system
    const recordData = {
      ...formData,
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      reference_number: paymentData.reference_number,
      notes: paymentData.notes
    };

    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoice.id}/record_payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(recordData)
      });

      if (response.ok) {
        const savedPayment = await response.json();
        onPaymentRecorded(savedPayment);
        onClose();
      } else {
        toast.error('Payment processed but failed to record in system');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Payment processed but failed to record in system');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    


    try {
      
      const response = await fetch(`${API_BASE_URL}/invoices/${invoice.id}/record_payment/`, {
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

        {/* Payment Method Selection or Payment Form */}
        <div className="p-6">
          {!selectedMethod ? (
            // Payment Method Selection Screen
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Payment Method
              </h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <button
                      key={method.value}
                      onClick={() => setSelectedMethod(method.value)}
                      className="w-full flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <IconComponent className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="ml-4 text-left">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          {method.label}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {method.description}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : selectedMethod === 'stripe_card' ? (
            // Stripe Card Payment Form
            <div>
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setSelectedMethod('')}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Credit Card Payment
                </h3>
              </div>

              {stripePromise ? (
                <Elements stripe={stripePromise}>
                  <StripeCardPayment
                    amount={parseFloat(formData.amount)}
                    invoice={invoice}
                    onPaymentSuccess={handleStripePaymentSuccess}
                    onCancel={() => setSelectedMethod('')}
                  />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <div className="text-red-600 dark:text-red-400 mb-4">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-lg font-medium">Stripe Configuration Error</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Unable to load payment processor. Please check your configuration.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMethod('')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Traditional Payment Form
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center mb-6">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('')}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {paymentMethods.find(m => m.value === selectedMethod)?.label} Payment
                </h3>
              </div>

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
                  onClick={() => setSelectedMethod('')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={() => setFormData(prev => ({ ...prev, payment_method: selectedMethod }))}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;