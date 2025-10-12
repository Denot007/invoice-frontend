import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CloudIcon,
  ChartBarIcon,
  DocumentIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const StorageStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStorageStats();
  }, []);

  const fetchStorageStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/filemanager/storage/statistics/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching storage stats:', error);
      toast.error('Failed to load storage statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { storage_quota, total_files, total_folders, file_types } = stats;
  const percentage = storage_quota.percentage_used;
  const isNearLimit = percentage >= 80;
  const isOverLimit = storage_quota.is_over_quota;

  // Determine progress bar color
  const getProgressColor = () => {
    if (isOverLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-6">
      {/* Storage Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <CloudIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Storage Usage</h3>
              <p className="text-sm text-blue-100">
                {storage_quota.used_display} of {storage_quota.quota_display}
              </p>
            </div>
          </div>
          {isOverLimit && (
            <span className="px-3 py-1 bg-red-500 rounded-full text-xs font-medium">
              Over Limit
            </span>
          )}
          {isNearLimit && !isOverLimit && (
            <span className="px-3 py-1 bg-yellow-500 rounded-full text-xs font-medium">
              Near Limit
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-100">Used</span>
            <span className="font-semibold">{percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${getProgressColor()} rounded-full relative`}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </motion.div>
          </div>
          <div className="flex items-center justify-between text-xs text-blue-100">
            <span>{storage_quota.used_display}</span>
            <span>{storage_quota.available_display} available</span>
          </div>
        </div>

        {isOverLimit && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-300/30 rounded-lg">
            <p className="text-sm">
              <strong>Storage limit exceeded!</strong> Please delete some files or upgrade your plan to add more storage.
            </p>
          </div>
        )}

        {isNearLimit && !isOverLimit && (
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-300/30 rounded-lg">
            <p className="text-sm">
              You're running low on storage space. Consider upgrading your plan for more storage.
            </p>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Files */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Files</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{total_files}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DocumentIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        {/* Total Folders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Folders</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{total_folders}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        {/* Storage Available */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {storage_quota.available_display}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* File Types Breakdown */}
      {file_types && file_types.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Storage by File Type</h3>
          </div>

          <div className="space-y-3">
            {file_types.slice(0, 5).map((type, index) => {
              const typePercentage = (type.size / storage_quota.used_bytes) * 100;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {type.extension.toUpperCase()} files ({type.count})
                    </span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {type.size_display}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${typePercentage}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {file_types.length > 5 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              +{file_types.length - 5} more file types
            </p>
          )}
        </motion.div>
      )}

      {/* Upgrade Prompt (if needed) */}
      {(isOverLimit || isNearLimit) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Need More Storage?</h3>
              <p className="text-purple-100 mb-4">
                Upgrade your plan to get more storage space and unlock additional features.
              </p>
              <button
                onClick={() => window.location.href = '/subscription'}
                className="px-6 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                View Plans
              </button>
            </div>
            <div className="hidden md:block">
              <div className="p-4 bg-white/20 rounded-lg backdrop-blur-sm">
                <CloudIcon className="w-12 h-12" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StorageStats;
