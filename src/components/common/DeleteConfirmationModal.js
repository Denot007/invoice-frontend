import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Delete", 
  isLoading = false 
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                      </div>
                      <div className="ml-4">
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                          {title || "Confirm Deletion"}
                        </Dialog.Title>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      disabled={isLoading}
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {message || "Are you sure you want to delete this item? This action cannot be undone."}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onConfirm}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Deleting...
                        </div>
                      ) : (
                        confirmText
                      )}
                    </motion.button>
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

export default DeleteConfirmationModal;