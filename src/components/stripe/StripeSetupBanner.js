import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, CreditCardIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { marketplaceService } from '../../services/marketplaceService';
import { toast } from 'react-toastify';

const StripeSetupBanner = ({ compact = false }) => {
  const navigate = useNavigate();
  const [stripeStatus, setStripeStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    checkStripeStatus();
  }, []);

  const checkStripeStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const response = await axios.get(`${apiUrl}/marketplace/handymen/`, {
        headers: { Authorization: `Bearer ${token}` },
        // Prevent caching
        params: { _t: Date.now() }
      });

      console.log('Stripe Status Check:', response.data);

      if (response.data.handymen && response.data.handymen.length > 0) {
        const handyman = response.data.handymen[0];
        console.log('Handyman data:', handyman);
        console.log('  - Has account:', !!handyman.stripe_account_id);
        console.log('  - Onboarding complete:', handyman.onboarding_complete);

        setStripeStatus({
          hasAccount: !!handyman.stripe_account_id,
          onboardingComplete: handyman.onboarding_complete,
          handymanId: handyman.id
        });
      } else {
        console.log('No handyman records found');
        setStripeStatus({
          hasAccount: false,
          onboardingComplete: false,
          handymanId: null
        });
      }
    } catch (error) {
      console.error('Failed to check Stripe status:', error);
      setStripeStatus({
        hasAccount: false,
        onboardingComplete: false,
        handymanId: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetupClick = async () => {
    setSetupLoading(true);

    try {
      // Get user email from token
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('token');
      const userResponse = await axios.get(`${apiUrl}/accounts/profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userEmail = userResponse.data.email;

      // Call API to create handyman account and send email
      await marketplaceService.createHandymanAccount(userEmail);

      toast.success(`Setup email sent to ${userEmail}! Check your inbox to complete activation.`, {
        position: 'top-right',
        autoClose: 5000,
      });

      // Refresh status after a moment
      setTimeout(() => {
        checkStripeStatus();
      }, 2000);

    } catch (error) {
      console.error('Setup error:', error);
      toast.error(error.response?.data?.error || 'Failed to send setup email. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setSetupLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in localStorage (expires after 24 hours)
    const dismissalData = {
      timestamp: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    localStorage.setItem('stripe_banner_dismissed', JSON.stringify(dismissalData));
  };

  // Check if banner was previously dismissed
  useEffect(() => {
    const dismissalData = localStorage.getItem('stripe_banner_dismissed');
    if (dismissalData) {
      try {
        const data = JSON.parse(dismissalData);
        if (Date.now() < data.expires) {
          setDismissed(true);
        } else {
          localStorage.removeItem('stripe_banner_dismissed');
        }
      } catch (e) {
        localStorage.removeItem('stripe_banner_dismissed');
      }
    }
  }, []);

  // Show loading state
  if (loading) {
    return null;
  }

  // Don't show if dismissed
  if (dismissed) {
    return null;
  }

  // Don't show if Stripe is fully set up
  if (stripeStatus?.hasAccount && stripeStatus?.onboardingComplete) {
    console.log('✅ Stripe fully configured - hiding banner');
    return null;
  }

  console.log('⚠️ Showing banner - Stripe status:', stripeStatus);

  // Compact version (for invoice pages, etc.)
  if (compact) {
    return (
      <div className="mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-400 p-3 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Payment receiving disabled
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                Set up Stripe to accept credit card payments from clients
              </p>
            </div>
          </div>
          <button
            onClick={handleSetupClick}
            disabled={setupLoading}
            className="ml-4 px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {setupLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              <span>Set Up Now</span>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Full banner version (for dashboard)
  return (
    <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 relative">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <CreditCardIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">
              🚀 Start Receiving Payments
            </h3>
            <p className="text-white/90 mb-4 max-w-2xl">
              Activate your account to accept credit card payments from clients directly. It only takes a couple minutes to set up!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white/90">No setup fees</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white/90">Secure processing by Stripe</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white/90">Get paid directly</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSetupClick}
                disabled={setupLoading}
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 animate-pulse hover:animate-none flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {setupLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending Email...</span>
                  </>
                ) : (
                  <span>Activate Payments</span>
                )}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-3 text-white/80 hover:text-white font-medium transition-colors"
              >
                Remind me later
              </button>
            </div>
          </div>
        </div>

        {/* Decorative background pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#ffffff"
              d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.3C64.8,55.4,53.8,67,40.6,74.3C27.4,81.6,12,84.6,-3.4,90.1C-18.8,95.6,-37.6,103.6,-52.4,97.4C-67.2,91.2,-78,70.8,-84.5,51.8C-91,32.8,-93.2,15.2,-91.8,-1.9C-90.4,-19,-85.4,-35.6,-76.8,-50.1C-68.2,-64.6,-56,-77,-42.1,-84.6C-28.2,-92.2,-12.6,-95,0.8,-96.4C14.2,-97.8,30.6,-83.6,44.7,-76.4Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StripeSetupBanner;
