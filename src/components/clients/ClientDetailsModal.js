import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const ClientDetailsModal = ({ isOpen, onClose, client }) => {
  if (!client) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-6">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-2xl font-bold text-white flex items-center">
                      {client.client_type === 'business' ? (
                        <BuildingOfficeIcon className="h-8 w-8 mr-3" />
                      ) : (
                        <UserIcon className="h-8 w-8 mr-3" />
                      )}
                      {client.client_type === 'business' && client.company_name
                        ? client.company_name
                        : client.name}
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="mt-3 flex items-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {client.status === 'active' ? (
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 mr-1" />
                      )}
                      {client.status === 'active' ? 'Active' : 'Inactive'}
                    </div>
                    <div className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {client.client_type === 'business' ? 'Business' : 'Individual'}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <UserGroupIcon className="h-5 w-5 mr-2" />
                          Contact Information
                        </h3>
                        
                        <div className="space-y-4">
                          {/* Contact Name */}
                          <div className="flex items-center">
                            <UserIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {client.client_type === 'business' ? 'Contact Person' : 'Full Name'}
                              </p>
                              <p className="text-gray-900 dark:text-white font-medium">
                                {client.name || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Company Name (for business) */}
                          {client.client_type === 'business' && (
                            <div className="flex items-center">
                              <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Company Name</p>
                                <p className="text-gray-900 dark:text-white font-medium">
                                  {client.company_name || 'N/A'}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Email */}
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                              <p className="text-gray-900 dark:text-white font-medium">
                                {client.email || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Phone */}
                          <div className="flex items-center">
                            <PhoneIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                              <p className="text-gray-900 dark:text-white font-medium">
                                {client.phone || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Website */}
                          {client.website && (
                            <div className="flex items-center">
                              <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                                <a 
                                  href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                  {client.website}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-6">
                      {/* Address */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <MapPinIcon className="h-5 w-5 mr-2" />
                          Address
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                          <p className="text-gray-900 dark:text-white">
                            {client.address || 'No address provided'}
                          </p>
                        </div>
                      </div>

                      {/* Business Details */}
                      {client.client_type === 'business' && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                            Business Details
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Tax ID:</span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {client.tax_id || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Account Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <CalendarIcon className="h-5 w-5 mr-2" />
                          Account Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Created:</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {formatDate(client.created_at)}
                            </span>
                          </div>
                          {client.updated_at && (
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {formatDate(client.updated_at)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                      Notes
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {client.notes || 'No notes available'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-primary"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ClientDetailsModal;