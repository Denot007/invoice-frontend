import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  CogIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  CalendarIcon,
  TagIcon,
  ClockIcon,
  ReceiptPercentIcon,
  FolderIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  // Close sidebar on mobile when component mounts
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    };

    // Close on initial load if mobile
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsOpen]);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: DocumentTextIcon,
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: UserGroupIcon,
    },
    {
      name: 'Estimates',
      href: '/estimates',
      icon: DocumentDuplicateIcon,
    },
    {
      name: 'Items',
      href: '/items',
      icon: TagIcon,
    },
    {
      name: 'Time Tracking',
      href: '/time-tracking',
      icon: ClockIcon,
    },
    {
      name: 'Expenses',
      href: '/expenses',
      icon: ReceiptPercentIcon,
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: CreditCardIcon,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: ChartBarIcon,
    },
    {
      name: 'File Manager',
      href: '/files',
      icon: FolderIcon,
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: CalendarIcon,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: CogIcon,
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : window.innerWidth >= 1024 ? 0 : -256,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 border-r border-gray-200/50 dark:border-gray-700/50 z-30 lg:relative lg:translate-x-0 flex flex-col h-full shadow-xl dark:shadow-2xl"
      >
        {/* Logo - Fixed at top */}
        <div className="flex items-center px-6 py-8 border-b border-gray-200/30 dark:border-gray-700/30 flex-shrink-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="relative">
              <img src="/invoicegear-icon.svg" alt="InvoiceGear" className="w-12 h-12" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                InvoiceGear
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Professional Billing Suite
              </p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable middle section */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <nav className="px-3 py-4 space-y-1">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 transform scale-[1.02]'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white hover:shadow-md hover:transform hover:scale-[1.01]'
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}

                    {/* Icon container */}
                    <div className={`relative z-10 w-5 h-5 mr-3 ${
                      isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>

                    {/* Text */}
                    <span className="relative z-10 font-medium">
                      {item.name}
                    </span>

                    {/* Hover effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* User Profile - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200/30 dark:border-gray-700/30 flex-shrink-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center px-4 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 mb-3 shadow-sm hover:shadow-md transition-all duration-200">
            {/* User Avatar or Company Logo */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-gray-700 shadow-md">
                {user?.profile?.company_logo ? (
                  <img
                    src={user.profile.company_logo}
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-inner">
                    <span className="text-white font-bold text-sm">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-700"></div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {user?.profile?.company_name || 'Personal Account'}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group border border-red-200/50 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700 hover:shadow-md"
          >
            <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 group-hover:transform group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span>Sign out</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;