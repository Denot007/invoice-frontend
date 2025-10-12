import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../layout/Footer';
import {
  ChartBarIcon,
  DocumentDuplicateIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  StarIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CloudIcon,
  ShieldCheckIcon,
  BoltIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const navigate = useNavigate();
  const [setIsVideoPlaying] = useState(false);
  const [pricing, setPricing] = useState({
    weekly: 5.99,
    monthly: 22.99,
    yearly: 199.99,
    trial_days: 14,
    has_active_promotion: false,
    promotion: null
  });

  // Fetch dynamic pricing on component mount
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/marketplace/pricing/public/');
        if (response.data.success) {
          setPricing(response.data.pricing);
        }
      } catch (error) {
        console.error('Failed to fetch pricing:', error);
        // Keep default pricing if fetch fails
      }
    };
    fetchPricing();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: DocumentDuplicateIcon,
      title: 'Smart Invoice Creation',
      description: 'Create professional invoices in seconds with our intuitive drag-and-drop builder.',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Payment Tracking',
      description: 'Monitor payments, send reminders, and track your cash flow in real-time.',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      icon: UserGroupIcon,
      title: 'Client Management',
      description: 'Organize client information, track project history, and build stronger relationships.',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Get insights into your business performance with detailed reports and analytics.',
      gradient: 'from-orange-500 to-red-600'
    }
  ];

  const platforms = [
    {
      icon: ComputerDesktopIcon,
      title: 'Web Application',
      description: 'Full-featured web dashboard for comprehensive business management',
      color: 'text-blue-600'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile App',
      description: 'Native iOS & Android apps for invoice management on the go',
      color: 'text-green-600'
    },
    {
      icon: CloudIcon,
      title: 'Cloud Sync',
      description: 'Seamless synchronization across all your devices and platforms',
      color: 'text-purple-600'
    }
  ];

  const benefits = [
    'Professional invoice templates',
    'Automated payment reminders',
    'Multi-currency support',
    'Real-time collaboration',
    'Secure data encryption',
    'Mobile app included',
    '24/7 customer support',
    'No setup fees'
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Freelance Designer',
      avatar: 'SJ',
      rating: 5,
      text: 'InvoiceGear has transformed how I manage my freelance business. The mobile app is incredibly convenient!'
    },
    {
      name: 'Mark Rodriguez',
      role: 'Small Business Owner',
      avatar: 'MR',
      rating: 5,
      text: 'The analytics and reporting features give me insights I never had before. Highly recommended!'
    },
    {
      name: 'Emily Chen',
      role: 'Consultant',
      avatar: 'EC',
      rating: 5,
      text: 'Clean, professional invoices and seamless payment tracking. Exactly what I needed.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <img src="/invoicegear-logo-light.svg" alt="InvoiceGear" className="h-10 w-auto" />
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-8">
            <motion.a 
              whileHover={{ scale: 1.05 }}
              href="#features" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              href="#pricing" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              href="#contact" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Contact
            </motion.a>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-8"
            >
              <motion.h1 
                variants={fadeInUp}
                className="text-5xl lg:text-7xl font-bold text-white leading-tight"
              >
                Invoice Like a
                <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  {' '}Pro
                </span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-xl text-gray-300 leading-relaxed max-w-lg"
              >
                Create, send, and track professional invoices with our powerful web and mobile platform. 
                Get paid faster and manage your business better.
              </motion.p>

              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg backdrop-blur-sm hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
                  onClick={() => setIsVideoPlaying(true)}
                >
                  <PlayIcon className="w-5 h-5" />
                  <span>Watch Demo</span>
                </motion.button>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                className="flex items-center space-x-6 text-gray-400"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>14-day free trial</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-white rounded-2xl shadow-2xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-gray-800 font-semibold">Invoice #INV-001</div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Paid
                    </div>
                  </div>
                  <div className="border-b border-gray-200 pb-4">
                    <div className="text-gray-600 text-sm">To: Acme Corp</div>
                    <div className="text-2xl font-bold text-gray-800 mt-2">$2,450.00</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-gray-600 text-sm">Due: Sep 15, 2024</div>
                    <div className="flex items-center space-x-2">
                      <DevicePhoneMobileIcon className="w-4 h-4 text-blue-600" />
                      <ComputerDesktopIcon className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-10 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full opacity-20"
        />
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                {' '}Succeed
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Powerful features designed to streamline your invoicing process and grow your business
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all cursor-pointer"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Available Everywhere You Work
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Access your invoices and manage your business from any device, anywhere
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="text-center group"
              >
                <div className={`w-24 h-24 mx-auto mb-6 ${platform.color} bg-white/10 rounded-3xl flex items-center justify-center group-hover:bg-white/20 transition-all`}>
                  <platform.icon className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{platform.title}</h3>
                <p className="text-gray-300 leading-relaxed">{platform.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Simple, Transparent
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {' '}Pricing
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the perfect plan for your business. All plans include our core features with no hidden fees.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {/* Weekly Plan */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-blue-400/40 transition-all"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BoltIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Weekly Plan</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${pricing.weekly}</span>
                  <span className="text-gray-400">/week</span>
                  {pricing.has_active_promotion && (
                    <div className="mt-2">
                      <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        {pricing.promotion.discount_percentage}% OFF
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-300 mb-6">Perfect for short-term projects and testing</p>
                
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Unlimited invoices</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Client management</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Payment tracking</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Mobile app access</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Basic reporting</span>
                  </li>
                </ul>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Start {pricing.trial_days}-Day Trial
                </motion.button>
              </div>
            </motion.div>

            {/* Monthly Plan - Featured */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}
              className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-blue-400 relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 text-sm font-bold rounded-full">
                  MOST POPULAR
                </span>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <StarIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Monthly Plan</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${pricing.monthly}</span>
                  <span className="text-gray-400">/month</span>
                  {pricing.has_active_promotion && (
                    <div className="mt-2">
                      <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        {pricing.promotion.discount_percentage}% OFF
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-300 mb-6">Ideal for growing businesses and freelancers</p>
                
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Everything in Weekly</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Advanced analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Custom branding</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Priority support</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Multi-currency support</span>
                  </li>
                </ul>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Start {pricing.trial_days}-Day Trial
                </motion.button>
              </div>
            </motion.div>

            {/* Yearly Plan */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-green-400/40 transition-all relative"
            >
              <div className="absolute -top-4 right-4">
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 text-xs font-bold rounded-full">
                  SAVE 27%
                </span>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CurrencyDollarIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Yearly Plan</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-white">${pricing.yearly}</span>
                  <span className="text-gray-400">/year</span>
                  {pricing.has_active_promotion && (
                    <div className="mt-2">
                      <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        {pricing.promotion.discount_percentage}% OFF
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-green-400 text-sm font-semibold mb-6">
                  (~${(pricing.yearly / 12).toFixed(2)}/month)
                </div>
                <p className="text-gray-300 mb-6">Best value for established businesses</p>
                
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Everything in Monthly</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Premium templates</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Advanced integrations</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">Dedicated support</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">API access</span>
                  </li>
                </ul>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Start {pricing.trial_days}-Day Trial
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Pricing Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h4 className="text-2xl font-bold text-white mb-6">All Plans Include</h4>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center">
                  <ShieldCheckIcon className="w-12 h-12 text-green-400 mb-3" />
                  <span className="text-gray-300 font-medium">Bank-Level Security</span>
                </div>
                <div className="flex flex-col items-center">
                  <CloudIcon className="w-12 h-12 text-blue-400 mb-3" />
                  <span className="text-gray-300 font-medium">Cloud Backup</span>
                </div>
                <div className="flex flex-col items-center">
                  <DevicePhoneMobileIcon className="w-12 h-12 text-purple-400 mb-3" />
                  <span className="text-gray-300 font-medium">Mobile Apps</span>
                </div>
                <div className="flex flex-col items-center">
                  <CheckCircleIcon className="w-12 h-12 text-green-400 mb-3" />
                  <span className="text-gray-300 font-medium">14-Day Free Trial</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={fadeInLeft}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
                Why Choose InvoiceGear?
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Join thousands of businesses that trust InvoiceGear to manage their invoicing and payments.
              </p>
              
              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4"
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeInRight}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: ShieldCheckIcon, label: 'Secure', color: 'from-green-500 to-teal-600' },
                    { icon: BoltIcon, label: 'Fast', color: 'from-yellow-500 to-orange-600' },
                    { icon: CogIcon, label: 'Reliable', color: 'from-blue-500 to-purple-600' },
                    { icon: StarIcon, label: '5-Star', color: 'from-purple-500 to-pink-600' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-6 bg-white/5 rounded-2xl border border-white/10"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white font-semibold">{item.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Loved by Businesses Worldwide
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See what our customers have to say about InvoiceGear
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-white">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of businesses already using InvoiceGear to streamline their invoicing process.
            </p>
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 px-12 py-4 rounded-full font-bold text-xl hover:shadow-2xl transition-all"
            >
              Start Your Free Trial
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;