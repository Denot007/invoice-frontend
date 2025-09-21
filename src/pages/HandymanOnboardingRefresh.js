import React from 'react';
import { marketplaceService } from '../services/marketplaceService';

const HandymanOnboardingRefresh = () => {
  const handleRetry = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const accountId = urlParams.get('account');

      if (accountId) {
        const result = await marketplaceService.refreshOnboardingLink(accountId);
        if (result.onboarding_url) {
          window.location.href = result.onboarding_url;
        }
      } else {
        alert('Account ID not found. Please contact support.');
      }
    } catch (error) {
      console.error('Error refreshing onboarding:', error);
      alert('Failed to refresh onboarding link. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Setup Incomplete</h1>

          <p className="text-gray-600 mb-8">
            Your Stripe account setup is not complete. Please continue the onboarding process to start receiving payments.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-amber-900 mb-2">Required Information</h3>
            <ul className="text-left text-sm text-amber-800 space-y-2">
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>Business type and information</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>Bank account details for payouts</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>Identity verification</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>Tax information</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue Setup
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Return Home
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Having trouble? Contact support at support@invoicegear.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default HandymanOnboardingRefresh;