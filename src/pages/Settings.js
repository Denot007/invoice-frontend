import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  SparklesIcon,
  ArrowPathIcon,
  XMarkIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';
import billingService from '../services/billingService';
import TemplateManager from '../components/templates/TemplateManager';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('billing');
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutInitiated, setCheckoutInitiated] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadBillingData();
    checkSubscriptionError();
  }, []);

  // Check for subscription error from API redirect
  const checkSubscriptionError = () => {
    const errorData = localStorage.getItem('subscription_error');
    if (errorData) {
      try {
        const error = JSON.parse(errorData);
        // Only show error if it's recent (within last 5 minutes)
        const isRecent = Date.now() - error.timestamp < 5 * 60 * 1000;
        
        if (isRecent) {
          setSubscriptionError(error);
          setShowSubscriptionModal(true);
          toast.error(error.message);
        }
        
        // Clear the error data
        localStorage.removeItem('subscription_error');
      } catch (e) {
        console.error('Error parsing subscription error:', e);
        localStorage.removeItem('subscription_error');
      }
    }
  };

  // Auto-sync when returning from checkout
  useEffect(() => {
    // Check if user returned from Stripe checkout
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    const canceled = urlParams.get('canceled');
    
    // Check if checkout was previously initiated
    const checkoutWasInitiated = localStorage.getItem('invoicify_checkout_initiated');
    
    // Check if any checkout-related URL params exist
    const hasCheckoutParams = success || sessionId || canceled;
    
    if (hasCheckoutParams) {
      // Clear the checkout initiated flag regardless
      if (checkoutWasInitiated) {
        localStorage.removeItem('invoicify_checkout_initiated');
      }
      
      // Only auto-sync if checkout was successful
      if (success === 'true' || sessionId) {
        // Auto-sync after a brief delay to ensure Stripe has processed everything
        const syncTimer = setTimeout(async () => {
          try {
            await billingService.syncSubscription();
            toast.success('Subscription automatically synced after checkout');
            
            // Reload billing data
            await loadBillingData();
            
            // Clean up the URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (error) {
            console.error('Auto-sync failed:', error);
            toast.error('Auto-sync failed. Please click Sync Status manually.');
          }
        }, 2000); // 2 second delay

        return () => clearTimeout(syncTimer);
      } else if (canceled === 'true') {
        // Just clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    
    // Also check when component becomes visible after being hidden
    const handleVisibilityChange = () => {
      if (!document.hidden && checkoutWasInitiated) {
        // User returned to the tab, auto-sync
        console.log('Tab became visible after checkout, auto-syncing...');
        localStorage.removeItem('invoicify_checkout_initiated');
        
        setTimeout(async () => {
          try {
            await billingService.syncSubscription();
            toast.success('Subscription automatically synced');
            loadBillingData();
          } catch (error) {
            console.error('Auto-sync failed:', error);
            toast.error('Auto-sync failed. Please click Sync Status manually.');
          }
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Track when user initiates checkout
  useEffect(() => {
    if (checkoutInitiated) {
      localStorage.setItem('invoicify_checkout_initiated', 'true');
      setCheckoutInitiated(false); // Reset the state
    }
  }, [checkoutInitiated]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [subscriptionData, plansData] = await Promise.all([
        billingService.getCurrentSubscription(),
        billingService.getPlans()
      ]);
      
      setSubscription(subscriptionData);
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      // Mark that checkout has been initiated
      setCheckoutInitiated(true);
      localStorage.setItem('invoicify_checkout_initiated', 'true');
      
      const response = await billingService.createCheckoutSession(planId);
      
      if (response.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = response.checkout_url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout process');
      // Remove the checkout flag if checkout creation failed
      localStorage.removeItem('invoicify_checkout_initiated');
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await billingService.getBillingPortal();
      if (response.portal_url) {
        window.open(response.portal_url, '_blank');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Failed to open billing portal');
    }
  };

  const handleSyncSubscription = async () => {
    try {
      const _response = await billingService.syncSubscription();
      toast.success('Subscription synced successfully');
      // Reload billing data
      loadBillingData();
    } catch (error) {
      console.error('Error syncing subscription:', error);
      toast.error('Failed to sync subscription');
    }
  };

  const handleExpireTrial = async () => {
    try {
      await billingService.expireTrial();
      toast.success('Trial expired for testing. Try navigating to another page to see the blocking.');
      // Reload billing data to show expired status
      loadBillingData();
    } catch (error) {
      console.error('Error expiring trial:', error);
      toast.error('Failed to expire trial');
    }
  };

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  const confirmCancelSubscription = async () => {
    try {
      const response = await billingService.cancelSubscription();
      toast.success(response.message || 'Subscription canceled successfully');
      setShowCancelModal(false);
      // Reload billing data to show updated status
      loadBillingData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const handleRestoreSubscription = async () => {
    try {
      const response = await billingService.restoreSubscription();
      toast.success(response.message || 'Subscription restored successfully');
      // Reload billing data to show updated status
      loadBillingData();
    } catch (error) {
      console.error('Error restoring subscription:', error);
      toast.error('Failed to restore subscription');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'trialing': { color: 'bg-blue-100 text-blue-800', text: 'Free Trial', icon: SparklesIcon },
      'active': { color: 'bg-green-100 text-green-800', text: 'Active', icon: CheckCircleIcon },
      'past_due': { color: 'bg-red-100 text-red-800', text: 'Past Due', icon: ExclamationTriangleIcon },
      'canceled': { color: 'bg-gray-100 text-gray-800', text: 'Canceled', icon: ExclamationTriangleIcon },
      'unpaid': { color: 'bg-red-100 text-red-800', text: 'Unpaid', icon: ExclamationTriangleIcon },
    };
    
    const badge = badges[status] || badges['trialing'];
    const IconComponent = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Settings
          </h2>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'billing'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <CreditCardIcon className="h-4 w-4 mr-2" />
            Billing & Subscription
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <PaintBrushIcon className="h-4 w-4 mr-2" />
            Invoice Templates
          </button>
          <button
            onClick={() => setActiveTab('estimate-templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'estimate-templates'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <PaintBrushIcon className="h-4 w-4 mr-2" />
            Estimate Templates
          </button>
        </nav>
      </div>

      {/* Invoice Templates Tab Content */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Invoice Templates
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Manage templates for invoices. Create, edit, and set default templates.
            </p>
          </div>
          <TemplateManager isOpen={true} onClose={() => {}} inline={true} templateType="invoice" />
        </div>
      )}

      {/* Estimate Templates Tab Content */}
      {activeTab === 'estimate-templates' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Estimate Templates
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Manage templates for estimates. Create beautiful estimate layouts with watermarks and custom designs.
            </p>
          </div>
          <TemplateManager isOpen={true} onClose={() => {}} inline={true} templateType="estimate" />
        </div>
      )}

      {/* Billing Tab Content */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Current Subscription Status */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Current Subscription
              </h3>
              
              {subscription && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {subscription.plan?.name || 'Free Trial'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {subscription.plan ? `$${subscription.plan.price}/${subscription.plan.interval}` : 'No charge during trial'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(subscription.status)}
                  </div>

                  {subscription.is_in_trial && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <SparklesIcon className="h-5 w-5 text-blue-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Free Trial Active
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {subscription.days_remaining_in_trial} days remaining in your free trial
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {subscription.trial_expired && subscription.status === 'trialing' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-red-900 dark:text-red-100">
                            Trial Expired
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Your free trial has ended. Please choose a plan to continue using InvoiciFy.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {subscription.is_canceled && subscription.status === 'canceled' && (
                    <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <XMarkIcon className="h-5 w-5 text-gray-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Subscription Canceled
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Your subscription has been canceled. You can restore it or choose a new plan.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {subscription.is_pending_cancellation && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-orange-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                            Subscription Set to Cancel
                          </p>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Your subscription will be canceled at the end of your current billing period. You can restore it anytime before then.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    {subscription.plan && !subscription.is_canceled && (
                      <>
                        {/* Only show Manage Billing for paid subscriptions with Stripe integration */}
                        {subscription.status === 'active' && (
                          <button
                            onClick={handleManageBilling}
                            className="btn-secondary flex items-center"
                          >
                            <CreditCardIcon className="h-4 w-4 mr-2" />
                            Manage Billing
                          </button>
                        )}
                        <button
                          onClick={handleCancelSubscription}
                          className="btn-secondary flex items-center text-red-600 border-red-300 hover:bg-red-50"
                          title="Cancel your subscription"
                        >
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          Cancel Plan
                        </button>
                      </>
                    )}
                    {subscription.is_canceled && (
                      <button
                        onClick={handleRestoreSubscription}
                        className="btn-secondary flex items-center text-green-600 border-green-300 hover:bg-green-50"
                        title="Restore your subscription"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Restore Subscription
                      </button>
                    )}
                    <button
                      onClick={handleSyncSubscription}
                      className="btn-secondary flex items-center"
                      title="Sync subscription status from Stripe"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Sync Status
                    </button>
                    {/* Development Test Button */}
                    {process.env.NODE_ENV === 'development' && (
                      <button
                        onClick={handleExpireTrial}
                        className="btn-secondary flex items-center text-red-600 border-red-300 hover:bg-red-50"
                        title="Test subscription blocking (Development only)"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                        Test Expire Trial
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Available Plans */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg" data-plans-section>
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                {subscription?.plan ? 'Change Plan' : 'Choose Your Plan'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const isCurrentPlan = subscription?.plan?.id === plan.id;
                  const isRecommended = plan.interval === 'monthly';
                  
                  return (
                    <div
                      key={plan.id}
                      className={`border rounded-lg p-6 relative ${
                        isRecommended
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600'
                      } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
                    >
                      {isRecommended && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                            Recommended
                          </span>
                        </div>
                      )}
                      
                      {isCurrentPlan && (
                        <div className="absolute -top-3 right-4">
                          <span className="bg-green-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                            Current Plan
                          </span>
                        </div>
                      )}

                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {plan.name}
                        </h4>
                        <div className="mt-2 mb-4">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(plan.price)}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            /{plan.interval}
                          </span>
                        </div>

                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        {!isCurrentPlan && (
                          <button
                            onClick={() => handleUpgrade(plan.id)}
                            className={`w-full ${
                              isRecommended
                                ? 'btn-primary'
                                : 'btn-secondary'
                            }`}
                          >
                            {subscription?.plan ? 'Switch Plan' : 'Get Started'}
                          </button>
                        )}
                        
                        {isCurrentPlan && (
                          <div className="text-center text-sm text-green-600 dark:text-green-400 font-medium">
                            ✓ This is your current plan
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Subscription Required Modal */}
      {showSubscriptionModal && subscriptionError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-white mr-2" />
                  <h3 className="text-lg font-semibold text-white">
                    {subscriptionError.trial_expired ? 'Trial Expired' : 'Subscription Required'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {subscriptionError.message}
                </p>
                
                {subscriptionError.trial_expired && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <SparklesIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Your 14-day free trial has ended
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Choose a plan below to continue using all InvoiciFy features and access your data.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {subscriptionError.subscription_status && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                          Subscription Status: {subscriptionError.subscription_status}
                        </p>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                          Please update your billing information or choose a new plan to reactivate your account.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowSubscriptionModal(false);
                    setActiveTab('billing');
                    // Scroll to plans section
                    setTimeout(() => {
                      const plansSection = document.querySelector('[data-plans-section]');
                      if (plansSection) {
                        plansSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
                >
                  Choose Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-white mr-2" />
                  <h3 className="text-lg font-semibold text-white">
                    Cancel Subscription
                  </h3>
                </div>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Are you sure you want to cancel your subscription?
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <CalendarIcon className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        You will retain access until the end of your current billing period
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        After that, your subscription will be canceled and you won't be charged again.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={confirmCancelSubscription}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                >
                  Yes, Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;