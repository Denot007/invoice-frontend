import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import EmailVerification from './EmailVerification';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  SunIcon, 
  MoonIcon, 
  UserIcon, 
  EnvelopeIcon, 
  BuildingOfficeIcon, 
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyAddress: '',
    companyEmail: '',
    companyWebsite: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    const registrationData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      companyName: formData.companyName,
      companyAddress: formData.companyAddress,
      companyEmail: formData.companyEmail,
      companyWebsite: formData.companyWebsite,
      phone: formData.phone,
      confirmPassword: formData.confirmPassword,
    };

    const result = await register(registrationData);

    if (result.success) {
      if (result.verification_required) {
        setUserEmail(formData.email);
        setShowEmailVerification(true);
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  const nextStep = () => {
    if (step === 1) {
      // Validate personal info
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError('Please fill in all personal information');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    setError('');
    setStep(2);
  };

  const prevStep = () => {
    setError('');
    setStep(1);
  };

  const handleVerificationSuccess = () => {
    setShowEmailVerification(false);
    navigate('/login', { 
      state: { 
        message: 'Email verified successfully! You can now log in.',
        email: userEmail
      }
    });
  };

  const handleBackToLogin = () => {
    setShowEmailVerification(false);
    navigate('/login');
  };

  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <EmailVerification
          email={userEmail}
          onBackToLogin={handleBackToLogin}
          onVerificationSuccess={handleVerificationSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200"
        >
          {theme === 'light' ? (
            <MoonIcon className="h-5 w-5 text-gray-600" />
          ) : (
            <SunIcon className="h-5 w-5 text-yellow-400" />
          )}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Join InvoiciFy
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create your account and start managing invoices
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                1
              </div>
              <div className={`w-12 h-1 mx-2 ${
                step >= 2 ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                2
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Personal Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tell us about yourself
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary py-3"
                >
                  Continue
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Company & Security
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Set up your company and secure your account
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name
                    </label>
                    <div className="relative">
                      <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="Your Company Name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Address <span className="text-gray-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      id="companyAddress"
                      name="companyAddress"
                      rows="2"
                      value={formData.companyAddress}
                      onChange={handleChange}
                      className="input pl-10 resize-none"
                      placeholder="123 Business Street, City, State 12345"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Email <span className="text-gray-400">(optional)</span>
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="companyEmail"
                        name="companyEmail"
                        type="email"
                        value={formData.companyEmail}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="contact@yourcompany.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Website <span className="text-gray-400">(optional)</span>
                    </label>
                    <div className="relative">
                      <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="companyWebsite"
                        name="companyWebsite"
                        type="url"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="https://www.yourcompany.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="input pr-10"
                      placeholder="Create a secure password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input pr-10"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 btn-secondary py-3"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our{' '}
            <button type="button" className="text-primary-600 hover:text-primary-500 underline">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-primary-600 hover:text-primary-500 underline">
              Privacy Policy
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;