import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon,
  StopIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import timeTrackingService from '../../services/timeTrackingService';

const TimerWidget = ({ currentTimer, projects, onTimerUpdate }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (currentTimer) {
      setSelectedProject(currentTimer.project);
      setSelectedTask(currentTimer.task || '');
      setDescription(currentTimer.description || '');
      setElapsedTime(currentTimer.elapsed_time || 0);
      setIsRunning(true);
    } else {
      setIsRunning(false);
      setElapsedTime(0);
    }
  }, [currentTimer]);

  useEffect(() => {
    let interval;
    if (isRunning && currentTimer) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentTimer]);

  useEffect(() => {
    if (selectedProject) {
      loadTasks(selectedProject);
    } else {
      setTasks([]);
      setSelectedTask('');
    }
  }, [selectedProject]);

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

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }

    const timerData = {
      project: selectedProject,
      task: selectedTask || null,
      description: description
    };

    const result = await timeTrackingService.startTimer(timerData);
    if (result.success) {
      toast.success('Timer started!');
      onTimerUpdate(result.data);
    } else {
      toast.error(result.error);
    }
  };

  const handleStop = async () => {
    if (!currentTimer) return;

    const stopData = {
      description: description,
      is_billable: true
    };

    const result = await timeTrackingService.stopTimer(currentTimer.id, stopData);
    if (result.success) {
      toast.success('Time entry saved!');
      onTimerUpdate(null);
      // Reset form
      setSelectedProject('');
      setSelectedTask('');
      setDescription('');
    } else {
      toast.error(result.error);
    }
  };

  const handleCancel = async () => {
    if (!currentTimer) return;

    const result = await timeTrackingService.cancelTimer();
    if (result.success) {
      toast.success('Timer canceled');
      onTimerUpdate(null);
      // Reset form
      setSelectedProject('');
      setSelectedTask('');
      setDescription('');
    } else {
      toast.error(result.error);
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === parseInt(projectId));
    return project ? `${project.client_name} - ${project.name}` : '';
  };

  const getTaskName = (taskId) => {
    const task = tasks.find(t => t.id === parseInt(taskId));
    return task ? task.name : '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-2">
          {formatTime(elapsedTime)}
        </div>
        {isRunning && currentTimer && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium">{getProjectName(currentTimer.project)}</p>
            {currentTimer.task && (
              <p className="text-blue-600 dark:text-blue-400">{getTaskName(currentTimer.task)}</p>
            )}
          </div>
        )}
      </div>

      {/* Timer Form */}
      <div className="space-y-4">
        {/* Project Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project *
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            disabled={isRunning}
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
        {selectedProject && tasks.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task (Optional)
            </label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              disabled={isRunning}
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

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What are you working on?"
          />
        </div>

        {/* Timer Controls */}
        <div className="flex space-x-3">
          {!isRunning ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Start Timer
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStop}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <StopIcon className="h-5 w-5 mr-2" />
                Stop & Save
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TimerWidget;