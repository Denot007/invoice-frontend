import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const TermsOfService = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <DocumentTextIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Terms of Service
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm p-8 space-y-8`}>
          
          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Acceptance of Terms
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              By accessing and using InvoiciFy ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Description of Service
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              InvoiciFy is a web-based invoice management platform that allows users to create, send, and track invoices, manage clients, schedule appointments, and process payments. The Service includes features such as invoice generation, client management, appointment scheduling, payment processing through Stripe, and notification services via email and SMS.
            </p>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              User Account and Registration
            </h2>
            <div className="space-y-4">
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                To use the Service, you must:
              </p>
              <ul className={`list-disc pl-6 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your information to keep it accurate and current</li>
                <li>Be responsible for safeguarding your password and all activities under your account</li>
                <li>Immediately notify us of any unauthorized use of your account</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Acceptable Use Policy
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, overburden, or impair the Service. Prohibited activities include:
            </p>
            <ul className={`list-disc pl-6 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Using the Service for fraudulent or illegal activities</li>
              <li>Attempting to gain unauthorized access to any part of the Service</li>
              <li>Transmitting viruses, malware, or other malicious code</li>
              <li>Interfering with or disrupting the Service or servers</li>
              <li>Using the Service to send spam or unsolicited communications</li>
              <li>Violating any applicable local, state, national, or international law</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Subscription and Payment
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Subscription Plans
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  InvoiciFy offers various subscription plans with different features and usage limits. You may upgrade or downgrade your subscription at any time through your account settings.
                </p>
              </div>
              
              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Billing
                </h3>
                <ul className={`list-disc pl-6 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>Subscription fees are billed in advance on a monthly or yearly basis</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>We reserve the right to change pricing with 30 days' notice</li>
                  <li>Failure to pay may result in service suspension or termination</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Data Ownership and Usage
            </h2>
            <div className="space-y-4">
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                You retain all rights to your data and content uploaded to the Service. By using our Service, you grant us a limited license to use, store, and process your data solely for the purpose of providing the Service to you.
              </p>
              <ul className={`list-disc pl-6 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>We will not sell, rent, or share your data with third parties without your consent</li>
                <li>You are responsible for maintaining backups of your important data</li>
                <li>We reserve the right to remove content that violates these terms</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Third-Party Services
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              Our Service integrates with third-party services including:
            </p>
            <ul className={`list-disc pl-6 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li><strong>Stripe:</strong> For payment processing and subscription billing</li>
              <li><strong>Twilio:</strong> For SMS notifications and reminders</li>
            </ul>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-4 leading-relaxed`}>
              Your use of these third-party services is subject to their respective terms of service and privacy policies. We are not responsible for the practices or content of these third-party services.
            </p>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Service Availability
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              We strive to provide a reliable service but cannot guarantee 100% uptime. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We will make reasonable efforts to provide advance notice of planned downtime.
            </p>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Limitation of Liability
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              To the maximum extent permitted by law, InvoiciFy shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Termination
            </h2>
            <div className="space-y-4">
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                Either party may terminate this agreement at any time:
              </p>
              <ul className={`list-disc pl-6 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>You may cancel your subscription at any time through your account settings</li>
                <li>We may terminate or suspend your account for violation of these terms</li>
                <li>Upon termination, your access to the Service will cease immediately</li>
                <li>We will provide you with the ability to export your data for 30 days after termination</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Intellectual Property
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              The Service and its original content, features, and functionality are and will remain the exclusive property of InvoiciFy and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Governing Law
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of [Your Jurisdiction].
            </p>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Changes to Terms
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Contact Information
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className={`mt-4 p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-md`}>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Email: support@invoicify.com<br />
                Address: [Your Business Address]<br />
                Phone: [Your Phone Number]
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;