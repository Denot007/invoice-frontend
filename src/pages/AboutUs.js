import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  InformationCircleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const AboutUs = () => {
  const { theme } = useTheme();

  const values = [
    {
      icon: LightBulbIcon,
      title: 'Innovation',
      description: 'We constantly innovate to provide cutting-edge invoice management solutions that evolve with your business needs.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Security',
      description: 'Your data security is our top priority. We implement industry-leading security measures to protect your sensitive information.'
    },
    {
      icon: UserGroupIcon,
      title: 'Customer Focus',
      description: 'Every feature we build is designed with our customers in mind, ensuring the best possible user experience.'
    },
    {
      icon: HeartIcon,
      title: 'Simplicity',
      description: 'We believe in making complex tasks simple. Our intuitive interface makes invoice management effortless.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '500,000+', label: 'Invoices Processed' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      description: 'Former finance director with 15+ years of experience in business automation and process optimization.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      description: 'Software architect with expertise in scalable systems and enterprise-level applications.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      description: 'UX/UI expert passionate about creating intuitive and user-friendly business solutions.'
    },
    {
      name: 'David Thompson',
      role: 'Head of Customer Success',
      description: 'Dedicated to ensuring every customer achieves success with our platform and gets maximum value.'
    }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} py-16`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <InformationCircleIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            About InvoiceGear
          </h1>
          <p className={`text-xl leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            We're on a mission to simplify invoice management for small businesses and freelancers worldwide.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Our Story */}
        <div className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-3xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Our Story
            </h2>
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm p-8`}>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center mb-4">
                    <RocketLaunchIcon className={`w-8 h-8 mr-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Founded in 2023
                    </h3>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed mb-4`}>
                    InvoiciFy was born out of frustration with existing invoice management solutions that were either too complex or too limited. Our founders, having run their own businesses, understood the daily challenges of managing invoices, tracking payments, and maintaining client relationships.
                  </p>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                    We set out to create a solution that combines powerful features with intuitive design, making professional invoice management accessible to businesses of all sizes.
                  </p>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-50'} p-6 rounded-lg`}>
                  <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-indigo-900'}`}>
                    What makes us different?
                  </h4>
                  <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-indigo-700'}`}>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                      No hidden fees or surprise charges
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                      Built specifically for small businesses
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                      Intuitive design that requires no training
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                      Exceptional customer support
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-20">
          <h2 className={`text-3xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            InvoiciFy by the Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm`}>
                <div className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {stat.number}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className={`text-3xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className={`text-center p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                  <value.icon className={`w-6 h-6 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {value.title}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h2 className={`text-3xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className={`text-center p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm`}>
                <div className={`w-20 h-20 mx-auto mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                  <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className={`text-lg font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {member.name}
                </h3>
                <p className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {member.role}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm p-12 text-center`}>
          <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Our Mission
          </h2>
          <p className={`text-xl leading-relaxed max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            To empower small businesses and freelancers with professional-grade invoice management tools that are simple to use, 
            secure, and affordable. We believe that managing your finances shouldn't be complicated or time-consuming.
          </p>
          
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Ready to simplify your invoice management?
            </p>
            <div className="mt-4">
              <a
                href="/signup"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Get Started Today
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;