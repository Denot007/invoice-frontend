import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const CookiePolicy = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <DocumentTextIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Cookie Policy
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm p-8 space-y-8`}>
          
          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              What Are Cookies
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners. Cookies help us understand how you use our service and improve your experience.
            </p>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              How We Use Cookies
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              InvoiciFy uses cookies for several purposes:
            </p>
            <ul className={`list-disc pl-6 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>To keep you logged in to your account</li>
              <li>To remember your preferences and settings</li>
              <li>To analyze how our service is used and improve performance</li>
              <li>To provide personalized content and features</li>
              <li>To ensure security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Types of Cookies We Use
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Essential Cookies
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  These cookies are necessary for the website to function properly and cannot be disabled.
                </p>
                <ul className={`list-disc pl-6 space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <li>Authentication cookies to keep you logged in</li>
                  <li>Security cookies to protect against fraud</li>
                  <li>Load balancing cookies for site performance</li>
                </ul>
              </div>

              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Functional Cookies
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  These cookies enhance functionality and personalization but are not essential for basic operation.
                </p>
                <ul className={`list-disc pl-6 space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <li>Theme preferences (dark/light mode)</li>
                  <li>Language and region settings</li>
                  <li>Dashboard layout preferences</li>
                </ul>
              </div>

              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Analytics Cookies
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  These cookies help us understand how users interact with our service so we can improve it.
                </p>
                <ul className={`list-disc pl-6 space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <li>Page views and user behavior tracking</li>
                  <li>Feature usage analytics</li>
                  <li>Performance monitoring</li>
                </ul>
              </div>

              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Marketing Cookies
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  These cookies are used to deliver relevant advertisements and marketing communications.
                </p>
                <ul className={`list-disc pl-6 space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <li>Targeted advertising based on interests</li>
                  <li>Social media integration</li>
                  <li>Campaign effectiveness tracking</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Third-Party Cookies
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              We may use third-party services that set their own cookies on our website:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Google Analytics
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  Used to analyze website traffic and user behavior. You can opt out at: https://tools.google.com/dlpage/gaoptout
                </p>
              </div>
              
              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Stripe
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  Payment processing cookies for secure transactions and fraud prevention.
                </p>
              </div>

              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Social Media Platforms
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  Cookies from social media platforms for sharing buttons and embedded content.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Managing Your Cookie Preferences
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              You have several options for managing cookies:
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Browser Settings
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm mb-2`}>
                  Most browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className={`list-disc pl-6 space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <li>Block all cookies</li>
                  <li>Block third-party cookies only</li>
                  <li>Delete existing cookies</li>
                  <li>Set cookies to expire when you close your browser</li>
                </ul>
              </div>

              <div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Cookie Consent Manager
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  When you first visit our website, you'll see a cookie consent banner where you can choose which types of cookies to accept.
                </p>
              </div>
            </div>

            <div className={`mt-6 p-4 ${theme === 'dark' ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} rounded-md border`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'}`}>
                <strong>Note:</strong> Disabling certain cookies may affect the functionality of our service. Essential cookies cannot be disabled as they are necessary for the website to function properly.
              </p>
            </div>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Cookie Retention
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              Different cookies have different lifespans:
            </p>
            <ul className={`list-disc pl-6 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li><strong>Session cookies:</strong> Expire when you close your browser</li>
              <li><strong>Persistent cookies:</strong> Remain on your device for a set period (typically 30 days to 2 years)</li>
              <li><strong>Authentication cookies:</strong> Expire based on your login session settings</li>
              <li><strong>Preference cookies:</strong> Stored until you change them or clear your browser data</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Your Rights
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              Under data protection laws, you have the right to:
            </p>
            <ul className={`list-disc pl-6 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>Know what cookies we use and why</li>
              <li>Choose which non-essential cookies to accept</li>
              <li>Withdraw your consent at any time</li>
              <li>Access information about how your data is processed</li>
              <li>Request deletion of your personal data</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Updates to This Policy
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              We may update this Cookie Policy from time to time to reflect changes in our practices or applicable laws. When we make changes, we will update the "Last updated" date at the top of this page. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Contact Us
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <div className={`mt-4 p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-md`}>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Email: privacy@invoicify.com<br />
                Subject: Cookie Policy Inquiry<br />
                Address: [Your Business Address]
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;