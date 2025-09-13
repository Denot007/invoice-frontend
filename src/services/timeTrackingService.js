import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const newToken = response.data.access;
        localStorage.setItem('token', newToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to extract error message
const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.detail) return error.detail;
  if (error?.message) return error.message;
  if (error?.description) return error.description;
  
  // Handle validation errors
  if (typeof error === 'object') {
    const firstKey = Object.keys(error)[0];
    if (firstKey && Array.isArray(error[firstKey])) {
      return error[firstKey][0];
    }
    if (firstKey && typeof error[firstKey] === 'string') {
      return error[firstKey];
    }
  }
  
  return 'An error occurred';
};

const timeTrackingService = {
  // Projects
  getProjects: async (params = {}) => {
    try {
      const response = await api.get('/api/timetracking/projects/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return { success: false, error: getErrorMessage(error.response?.data) || 'Failed to fetch projects' };
    }
  },

  getProject: async (id) => {
    try {
      const response = await api.get(`/api/timetracking/projects/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching project:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch project' };
    }
  },

  createProject: async (projectData) => {
    try {
      const response = await api.post('/api/timetracking/projects/', projectData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating project:', error);
      return { success: false, error: getErrorMessage(error.response?.data) || 'Failed to create project' };
    }
  },

  updateProject: async (id, projectData) => {
    try {
      const response = await api.put(`/api/timetracking/projects/${id}/`, projectData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating project:', error);
      return { success: false, error: error.response?.data || 'Failed to update project' };
    }
  },

  deleteProject: async (id) => {
    try {
      await api.delete(`/api/timetracking/projects/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting project:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to delete project' };
    }
  },

  // Tasks
  getTasks: async (params = {}) => {
    try {
      const response = await api.get('/api/timetracking/tasks/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch tasks' };
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await api.post('/api/timetracking/tasks/', taskData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating task:', error);
      return { success: false, error: error.response?.data || 'Failed to create task' };
    }
  },

  updateTask: async (id, taskData) => {
    try {
      const response = await api.put(`/api/timetracking/tasks/${id}/`, taskData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.response?.data || 'Failed to update task' };
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/api/timetracking/tasks/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to delete task' };
    }
  },

  // Time Entries
  getTimeEntries: async (params = {}) => {
    try {
      const response = await api.get('/api/timetracking/time-entries/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching time entries:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch time entries' };
    }
  },

  createTimeEntry: async (timeEntryData) => {
    try {
      const response = await api.post('/api/timetracking/time-entries/', timeEntryData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating time entry:', error);
      return { success: false, error: error.response?.data || 'Failed to create time entry' };
    }
  },

  updateTimeEntry: async (id, timeEntryData) => {
    try {
      const response = await api.put(`/api/timetracking/time-entries/${id}/`, timeEntryData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating time entry:', error);
      return { success: false, error: error.response?.data || 'Failed to update time entry' };
    }
  },

  deleteTimeEntry: async (id) => {
    try {
      await api.delete(`/api/timetracking/time-entries/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting time entry:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to delete time entry' };
    }
  },

  getUninvoicedEntries: async () => {
    try {
      const response = await api.get('/api/timetracking/time-entries/uninvoiced/');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching uninvoiced entries:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch uninvoiced entries' };
    }
  },

  // Timer
  getCurrentTimer: async () => {
    try {
      const response = await api.get('/api/timetracking/timers/current/');
      return { success: true, data: response.data };
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: true, data: null }; // No active timer
      }
      console.error('Error fetching current timer:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch current timer' };
    }
  },

  startTimer: async (timerData) => {
    try {
      const response = await api.post('/api/timetracking/timers/start/', timerData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error starting timer:', error);
      return { success: false, error: getErrorMessage(error.response?.data) || 'Failed to start timer' };
    }
  },

  stopTimer: async (timerId, stopData = {}) => {
    try {
      const response = await api.post(`/api/timetracking/timers/${timerId}/stop/`, stopData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error stopping timer:', error);
      return { success: false, error: getErrorMessage(error.response?.data) || 'Failed to stop timer' };
    }
  },

  cancelTimer: async () => {
    try {
      await api.delete('/api/timetracking/timers/stop_current/');
      return { success: true };
    } catch (error) {
      console.error('Error canceling timer:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to cancel timer' };
    }
  }
};

export default timeTrackingService;