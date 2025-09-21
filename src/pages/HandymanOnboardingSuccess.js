import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '../services/marketplaceService';

const HandymanOnboardingSuccess = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Get handyman email from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const accountId = urlParams.get('account');

        if (accountId) {
          const result = await marketplaceService.verifyOnboarding(accountId);
          setStatus(result);
        }
      } catch (error) {
        console.error('Error checking onboarding:', error);
      }
      setLoading(false);
    };

    checkOnboardingStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome Aboard!</h1>

          <p className="text-gray-600 mb-8">
            Your Stripe account has been successfully set up. You're now ready to receive payments through our platform.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-left text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Clients can now select you for services</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>You'll receive $294 for each $300 service</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Payments are transferred automatically to your bank</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/handyman/dashboard')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => window.location.href = 'https://dashboard.stripe.com/express/accounts'}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              View Stripe Dashboard
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Need help? Contact support at support@invoicegear.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default HandymanOnboardingSuccess;