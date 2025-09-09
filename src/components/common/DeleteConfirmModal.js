import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Delete Item",
  message = "Are you sure you want to delete this item?",
  itemName = "",
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  isDangerous = true 
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        isDangerous 
                          ? 'bg-red-100 dark:bg-red-900/20' 
                          : 'bg-yellow-100 dark:bg-yellow-900/20'
                      }`}>
                        <ExclamationTriangleIcon 
                          className={`h-6 w-6 ${
                            isDangerous 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-yellow-600 dark:text-yellow-400'
                          }`} 
                        />
                      </div>
                      <div>
                        <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                          {title}
                        </Dialog.Title>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      disabled={isLoading}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="mb-6">
                    <p className="text-gray-700 dark:text-gray-300">
                      {message}
                    </p>
                    {itemName && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {itemName}
                        </p>
                      </div>
                    )}
                    {isDangerous && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          <strong>Warning:</strong> This action cannot be undone.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={onClose}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelText}
                    </button>
                    <button
                      onClick={onConfirm}
                      disabled={isLoading}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDangerous
                          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                          : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                      } ${isLoading ? 'cursor-wait' : ''}`}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        confirmText
                      )}
                    </button>
                  </div>
                </motion.div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DeleteConfirmModal;