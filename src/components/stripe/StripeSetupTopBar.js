import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { marketplaceService } from '../../services/marketplaceService';
import { toast } from 'react-toastify';

const StripeSetupTopBar = () => {
  const navigate = useNavigate();
  const [stripeStatus, setStripeStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    checkStripeStatus();
  }, []);

  const checkStripeStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/marketplace/handymen/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.handymen && response.data.handymen.length > 0) {
        const handyman = response.data.handymen[0];
        setStripeStatus({
          hasAccount: !!handyman.stripe_account_id,
          onboardingComplete: handyman.onboarding_complete,
          handymanId: handyman.id
        });
      } else {
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
      const token = localStorage.getItem('token');
      const userResponse = await axios.get('http://localhost:8000/api/accounts/profile/', {
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

  if (loading) return null;

  // Don't show if Stripe is fully set up
  if (stripeStatus?.hasAccount && stripeStatus?.onboardingComplete) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center animate-bounce">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white text-sm sm:text-base">
                  ⚡ Action Required: Enable Payment Collection
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-white/30 text-white text-xs font-medium rounded-full animate-pulse">
                  2 min setup
                </span>
              </div>
              <p className="text-white/90 text-xs sm:text-sm mt-0.5">
                Complete Stripe Connect setup to accept credit card payments from your clients
              </p>
            </div>
          </div>

          <button
            onClick={handleSetupClick}
            disabled={setupLoading}
            className="ml-4 px-4 sm:px-6 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 whitespace-nowrap transform hover:scale-105 animate-pulse hover:animate-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {setupLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm sm:text-base">Sending...</span>
              </>
            ) : (
              <>
                <span className="text-sm sm:text-base">Activate Payments</span>
                <ArrowRightIcon className="w-4 h-4 animate-bounce" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StripeSetupTopBar;
