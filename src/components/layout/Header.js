import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bars3Icon,
  BellIcon,
  MoonIcon,
  SunIcon,
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ setSidebarOpen }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Fullscreen functionality
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullScreen(false);
        }).catch(err => {
          console.log('Error attempting to exit fullscreen:', err);
        });
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Search */}
            <div className="ml-4 lg:ml-0 flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="Search invoices, clients..."
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Fullscreen toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFullScreen}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullScreen ? (
                <ArrowsPointingInIcon className="h-5 w-5" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5" />
              )}
            </motion.button>

            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>

            {/* User menu */}
            <div className="flex items-center ml-3">
              <div className="hidden md:flex items-center mr-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.profile?.company_name || 'No company'}
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
              >
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
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;