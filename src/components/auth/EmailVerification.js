import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';

const EmailVerification = ({ email, onBackToLogin, onVerificationSuccess }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/accounts/email-verification/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Email verified successfully!');
        onVerificationSuccess();
      } else {
        toast.error(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      const response = await fetch('http://localhost:8000/api/accounts/email-verification/resend/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('New verification code sent!');
        setCountdown(60); // 1 minute countdown
        setVerificationCode('');
      } else {
        toast.error(data.error || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
          <p className="text-gray-300 text-sm">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-blue-300 font-medium">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-white mb-2">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-lg tracking-wider placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              placeholder="000000"
            />
            <p className="text-xs text-gray-400 mt-1 text-center">
              Code expires in 15 minutes
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending || countdown > 0}
            className="text-sm text-gray-300 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
            <span>
              {countdown > 0 
                ? `Resend code in ${countdown}s` 
                : isResending 
                  ? 'Sending...' 
                  : 'Didn\'t receive the code? Resend'
              }
            </span>
          </button>
          
          <button
            onClick={onBackToLogin}
            className="w-full flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EmailVerification;