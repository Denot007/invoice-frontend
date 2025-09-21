import React, { useState } from 'react';
import { marketplaceService } from '../services/marketplaceService';

const HandymanSignup = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [handymanId, setHandymanId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await marketplaceService.createHandymanAccount(email);
      setHandymanId(result.handyman_id);
      setMessage({
        type: 'success',
        text: `Account created successfully! Your Handyman ID is ${result.handyman_id}. Please check your email for the setup link.`
      });
      setEmail('');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }

    setLoading(false);
  };

  if (handymanId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h1>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-900 font-semibold mb-2">Your Handyman ID: <span className="font-mono text-lg">{handymanId}</span></p>
              <p className="text-blue-800 text-sm">Please save this ID for future reference.</p>
            </div>

            <p className="text-gray-600 mb-6">
              We've sent an email to <strong>{email}</strong> with a link to complete your Stripe account setup.
              This is required before you can receive payments.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-900 mb-2">Next Steps</h3>
              <ol className="text-left text-sm text-amber-800 space-y-1">
                <li>1. Check your email inbox (and spam folder)</li>
                <li>2. Click the Stripe onboarding link</li>
                <li>3. Complete your business and banking information</li>
                <li>4. Start receiving payments!</li>
              </ol>
            </div>

            <div className="space-y-3">
              <a
                href={`/handyman/dashboard?id=${handymanId}`}
                className="w-full inline-block bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Your Dashboard
              </a>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Register Another Handyman
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Need help? Contact support at support@invoicegear.com
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join as a Handyman</h1>
            <p className="text-gray-600">Create your account and start earning with our platform</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">What You'll Get</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <span>$294 per $300 service (98% payout)</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <span>Direct bank transfers via Stripe</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <span>Professional payment processing</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <span>Dashboard to track earnings</span>
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                You'll receive setup instructions at this email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create My Account'
              )}
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="mt-8 text-center">
            <a
              href="/marketplace-payment"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Admin? Go to Management Panel →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandymanSignup;