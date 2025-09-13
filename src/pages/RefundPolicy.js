import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { CreditCardIcon } from '@heroicons/react/24/outline';

const RefundPolicy = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <CreditCardIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Refund Policy
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm p-8 space-y-8`}>
          
          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Our Commitment to Customer Satisfaction
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              At InvoiciFy, we stand behind our service and want you to be completely satisfied with your subscription. This Refund Policy outlines the circumstances under which refunds may be issued and the process for requesting them.
            </p>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              30-Day Money-Back Guarantee
            </h2>
            <div className={`${theme === 'dark' ? 'bg-emerald-900 border-emerald-700' : 'bg-emerald-50 border-emerald-200'} rounded-md border p-4 mb-4`}>
              <p className={`font-medium ${theme === 'dark' ? 'text-emerald-200' : 'text-emerald-800'}`}>
                We offer a 30-day money-back guarantee for all new subscriptions.
              </p>
            </div>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              If you're not satisfied with InvoiciFy within your first 30 days of subscription, you may request a full refund. This guarantee applies to:
            </p>
            <ul className={`list-disc pl-6 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>First-time subscribers to any InvoiciFy plan</li>
              <li>Subscriptions purchased directly through our website</li>
              <li>Both monthly and annual subscription plans</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Refund Eligibility
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Eligible for Refund
                </h3>
                <ul className={`list-disc pl-6 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>Subscriptions cancelled within 30 days of initial purchase</li>
                  <li>Technical issues preventing normal use of the service</li>
                  <li>Service outages lasting more than 48 hours in a billing period</li>
                  <li>Billing errors or duplicate charges</li>
                  <li>Unauthorized charges on your account</li>
                </ul>
              </div>

              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Not Eligible for Refund
                </h3>
                <ul className={`list-disc pl-6 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>Subscriptions cancelled after 30 days from initial purchase</li>
                  <li>Renewal charges (automatic billing)</li>
                  <li>Partial month usage (we provide pro-rated service instead)</li>
                  <li>Change of mind after the 30-day period</li>
                  <li>Violation of Terms of Service resulting in account suspension</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Refund Process
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  How to Request a Refund
                </h3>
                <ol className={`list-decimal pl-6 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>Contact our support team via email or through your account dashboard</li>
                  <li>Provide your account information and reason for the refund request</li>
                  <li>Our team will review your request within 2 business days</li>
                  <li>If approved, the refund will be processed within 5-10 business days</li>
                </ol>
              </div>
              
              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Required Information
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  To process your refund request, please provide:
                </p>
                <ul className={`list-disc pl-6 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>Your account email address</li>
                  <li>Transaction ID or receipt number</li>
                  <li>Reason for the refund request</li>
                  <li>Any relevant screenshots or documentation</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Refund Methods and Timeline
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Refund Method
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Refunds will be issued to the original payment method used for the subscription. We cannot process refunds to a different payment method or account.
                </p>
              </div>
              
              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Processing Time
                </h3>
                <ul className={`list-disc pl-6 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li><strong>Credit Card:</strong> 5-10 business days</li>
                  <li><strong>PayPal:</strong> 3-5 business days</li>
                  <li><strong>Bank Transfer:</strong> 7-14 business days</li>
                </ul>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-2 text-sm`}>
                  Note: Processing times may vary depending on your bank or payment provider.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Subscription Cancellation vs. Refund
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Cancellation
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  You can cancel your subscription at any time through your account settings. Upon cancellation, you'll continue to have access to InvoiciFy until the end of your current billing period.
                </p>
              </div>
              
              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Refund
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  A refund involves returning the money you paid for your subscription and immediately terminating your access to the service.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Pro-rated Credits
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              In cases where a full refund is not applicable, we may offer pro-rated credits for unused portions of your subscription. These credits can be applied to future billing cycles or used when upgrading your plan.
            </p>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Dispute Resolution
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              If you're not satisfied with our refund decision, you may escalate your request to our management team. We're committed to finding a fair resolution for all our customers. Please allow additional time for review in such cases.
            </p>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Chargeback Policy
            </h2>
            <div className={`${theme === 'dark' ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'} rounded-md border p-4 mb-4`}>
              <p className={`font-medium ${theme === 'dark' ? 'text-red-200' : 'text-red-800'}`}>
                Please contact us before initiating a chargeback with your bank or credit card company.
              </p>
            </div>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              Chargebacks can result in additional fees for both parties and may lead to account suspension. We're committed to resolving billing issues directly and encourage customers to work with our support team first.
            </p>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Changes to This Policy
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting on our website. We will notify active subscribers of any material changes via email.
            </p>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Contact Information
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              For refund requests or questions about this policy, please contact us:
            </p>
            <div className={`mt-4 p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-md`}>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Email: billing@invoicify.com<br />
                Subject: Refund Request<br />
                Phone: +1 (555) 123-4567<br />
                Address: [Your Business Address]
              </p>
            </div>
            
            <div className={`mt-6 p-4 ${theme === 'dark' ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} rounded-md border`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
                <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM PST<br />
                We aim to respond to all refund requests within 24 hours during business hours.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;