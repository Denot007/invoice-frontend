import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import timeTrackingService from '../../services/timeTrackingService';
import TimeEntryModal from './TimeEntryModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const RecentTimeEntries = ({ timeEntries, onRefresh, projects }) => {
  const [loading, setLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const formatDuration = (hours) => {
    if (!hours) return '0m';
    
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours > 0) {
      return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowEditModal(true);
  };

  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;

    setLoading(true);
    const result = await timeTrackingService.deleteTimeEntry(entryToDelete.id);
    if (result.success) {
      toast.success('Time entry deleted successfully');
      onRefresh();
      setShowDeleteModal(false);
      setEntryToDelete(null);
    } else {
      toast.error(result.error || 'Failed to delete time entry');
    }
    setLoading(false);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    setEditingEntry(null);
    setEntryToDelete(null);
  };

  const calculateEarnings = (duration, hourlyRate) => {
    return (duration * parseFloat(hourlyRate || 0)).toFixed(2);
  };

  if (timeEntries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <ClockIcon className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Time Entries
          </h2>
        </div>
        <div className="text-center py-8">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No time entries yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Start tracking time to see your entries here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ClockIcon className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Time Entries
            </h2>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {timeEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {entry.project_name}
                      </p>
                      {entry.task_name && (
                        <>
                          <span className="text-gray-400">•</span>
                          <p className="text-sm text-blue-600 dark:text-blue-400 truncate">
                            {entry.task_name}
                          </p>
                        </>
                      )}
                    </div>
                    {entry.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {entry.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDate(entry.start_time)}</span>
                      <span>{formatTime(entry.start_time)} - {entry.end_time ? formatTime(entry.end_time) : 'Running'}</span>
                      {entry.hourly_rate && (
                        <span>${entry.hourly_rate}/hr</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 ml-4">
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDuration(entry.duration || 0)}
                  </div>
                  {entry.hourly_rate && (
                    <div className="text-sm text-green-600 dark:text-green-400">
                      ${calculateEarnings(entry.duration || 0, entry.hourly_rate)}
                    </div>
                  )}
                  <div className="flex items-center mt-1">
                    {entry.is_billable && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Billable
                      </span>
                    )}
                    {!entry.is_billable && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        Non-billable
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Edit entry"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(entry)}
                    disabled={loading}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete entry"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Showing {timeEntries.length} most recent entries
        </p>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingEntry && (
        <TimeEntryModal
          isOpen={showEditModal}
          onClose={handleModalClose}
          timeEntry={editingEntry}
          projects={projects || []}
          onUpdated={() => {
            onRefresh();
            handleModalClose();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && entryToDelete && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={handleModalClose}
          onConfirm={handleDeleteConfirm}
          title="Delete Time Entry"
          message={`Are you sure you want to delete this time entry? This action cannot be undone.`}
          loading={loading}
        />
      )}
    </div>
  );
};

export default RecentTimeEntries;