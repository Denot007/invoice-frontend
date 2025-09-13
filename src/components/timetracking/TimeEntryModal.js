import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { 
  XMarkIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import timeTrackingService from '../../services/timeTrackingService';

const TimeEntryModal = ({ isOpen, onClose, timeEntry, projects, onUpdated }) => {
  const [formData, setFormData] = useState({
    description: '',
    project: '',
    task: '',
    start_time: '',
    end_time: '',
    duration: '',
    is_billable: true,
    hourly_rate: ''
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timeEntry && isOpen) {
      // Format datetime for input fields
      const formatDateTimeLocal = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        description: timeEntry.description || '',
        project: timeEntry.project || '',
        task: timeEntry.task || '',
        start_time: formatDateTimeLocal(timeEntry.start_time),
        end_time: timeEntry.end_time ? formatDateTimeLocal(timeEntry.end_time) : '',
        duration: timeEntry.duration || '',
        is_billable: timeEntry.is_billable || false,
        hourly_rate: timeEntry.hourly_rate || ''
      });

      if (timeEntry.project) {
        loadTasks(timeEntry.project);
      }
    }
  }, [timeEntry, isOpen]);

  useEffect(() => {
    if (formData.project) {
      loadTasks(formData.project);
    } else {
      setTasks([]);
      setFormData(prev => ({ ...prev, task: '' }));
    }
  }, [formData.project]);

  const loadTasks = async (projectId) => {
    const result = await timeTrackingService.getTasks({ 
      project: projectId, 
      is_active: true 
    });
    if (result.success) {
      const tasksData = result.data.results || result.data;
      setTasks(tasksData);
    }
  };

  const calculateDuration = () => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);
      const diffMs = end - start;
      const diffHours = diffMs / (1000 * 60 * 60);
      return Math.max(0, Number(diffHours.toFixed(2)));
    }
    return 0;
  };

  useEffect(() => {
    const duration = calculateDuration();
    setFormData(prev => ({ ...prev, duration }));
  }, [formData.start_time, formData.end_time]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    if (!formData.project) {
      toast.error('Please select a project');
      return;
    }

    if (!formData.start_time) {
      toast.error('Please enter start time');
      return;
    }

    if (!formData.end_time) {
      toast.error('Please enter end time');
      return;
    }

    if (formData.duration <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    setLoading(true);
    const updateData = {
      ...formData,
      task: formData.task || null,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null
    };

    const result = await timeTrackingService.updateTimeEntry(timeEntry.id, updateData);

    if (result.success) {
      toast.success('Time entry updated successfully!');
      onUpdated();
      handleClose();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setFormData({
      description: '',
      project: '',
      task: '',
      start_time: '',
      end_time: '',
      duration: '',
      is_billable: true,
      hourly_rate: ''
    });
    onClose();
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === parseInt(projectId));
    return project ? `${project.client_name} - ${project.name}` : '';
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-xl font-semibold text-white flex items-center">
                      <ClockIcon className="h-6 w-6 mr-2" />
                      Edit Time Entry
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project *
                      </label>
                      <select
                        required
                        value={formData.project}
                        onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a project...</option>
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.client_name} - {project.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Task Selection */}
                    {tasks.length > 0 && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Task (Optional)
                        </label>
                        <select
                          value={formData.task}
                          onChange={(e) => setFormData(prev => ({ ...prev, task: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a task...</option>
                          {tasks.map(task => (
                            <option key={task.id} value={task.id}>
                              {task.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Start Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Time *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.start_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Time *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.end_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duration (hours)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.duration}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    {/* Hourly Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hourly Rate
                      </label>
                      <div className="relative">
                        <CurrencyDollarIcon className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.hourly_rate}
                          onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What did you work on?"
                    />
                  </div>

                  {/* Billable */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_billable"
                      checked={formData.is_billable}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_billable: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_billable" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      This time is billable
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Entry'}
                    </motion.button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TimeEntryModal;