import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CheckIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import subscriptionService from '../../services/subscriptionService';
import billingService from '../../services/billingService';
import { toast } from 'react-toastify';

const UpgradeModal = ({ isOpen, onClose, currentUsage, limit, resourceType = 'clients' }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingPlan, setProcessingPlan] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const result = await subscriptionService.getPlans();
      console.log('Fetched plans:', result);

      // Filter out free tier and only show paid plans
      let paidPlans = [];
      if (Array.isArray(result)) {
        paidPlans = result.filter(plan => plan.interval !== 'free');
      } else if (result.results && Array.isArray(result.results)) {
        paidPlans = result.results.filter(plan => plan.interval !== 'free');
      }

      console.log('Paid plans:', paidPlans);
      setPlans(paidPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    setProcessingPlan(plan.id);
    try {
      // Create Stripe checkout session
      const result = await billingService.createCheckoutSession(plan.id);

      if (result.checkout_url) {
        // Redirect to Stripe checkout
        window.location.href = result.checkout_url;
      } else {
        toast.error('Failed to create checkout session');
        setProcessingPlan(null);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout. Please try again.');
      setProcessingPlan(null);
    }
  };

  const resourceLabels = {
    clients: 'clients',
    invoice: 'invoices',
    estimate: 'estimates',
  };

  const resourceLabel = resourceLabels[resourceType] || resourceType;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-8 text-white">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <RocketLaunchIcon className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Upgrade Your Plan</h2>
                      <p className="text-primary-100 mt-1">
                        You've reached your limit of {limit} {resourceLabel}
                      </p>
                    </div>
                  </div>

                  {/* Usage Bar */}
                  <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Current Usage</span>
                      <span className="text-sm font-bold">{currentUsage} / {limit} {resourceLabel}</span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentUsage / limit) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-white rounded-full shadow-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Plans */}
                <div className="px-8 py-8">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
                      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading plans...</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          Choose Your Perfect Plan
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Unlock unlimited {resourceLabel} and more features
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan, index) => (
                          <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative rounded-xl border-2 p-6 transition-all ${
                              plan.interval === 'monthly'
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-xl scale-105'
                                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                            }`}
                          >
                            {plan.interval === 'monthly' && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <span className="inline-flex items-center gap-1 px-4 py-1 bg-gradient-to-r from-primary-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg">
                                  <SparklesIcon className="h-3 w-3" />
                                  POPULAR
                                </span>
                              </div>
                            )}

                            <div className="text-center mb-6">
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {plan.name}
                              </h4>
                              <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                  ${parseFloat(plan.price).toFixed(2)}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  /{plan.interval}
                                </span>
                              </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-6">
                              {plan.features && plan.features.length > 0 ? (
                                plan.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      {feature}
                                    </span>
                                  </li>
                                ))
                              ) : (
                                <>
                                  <li className="flex items-start gap-2">
                                    <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      Unlimited {resourceLabel}
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      Unlimited invoices & estimates
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      Priority support
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      Advanced analytics
                                    </span>
                                  </li>
                                </>
                              )}
                            </ul>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleUpgrade(plan)}
                              disabled={processingPlan === plan.id}
                              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
                                plan.interval === 'monthly'
                                  ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700'
                                  : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                              } ${processingPlan === plan.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              {processingPlan === plan.id ? (
                                <>
                                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CreditCardIcon className="h-5 w-5" />
                                  Upgrade Now
                                </>
                              )}
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>

                      {/* Benefits Section */}
                      <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <SparklesIcon className="h-5 w-5 text-primary-500" />
                          What You'll Get
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                              <CheckIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">No Limits</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Create unlimited clients, invoices, and estimates
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                              <CheckIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">Premium Support</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Get priority email and chat support
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                              <CheckIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">Advanced Features</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Access to all premium features and integrations
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                              <CheckIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">Cancel Anytime</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                No long-term commitments, cancel whenever you want
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Questions? Contact us at{' '}
                    <a href="mailto:support@invoiceapp.com" className="text-primary-600 hover:text-primary-700 font-medium">
                      support@invoiceapp.com
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
