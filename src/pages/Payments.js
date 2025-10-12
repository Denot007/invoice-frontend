import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { marketplaceService } from '../services/marketplaceService';
import CollectPaymentModal from '../components/payments/CollectPaymentModal';

const Payments = () => {
  const { user } = useAuth();
  const [paymentSetup, setPaymentSetup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCollectModal, setShowCollectModal] = useState(false);

  useEffect(() => {
    checkPaymentSetup();
  }, [user]);

  const checkPaymentSetup = async () => {
    if (!user?.email) return;

    try {
      // Check if user has a handyman account
      const handymen = await marketplaceService.listHandymen();
      const userHandyman = handymen.handymen.find(h => h.user__email === user.email);

      if (userHandyman) {
        // This call will automatically check and update the onboarding status
        const dashboardData = await marketplaceService.getHandymanDashboard(userHandyman.id);
        setPaymentSetup(dashboardData);
      } else {
        setPaymentSetup(null);
      }
    } catch (error) {
      console.error('Error checking payment setup:', error);
    }
    setLoading(false);
  };

  const refreshStatus = async () => {
    setLoading(true);
    await checkPaymentSetup();
  };

  const setupPaymentAccount = async () => {
    setSetupLoading(true);
    setMessage('');

    try {
      const result = await marketplaceService.createHandymanAccount(user.email);
      setMessage({
        type: 'success',
        text: `Payment account created! Check your email (${user.email}) for setup instructions.`
      });

      // Refresh status after a moment
      setTimeout(() => {
        checkPaymentSetup();
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to create payment account'
      });
    }
    setSetupLoading(false);
  };

  const resendSetupEmail = async () => {
    setSetupLoading(true);
    setMessage('');

    try {
      // Re-trigger the account creation which will resend the email
      const result = await marketplaceService.createHandymanAccount(user.email);
      setMessage({
        type: 'success',
        text: `Setup email resent! Check your inbox at ${user.email}`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to resend setup email'
      });
    }
    setSetupLoading(false);
  };

  const openStripeDashboard = async () => {
    if (!paymentSetup?.handyman_id) {
      setMessage({
        type: 'error',
        text: 'No payment account found'
      });
      return;
    }

    try {
      const result = await marketplaceService.createExpressLoginLink(paymentSetup.handyman_id);
      window.open(result.url, '_blank');
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Unable to open Stripe dashboard. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show setup instructions after account is created but before onboarding is complete
  // Only show if stripe_account_id exists (account was actually created)
  const showSetupInstructions = paymentSetup && paymentSetup.stripe_account_id && !paymentSetup.onboarding_complete;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Setup</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Enable payment processing to receive money for your services
          </p>
        </div>
        <button
          onClick={() => setShowCollectModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Collect Payment</span>
        </button>
      </div>

      {/* Payment Status Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-5">
          {!paymentSetup || !paymentSetup.stripe_account_id ? (
            // Step 1: Initial activation button (show if no handyman record OR no stripe_account_id)
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Start Receiving Payments
              </h3>

              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto text-lg">
                Activate your account to accept credit card payments from clients directly. It only takes a couple minutes to set up!
              </p>

              <button
                onClick={setupPaymentAccount}
                disabled={setupLoading}
                className={`inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-lg text-white shadow-lg transition-all duration-200 ${
                  setupLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {setupLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Activating Payment Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Activate Payments
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                No setup fees • Secure processing by Stripe • Get paid directly
              </p>
            </div>
          ) : showSetupInstructions ? (
            // Step 2: Setup instructions after account creation
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Check Your Email!
              </h3>

              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                We've sent setup instructions to <strong>{user.email}</strong>
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6 max-w-lg mx-auto text-left">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Next Steps
                </h4>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <li className="flex items-start">
                    <span className="font-bold mr-2 mt-0.5">1.</span>
                    <span>Check your email inbox (and spam folder)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2 mt-0.5">2.</span>
                    <span>Click the secure link from Stripe</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2 mt-0.5">3.</span>
                    <span>Complete your business and banking information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2 mt-0.5">4.</span>
                    <span>Return here to see your payment dashboard</span>
                  </li>
                </ol>
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={resendSetupEmail}
                  disabled={setupLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {setupLoading ? 'Sending...' : 'Resend Email'}
                </button>

                <button
                  onClick={refreshStatus}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Status
                </button>

                <button
                  onClick={openStripeDashboard}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open Stripe Dashboard
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Account ID:</strong> {paymentSetup.handyman_id} • Save this for your records
                </p>
              </div>
            </div>
          ) : (
            // Already set up and active
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Payment Processing Active
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your account is ready to receive payments
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={openStripeDashboard}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Stripe Dashboard
                  </button>
                  <button
                    onClick={refreshStatus}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${(paymentSetup.total_earnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${(paymentSetup.pending_payouts || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {paymentSetup.completed_jobs || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payout Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        98%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Payments Section */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Payments</h3>

                {paymentSetup.recent_payments && paymentSetup.recent_payments.length > 0 ? (
                  <div className="space-y-3">
                    {paymentSetup.recent_payments.slice(0, 5).map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Payment Received
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(payment.date * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            +${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {payment.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">No payments yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Your payments will appear here once you start receiving them
                    </p>
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Account ID:</strong> {paymentSetup.handyman_id || paymentSetup.stripe_account_id}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      <strong>Onboarding Status:</strong> {paymentSetup.onboarding_complete ? 'Complete' : 'Incomplete'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-5">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            How Payment Processing Works
          </h3>

          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">1</span>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Set Up Your Account</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click "Enable Payment Processing" to create your Stripe account and receive setup instructions via email.
                </p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">2</span>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Complete Verification</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Provide your business information, bank details, and tax information through Stripe's secure platform.
                </p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">3</span>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Start Receiving Payments</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Once verified, you'll automatically receive $294 for every $300 service, transferred directly to your bank.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collect Payment Modal */}
      <CollectPaymentModal
        isOpen={showCollectModal}
        onClose={() => setShowCollectModal(false)}
        onPaymentSuccess={() => {
          setShowCollectModal(false);
          checkPaymentSetup(); // Refresh payment data
        }}
      />
    </div>
  );
};

export default Payments;