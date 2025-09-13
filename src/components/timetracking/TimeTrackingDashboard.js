import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon,
  PlusIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import TimerWidget from './TimerWidget';
import ProjectSelector from './ProjectSelector';
import RecentTimeEntries from './RecentTimeEntries';
import timeTrackingService from '../../services/timeTrackingService';

const TimeTrackingDashboard = () => {
  const [currentTimer, setCurrentTimer] = useState(null);
  const [projects, setProjects] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load current timer
    const timerResult = await timeTrackingService.getCurrentTimer();
    if (timerResult.success) {
      setCurrentTimer(timerResult.data);
    }
    
    // Load projects
    const projectsResult = await timeTrackingService.getProjects({ is_active: true });
    if (projectsResult.success) {
      const projectsData = projectsResult.data.results || projectsResult.data;
      setProjects(projectsData);
    }
    
    // Load recent time entries
    const entriesResult = await timeTrackingService.getTimeEntries();
    if (entriesResult.success) {
      const entriesData = entriesResult.data.results || entriesResult.data;
      setTimeEntries(entriesData.slice(0, 10)); // Show only recent 10 entries
    }
    
    setLoading(false);
  };

  const handleTimerUpdate = (timer) => {
    setCurrentTimer(timer);
    loadData(); // Refresh data when timer changes
  };

  const handleNewProject = () => {
    setShowProjectSelector(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Time Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your time and manage projects
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNewProject}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Project
        </motion.button>
      </div>

      {/* Timer Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimerWidget 
            currentTimer={currentTimer}
            projects={projects}
            onTimerUpdate={handleTimerUpdate}
          />
        </div>
        
        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today's Hours</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {/* This would be calculated from today's entries */}
                  0.0h
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {/* This would be calculated from this week's entries */}
                  0.0h
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {projects.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Time Entries */}
      <div>
        <RecentTimeEntries 
          timeEntries={timeEntries}
          onRefresh={loadData}
          projects={projects}
        />
      </div>

      {/* Project Selector Modal */}
      {showProjectSelector && (
        <ProjectSelector
          isOpen={showProjectSelector}
          onClose={() => setShowProjectSelector(false)}
          onProjectCreated={loadData}
        />
      )}
    </div>
  );
};

export default TimeTrackingDashboard;