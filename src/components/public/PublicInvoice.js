import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RaJzwPwZVx974bpnQjLrYMHtjZkO3RNcr2ztUYgWPmDYa7QOQJ4CtEPLY5cZQwwUZSQp5l0Fk7I3JiGArvPvvRB00SJfLwcY5');

const PaymentForm = ({ invoice, token, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const { data } = await axios.post(`${API_BASE_URL}/invoices/public/${token}/payment-intent/`);

      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        // Manually record payment (fallback for localhost without webhooks)
        try {
          await axios.post(`${API_BASE_URL}/invoices/public/${token}/record-payment/`, {
            payment_intent_id: paymentIntent.id
          });
        } catch (recordError) {
          console.warn('Failed to record payment manually, webhook will handle it:', recordError);
        }
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <CardElement options={cardElementOptions} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
      >
        {processing ? 'Processing...' : `Pay $${parseFloat(invoice.balance_due).toFixed(2)}`}
      </button>

      <p className="text-xs text-center text-gray-500 mt-2">
        🔒 Secure payment powered by Stripe
      </p>
    </form>
  );
};

const PublicInvoice = () => {
  const { token } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [token]);

  const fetchInvoice = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/invoices/public/${token}/`);
      if (response.data.success) {
        setInvoice(response.data.invoice);
      } else {
        setError('Invoice not found');
      }
    } catch (err) {
      setError('Failed to load invoice. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setShowPaymentForm(false);
    // Refresh invoice data
    fetchInvoice();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-center mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Invoice Not Found</h2>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Invoice Header */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold">Invoice</h1>
            <p className="text-blue-100 mt-2">From {invoice.provider_name}</p>
          </div>

          {/* Invoice Details */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase">Bill To</h3>
                <p className="text-lg font-semibold text-gray-900 mt-1">{invoice.client_name}</p>
                <p className="text-gray-600">{invoice.client_email}</p>
              </div>
              <div className="text-left md:text-right">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Invoice Number</p>
                  <p className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Issue Date</p>
                  <p className="text-gray-900">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="text-gray-900">{new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.item && <div className="font-medium">{item.item}</div>}
                        <div className={item.item ? 'text-gray-500' : ''}>{item.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">${parseFloat(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-end">
                <div className="w-full md:w-1/2">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">${parseFloat(invoice.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tax ({invoice.tax_rate}%)</span>
                    <span className="font-semibold text-gray-900">${parseFloat(invoice.tax_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">
                    <span>Total</span>
                    <span>${parseFloat(invoice.total).toFixed(2)}</span>
                  </div>
                  {invoice.amount_paid > 0 && (
                    <>
                      <div className="flex justify-between mt-2 text-green-600">
                        <span>Paid</span>
                        <span>-${parseFloat(invoice.amount_paid).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-blue-600 mt-2 pt-2 border-t border-gray-200">
                        <span>Balance Due</span>
                        <span>${parseFloat(invoice.balance_due).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            {(invoice.notes || invoice.terms) && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                {invoice.notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Notes</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Terms</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{invoice.terms}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payment Section */}
        {invoice.balance_due > 0 && invoice.status !== 'paid' && !paymentSuccess && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Make a Payment</h2>
            <p className="text-gray-600 mb-6">
              Pay securely online to {invoice.provider_name}
            </p>

            {!showPaymentForm ? (
              <button
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                onClick={() => setShowPaymentForm(true)}
              >
                Pay ${parseFloat(invoice.balance_due).toFixed(2)}
              </button>
            ) : (
              <Elements stripe={stripePromise}>
                <PaymentForm invoice={invoice} token={token} onSuccess={handlePaymentSuccess} />
              </Elements>
            )}
          </div>
        )}

        {(invoice.status === 'paid' || paymentSuccess) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-green-500 mb-2">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              {paymentSuccess ? 'Payment Successful!' : 'Paid in Full'}
            </h3>
            <p className="text-green-700">
              {paymentSuccess ? 'Your payment has been processed successfully.' : 'This invoice has been paid. Thank you!'}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Questions about this invoice? Contact {invoice.provider_email}</p>
          <p className="mt-2">Powered by InvoiceGear</p>
        </div>
      </div>
    </div>
  );
};

export default PublicInvoice;
