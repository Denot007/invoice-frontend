import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const FAQ = () => {
  const { theme } = useTheme();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create my first invoice?",
          answer: "After signing up and logging in, navigate to the Invoices page and click 'Create New Invoice'. Fill in your client information, add line items for your products or services, and click 'Save'. You can then send the invoice directly to your client or download it as a PDF."
        },
        {
          question: "Do I need to install any software?",
          answer: "No, InvoiciFy is a web-based application that works in your browser. Simply visit our website and log in to access all features. No downloads or installations required."
        },
        {
          question: "How do I add my business information?",
          answer: "Go to Settings > Profile to add your business name, logo, address, and contact information. This information will automatically appear on all your invoices."
        }
      ]
    },
    {
      category: "Billing & Pricing",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and bank transfers. All payments are processed securely through Stripe."
        },
        {
          question: "Can I change my plan at any time?",
          answer: "Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately, and you'll be charged or credited the prorated amount."
        },
        {
          question: "Do you offer a free trial?",
          answer: "Yes, we offer a 14-day free trial for new users. No credit card required to start your trial. You'll have access to all features during the trial period."
        },
        {
          question: "What happens if I exceed my plan limits?",
          answer: "If you approach your plan limits, we'll notify you via email. You can upgrade your plan or some features may be temporarily limited until the next billing cycle."
        }
      ]
    },
    {
      category: "Invoices & Payments",
      questions: [
        {
          question: "How do my clients pay invoices online?",
          answer: "When you send an invoice, your clients receive a link to view and pay online using credit cards or bank transfers through our secure Stripe integration. They don't need to create an account."
        },
        {
          question: "Can I customize my invoice templates?",
          answer: "Yes, you can customize invoice templates with your branding, colors, and layout. Choose from several professional templates and add your logo and business information."
        },
        {
          question: "How do I track overdue invoices?",
          answer: "The dashboard shows all overdue invoices with automatic aging reports. You can set up automatic reminder emails to be sent to clients when invoices become overdue."
        },
        {
          question: "Can I accept payments in different currencies?",
          answer: "Yes, InvoiciFy supports multiple currencies. You can set your default currency in settings and create invoices in different currencies as needed."
        }
      ]
    },
    {
      category: "Client Management",
      questions: [
        {
          question: "How do I add clients to my account?",
          answer: "Go to the Clients page and click 'Add New Client'. Enter their contact information, billing address, and any notes. Clients are automatically saved for future invoices."
        },
        {
          question: "Can clients access their invoice history?",
          answer: "Yes, clients can access a secure portal to view their invoice history, payment status, and download copies of their invoices using a unique client link."
        },
        {
          question: "How do I organize my clients?",
          answer: "You can organize clients using tags, custom fields, and search filters. Archive inactive clients to keep your active client list organized."
        }
      ]
    },
    {
      category: "Appointments & Calendar",
      questions: [
        {
          question: "How does the appointment scheduling work?",
          answer: "The calendar feature allows you to schedule appointments with clients, set reminders via email and SMS, and track appointment status. Clients can confirm or reschedule appointments through email links."
        },
        {
          question: "Can I send appointment reminders?",
          answer: "Yes, you can set up automatic email and SMS reminders for appointments. Customize the reminder timing and message content in your settings."
        },
        {
          question: "How do I sync appointments with my external calendar?",
          answer: "Currently, calendar sync with external calendars like Google Calendar is in development. You can export your appointments as ICS files for now."
        }
      ]
    },
    {
      category: "Security & Data",
      questions: [
        {
          question: "Is my data secure?",
          answer: "Yes, we use industry-standard encryption (SSL/TLS) for all data transmission and storage. Your data is backed up regularly and stored in secure data centers with 24/7 monitoring."
        },
        {
          question: "Who can access my data?",
          answer: "Only you have access to your account data. Our support team can only access your account with your explicit permission for troubleshooting purposes."
        },
        {
          question: "Can I export my data?",
          answer: "Yes, you can export all your data including invoices, clients, and reports in various formats (PDF, CSV, Excel) at any time from your account settings."
        },
        {
          question: "What happens to my data if I cancel?",
          answer: "Your data remains accessible for 90 days after cancellation. You can export your data during this period. After 90 days, all data is permanently deleted."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "What browsers are supported?",
          answer: "InvoiciFy works with all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your preferred browser for the best experience."
        },
        {
          question: "How do I get help if I have issues?",
          answer: "You can contact our support team via email, live chat, or through the help section in your account. We typically respond within 24 hours during business days."
        },
        {
          question: "Do you offer phone support?",
          answer: "We offer email and chat support for all plans. Phone support is available for Enterprise plan customers during business hours (9 AM - 6 PM PST)."
        },
        {
          question: "Is there a mobile app?",
          answer: "While we don't have a dedicated mobile app yet, InvoiciFy is fully responsive and works great on mobile devices through your phone's web browser."
        }
      ]
    }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <QuestionMarkCircleIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Frequently Asked Questions
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Find answers to common questions about InvoiciFy. Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm`}>
              {/* Category Header */}
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {category.category}
                </h2>
              </div>
              
              {/* Questions */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {category.questions.map((faq, questionIndex) => {
                  const globalIndex = categoryIndex * 100 + questionIndex; // Create unique index
                  const isOpen = openIndex === globalIndex;
                  
                  return (
                    <div key={questionIndex}>
                      <button
                        onClick={() => toggleFAQ(globalIndex)}
                        className={`w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                      >
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                          {faq.question}
                        </span>
                        {isOpen ? (
                          <ChevronUpIcon className={`w-5 h-5 flex-shrink-0 ml-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        ) : (
                          <ChevronDownIcon className={`w-5 h-5 flex-shrink-0 ml-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className={`mt-12 text-center p-8 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm`}>
          <h2 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Still Have Questions?
          </h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            Our support team is here to help. Get in touch and we'll respond as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Contact Support
            </a>
            <a
              href="mailto:support@invoicify.com"
              className={`inline-flex items-center justify-center px-6 py-3 border rounded-md text-base font-medium transition-colors
                ${theme === 'dark' 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              Email Us
            </a>
          </div>
          
          <div className={`mt-6 pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM PST<br />
              Average response time: Less than 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;