import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSetupRefresh = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to payments page after a short delay
    const timer = setTimeout(() => {
      navigate('/payments', {
        state: { message: 'Please try setting up your payment account again.' }
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Setup Interrupted
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your payment setup wasn't completed. Don't worry - you can try again from your payments page.
        </p>

        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSetupRefresh;
