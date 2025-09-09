import React from 'react';
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
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

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
      name: 'Reports',
      href: '/reports',
      icon: ChartBarIcon,
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
          x: isOpen ? 0 : window.innerWidth >= 1024 ? 0 : -320,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 lg:relative lg:translate-x-0 flex flex-col"
      >
        {/* Logo */}
        <div className="flex items-center px-6 py-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                InvoiciFy
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Invoice Management
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-2 border-primary-600'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-primary-600 dark:text-primary-400' : ''
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 mb-2">
            {/* User Avatar or Company Logo */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
              {user?.profile?.company_logo ? (
                <img
                  src={user.profile.company_logo}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.profile?.company_name || 'No company'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
          >
            <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5" />
            Sign out
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;