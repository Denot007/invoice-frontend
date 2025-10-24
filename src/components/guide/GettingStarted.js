import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UserPlusIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayCircleIcon,
  SparklesIcon,
  LightBulbIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';

const GettingStarted = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      icon: UserPlusIcon,
      title: 'Sign Up & Get Started',
      subtitle: 'Create your free account',
      description: 'Start with our free plan - no credit card required. Get 5 invoices per month, 10 clients, and 5 estimates to test out all features.',
      details: [
        'Click "Get Started Free" on the homepage',
        'Enter your email, name, and create a password',
        'Verify your email address',
        'Complete your profile with business information',
        'You\'re ready to go! No payment needed for the free tier'
      ],
      color: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-500/10 to-emerald-600/10'
    },
    {
      id: 2,
      icon: UserGroupIcon,
      title: 'Add Your Clients',
      subtitle: 'Build your client database',
      description: 'Manage all your client information in one place. Store contact details, billing addresses, and track project history.',
      details: [
        'Navigate to the "Clients" section from the dashboard',
        'Click "Add New Client" button',
        'Enter client name, email, phone, and address',
        'Add custom notes or tags for organization',
        'Save and start building your client portfolio'
      ],
      color: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-500/10 to-purple-600/10'
    },
    {
      id: 3,
      icon: ClipboardDocumentCheckIcon,
      title: 'Create Estimates (Optional)',
      subtitle: 'Send professional quotes',
      description: 'Draft estimates for potential projects. Convert approved estimates into invoices with one click.',
      details: [
        'Go to "Estimates" and click "Create New"',
        'Select a client from your list',
        'Add line items with descriptions and prices',
        'Preview your estimate with professional templates',
        'Send directly to client or download as PDF'
      ],
      color: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-500/10 to-pink-600/10'
    },
    {
      id: 4,
      icon: DocumentTextIcon,
      title: 'Generate Invoices',
      subtitle: 'Create professional invoices',
      description: 'Create beautiful, professional invoices in seconds. Customize templates, add your branding, and include all necessary details.',
      details: [
        'Click "Create Invoice" from the dashboard',
        'Select client or convert an approved estimate',
        'Add services/products with prices and quantities',
        'Set payment terms and due dates',
        'Choose from professional templates or customize your own',
        'Preview and send to client'
      ],
      color: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-500/10 to-red-600/10'
    },
    {
      id: 5,
      icon: CreditCardIcon,
      title: 'Accept Payments',
      subtitle: 'Get paid faster',
      description: 'Track payments with multiple methods including credit cards through Stripe. Clients can pay directly from the invoice.',
      details: [
        'Record cash, check, or bank transfer payments manually',
        'Enable Stripe Connect for credit card payments (2% platform fee)',
        'Clients receive payment link in invoice email',
        'Track payment status in real-time',
        'Automatic invoice balance updates',
        'Send payment reminders for overdue invoices'
      ],
      color: 'from-teal-500 to-cyan-600',
      bgGradient: 'from-teal-500/10 to-cyan-600/10'
    },
    {
      id: 6,
      icon: ChartBarIcon,
      title: 'Track & Analyze',
      subtitle: 'Monitor your business',
      description: 'View comprehensive analytics and reports. Track revenue, outstanding payments, and business growth over time.',
      details: [
        'Dashboard shows key metrics at a glance',
        'View total revenue, pending invoices, and paid amounts',
        'Filter by date range to analyze trends',
        'Export reports for accounting purposes',
        'Monitor client payment history',
        'Upgrade to premium for advanced analytics'
      ],
      color: 'from-yellow-500 to-orange-600',
      bgGradient: 'from-yellow-500/10 to-orange-600/10'
    }
  ];

  const features = [
    {
      icon: SparklesIcon,
      title: 'Professional Templates',
      description: 'Choose from beautiful invoice templates or create custom designs'
    },
    {
      icon: BanknotesIcon,
      title: 'Multiple Payment Methods',
      description: 'Accept cash, checks, bank transfers, and credit cards'
    },
    {
      icon: LightBulbIcon,
      title: 'Smart Reminders',
      description: 'Automatic payment reminders for overdue invoices'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Quick Start',
      description: 'Create your first invoice in under 2 minutes'
    }
  ];

  const pricingTiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      features: ['5 invoices per month', '10 clients', '5 estimates', 'Payment tracking', 'Basic templates'],
      color: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Monthly',
      price: '$22.99',
      period: '/month',
      popular: true,
      features: ['Unlimited invoices', 'Unlimited clients', 'Unlimited estimates', 'Advanced analytics', 'Custom branding', 'Priority support'],
      color: 'from-blue-500 to-purple-600'
    },
    {
      name: 'Yearly',
      price: '$199.99',
      period: '/year',
      badge: 'Save 27%',
      features: ['Everything in Monthly', 'Premium templates', 'Advanced integrations', 'Dedicated support', 'API access'],
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="px-6 py-8 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
            className="flex items-center text-gray-300 hover:text-white transition-colors mb-4"
          >
            <ArrowRightIcon className="w-5 h-5 mr-2 rotate-180" />
            Back to Home
          </motion.button>
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
            Getting Started with
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent"> InvoiceGear</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Your complete guide to managing invoices, clients, and payments like a pro. Follow these simple steps to get up and running in minutes.
          </p>
        </div>
      </motion.div>

      {/* Main Steps Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-16"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                variants={fadeInUp}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                onViewportEnter={() => setActiveStep(index)}
                className="relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${step.bgGradient} rounded-3xl blur-3xl opacity-50`}></div>

                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/20 hover:border-white/40 transition-all">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Content */}
                    <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                      <div className="flex items-center mb-6">
                        <motion.div
                          className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mr-6`}
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <step.icon className="w-8 h-8 text-white" />
                        </motion.div>
                        <div>
                          <div className="text-gray-400 text-sm font-semibold mb-1">STEP {step.id}</div>
                          <h2 className="text-3xl font-bold text-white">{step.title}</h2>
                          <p className="text-cyan-300 font-medium">{step.subtitle}</p>
                        </div>
                      </div>

                      <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                        {step.description}
                      </p>

                      <div className="space-y-4">
                        {step.details.map((detail, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            viewport={{ once: true }}
                            className="flex items-start space-x-3"
                          >
                            <CheckCircleIcon className={`w-6 h-6 flex-shrink-0 bg-gradient-to-r ${step.color} bg-clip-text text-transparent mt-0.5`} />
                            <span className="text-gray-300">{detail}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Right Side - Illustration/Visual */}
                    <div className={`${index % 2 === 1 ? 'lg:order-1' : ''} relative`}>
                      <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className={`bg-gradient-to-br ${step.bgGradient} backdrop-blur-sm rounded-2xl p-8 border border-white/20`}
                      >
                        <div className="bg-white/5 rounded-xl p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center`}>
                              <step.icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-gray-400 text-sm">Step {step.id} of {steps.length}</div>
                              <div className="text-white font-bold text-xl">{Math.round((step.id / steps.length) * 100)}%</div>
                            </div>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full bg-gradient-to-r ${step.color}`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${(step.id / steps.length) * 100}%` }}
                              transition={{ duration: 1, delay: 0.3 }}
                              viewport={{ once: true }}
                            />
                          </div>
                          <div className="text-gray-300 text-sm italic">
                            "{step.subtitle}"
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Why Choose InvoiceGear?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to manage your invoicing business efficiently
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center hover:border-white/40 transition-all"
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Start free and upgrade as your business grows
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border-2 ${
                  tier.popular ? 'border-blue-400' : 'border-white/20'
                } hover:border-white/40 transition-all`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 text-sm font-bold rounded-full whitespace-nowrap">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                {tier.badge && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-1 text-xs font-bold rounded-full whitespace-nowrap">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">{tier.name}</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-white">{tier.price}</span>
                    <span className="text-gray-400">{tier.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8 text-left">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/register')}
                    className={`w-full bg-gradient-to-r ${tier.color} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all`}
                  >
                    {tier.name === 'Free' ? 'Get Started Free' : `Upgrade to ${tier.name}`}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <PlayCircleIcon className="w-24 h-24 text-white mx-auto" />
            <h2 className="text-4xl lg:text-6xl font-bold text-white">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Create your first invoice in less than 2 minutes. No credit card required.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 px-12 py-4 rounded-full font-bold text-xl hover:shadow-2xl transition-all inline-flex items-center space-x-2"
            >
              <span>Start Free Now</span>
              <ArrowRightIcon className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default GettingStarted;
