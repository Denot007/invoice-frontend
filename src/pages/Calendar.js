import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, addDays, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Send, Clock, DollarSign, Mail, MessageSquare, Phone, Video, X, Check, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import eventService from '../services/eventService';
import apiService from '../services/apiService';
import { useTheme } from '../context/ThemeContext';

const CalendarDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [draggedEvent, setDraggedEvent] = useState(null);
  
  // Debug auth token
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Current auth token:', token ? 'Token exists' : 'No token found');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token expires:', new Date(payload.exp * 1000));
        console.log('Token is expired:', payload.exp * 1000 < Date.now());
      } catch (e) {
        console.log('Cannot parse token');
      }
    }
  }, []);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const dragCounter = useRef(0);

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const result = await eventService.getEvents();
    if (result.success) {
      // Handle paginated response from Django REST Framework
      const eventsData = result.data.results || result.data;
      // Ensure it's always an array
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } else {
      toast.error('Failed to fetch events');
      setEvents([]); // Set empty array on error
    }
  };

  // Get week dates
  const getWeekDates = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  // Handle drag start
  const handleDragStart = (e, event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drag enter
  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.target.classList.contains('day-cell')) {
      e.target.classList.add('bg-slate-700/50');
    }
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    dragCounter.current--;
    if (dragCounter.current === 0 && e.target.classList.contains('day-cell')) {
      e.target.classList.remove('bg-slate-700/50');
    }
  };

  // Handle drop
  const handleDrop = async (e, date) => {
    e.preventDefault();
    e.target.classList.remove('bg-slate-700/50');
    dragCounter.current = 0;

    if (draggedEvent && draggedEvent.status !== 'paid') {
      const newDate = format(date, 'yyyy-MM-dd');
      const result = await eventService.updateEventDate(draggedEvent.id, newDate);
      
      if (result.success) {
        const updatedEvent = { ...draggedEvent, date: newDate };
        setEvents(events.map(evt => evt.id === draggedEvent.id ? updatedEvent : evt));
        toast.success('Event rescheduled successfully');
      } else {
        toast.error('Failed to update event');
      }
    }
    setDraggedEvent(null);
  };

  // Send all reminders
  const sendAllReminders = async () => {
    setLoading(true);
    const result = await eventService.sendAllReminders();
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error('Failed to send reminders');
    }
    setLoading(false);
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => isSameDay(parseISO(event.date), date));
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-gradient-to-r from-green-500 to-green-600';
      case 'unpaid': return 'bg-gradient-to-r from-orange-500 to-orange-600';
      case 'draft': return 'bg-gradient-to-r from-gray-500 to-gray-600';
      case 'appointment': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      default: return 'bg-gradient-to-r from-slate-500 to-slate-600';
    }
  };

  const weekDates = getWeekDates();

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex items-center gap-2 transition-colors mb-4 ${theme === 'dark' ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Calendar Dashboard</h1>
          <p className={theme === 'dark' ? 'text-white/60' : 'text-gray-600'}>Manage your events, appointments, and reminders</p>
        </motion.div>
        
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-64 space-y-4"
          >
            {/* Month/Year Picker */}
            <div className={theme === 'dark' ? 'bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20' : 'bg-white/80 backdrop-blur-md rounded-xl p-4 border border-gray/20 shadow-lg'}>
              <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <CalendarIcon className="w-5 h-5" />
                Date Navigation
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                  >
                    <ChevronLeft className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
                  </button>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {format(currentDate, 'MMMM yyyy')}
                  </span>
                  <button
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                  >
                    <ChevronRight className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Add Event Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddEvent(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Event
            </motion.button>

            {/* Add Appointment Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAppointmentModal(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              <Clock className="w-5 h-5" />
              Schedule Appointment
            </motion.button>

            {/* Stats */}
            <div className={theme === 'dark' ? 'bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 space-y-3' : 'bg-white/90 backdrop-blur-md rounded-xl p-4 border border-gray-200 shadow-lg space-y-3'}>
              <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Paid</span>
                  <span className="text-green-500 font-medium">
                    {events.filter(e => e.status === 'paid').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Unpaid</span>
                  <span className="text-orange-500 font-medium">
                    {events.filter(e => e.status === 'unpaid').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Appointments</span>
                  <span className="text-blue-500 font-medium">
                    {events.filter(e => e.status === 'appointment').length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Calendar Grid */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex-1"
          >
            <div className={`backdrop-blur-md rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white/90 border-gray-300'}`}>
              {/* Week Header */}
              <div className={`grid grid-cols-7 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                {weekDates.map((date, index) => (
                  <div key={index} className={`p-4 border-r last:border-r-0 ${theme === 'dark' ? 'border-white/10' : 'border-gray-300'}`}>
                    <div className="text-center">
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {format(date, 'EEE')}
                      </div>
                      <div className={`text-lg font-semibold mt-1 ${
                        isSameDay(date, new Date()) ? 'text-blue-500' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {format(date, 'd')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 h-[500px]">
                {weekDates.map((date, index) => (
                  <div
                    key={index}
                    className={`day-cell border-r border-t last:border-r-0 p-2 overflow-y-auto transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-gray-300'}`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, date)}
                  >
                    <AnimatePresence>
                      {getEventsForDate(date).map((event) => (
                        <motion.div
                          key={event.id}
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          draggable={event.status !== 'paid'}
                          onDragStart={(e) => handleDragStart(e, event)}
                          className={`${getStatusColor(event.status)} rounded-lg p-2 mb-2 cursor-move hover:shadow-lg transition-all group relative`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="text-white text-xs font-medium truncate">
                            {event.title}
                          </div>
                          {event.client_name && (
                            <div className="text-white/70 text-xs truncate">
                              {event.client_name}
                            </div>
                          )}
                          <div className="text-white/80 text-xs mt-1 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${event.amount}
                          </div>
                          
                          {/* Client Reply Bubble */}
                          {event.client_reply && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1.5 shadow-lg"
                            >
                              <MessageSquare className="w-3 h-3 text-slate-900" />
                              <div className="absolute top-full right-0 mt-1 bg-slate-800 text-white text-xs p-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {event.client_reply}
                              </div>
                            </motion.div>
                          )}

                          {/* Appointment Indicator */}
                          {event.status === 'appointment' && (
                            <div className="text-white/90 text-xs mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.time}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Sticky Bar */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-white/20 p-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">Quick Actions</span>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  {events.filter(e => e.status === 'paid').length} Paid
                </span>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                  {events.filter(e => e.status === 'unpaid').length} Unpaid
                </span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendAllReminders}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending...' : 'Send All Reminders'}
            </motion.button>
          </div>
        </motion.div>

        {/* Add Event Modal */}
        <AnimatePresence>
          {showAddEvent && (
            <AddEventModal 
              theme={theme}
              onClose={() => setShowAddEvent(false)}
              onEventAdded={(newEvent) => {
                setEvents(prevEvents => [...(Array.isArray(prevEvents) ? prevEvents : []), newEvent]);
                setShowAddEvent(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* Appointment Modal */}
        <AnimatePresence>
          {showAppointmentModal && (
            <AppointmentModal
              theme={theme}
              onClose={() => setShowAppointmentModal(false)}
              onAppointmentScheduled={(appointment) => {
                setEvents(prevEvents => [...(Array.isArray(prevEvents) ? prevEvents : []), appointment]);
                setShowAppointmentModal(false);
                toast.success('Appointment scheduled successfully!');
              }}
            />
          )}
        </AnimatePresence>

        {/* Event Details Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <EventDetailsModal
              theme={theme}
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
              onUpdate={(updatedEvent) => {
                setEvents(prevEvents => 
                  Array.isArray(prevEvents) 
                    ? prevEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e)
                    : []
                );
                setSelectedEvent(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Add Event Modal Component
const AddEventModal = ({ theme, onClose, onEventAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    client_name: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'draft',
    invoice_id: null
  });

  const handleSubmit = async (e) => {
    console.log('AddEventModal handleSubmit called');
    e.preventDefault();
    
    // Clean up the form data - remove invoice_id if it's null or empty
    const cleanedData = { ...formData };
    if (!cleanedData.invoice_id) {
      delete cleanedData.invoice_id;
    }
    
    console.log('Form data:', cleanedData);
    
    try {
      const result = await eventService.createEvent(cleanedData);
      console.log('EventService result:', result);
      
      if (result.success) {
        onEventAdded(result.data);
        toast.success('Event added successfully!');
      } else {
        toast.error(result.message || 'Failed to add event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Error: ' + error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`rounded-2xl p-6 max-w-md w-full border ${theme === 'dark' ? 'bg-slate-800 border-white/20' : 'bg-white border-gray-200 shadow-xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add New Event</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              required
            />
          </div>
          
          <div>
            <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Client</label>
            <input
              type="text"
              value={formData.client_name}
              onChange={(e) => setFormData({...formData, client_name: e.target.value})}
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              required
            />
          </div>
          
          <div>
            <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              required
            />
          </div>
          
          <div>
            <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              required
            />
          </div>
          
          <div>
            <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
            >
              <option value="draft">Draft</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              onClick={() => console.log('Add Event button clicked')}
            >
              Add Event
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Appointment Modal Component
const AppointmentModal = ({ theme, onClose, onAppointmentScheduled }) => {
  const [formData, setFormData] = useState({
    title: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    address: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    duration: '60',
    appointment_type: 'meeting',
    notes: '',
    send_reminder: true,
    reminder_time: '24'
  });

  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const suggestionsRef = useRef(null);

  // Debounced client search
  const searchClients = async (searchTerm) => {
    if (searchTerm.length < 2) {
      setClientSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await apiService.getClients({ search: searchTerm, limit: 5 });
      const clients = response.results || response;
      setClientSuggestions(Array.isArray(clients) ? clients.slice(0, 5) : []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching clients:', error);
      setClientSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle client name input change with debouncing
  const handleClientNameChange = (e) => {
    const value = e.target.value;
    setFormData({...formData, client_name: value});

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      searchClients(value);
    }, 300);
    setSearchTimeout(newTimeout);
  };

  // Handle client selection from dropdown
  const handleClientSelect = (client) => {
    setFormData({
      ...formData,
      client_name: client.name || '',
      client_email: client.email || '',
      client_phone: client.phone || '',
      address: client.address || ''
    });
    setShowSuggestions(false);
    setClientSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleSubmit = async (e) => {
    console.log('AppointmentModal handleSubmit called');
    e.preventDefault();
    console.log('Appointment form data:', formData);
    
    try {
      const result = await eventService.scheduleAppointment(formData);
      console.log('AppointmentService result:', result);
      
      if (result.success) {
        onAppointmentScheduled(result.data);
        toast.success('Appointment scheduled successfully!');
      } else {
        toast.error(result.message || 'Failed to schedule appointment');
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast.error('Error: ' + error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`rounded-2xl p-6 max-w-lg w-full border max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-slate-800 border-white/20' : 'bg-white border-gray-200 shadow-xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <Clock className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
          Schedule Appointment
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Appointment Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-400 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              placeholder="e.g., Initial Consultation"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="relative" ref={suggestionsRef}>
              <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Client Name</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={handleClientNameChange}
                className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-400 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                placeholder="Type to search clients..."
                required
              />
              
              {/* Client suggestions dropdown */}
              {showSuggestions && clientSuggestions.length > 0 && (
                <div className={`absolute z-10 w-full mt-1 rounded-lg border max-h-48 overflow-y-auto ${theme === 'dark' ? 'bg-slate-700 border-white/20' : 'bg-white border-gray-300 shadow-lg'}`}>
                  {clientSuggestions.map((client, index) => (
                    <div
                      key={client.id || index}
                      onClick={() => handleClientSelect(client)}
                      className={`p-3 cursor-pointer hover:${theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'} border-b last:border-b-0 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
                    >
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{client.name}</div>
                      {client.email && (
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{client.email}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
              <input
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-400 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                required
              />
            </div>
          </div>
          
          <div>
            <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
            <input
              type="tel"
              value={formData.client_phone}
              onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-400 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Address field - only show for in-person meetings */}
          {formData.appointment_type === 'meeting' && (
            <div>
              <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-400 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                placeholder="Meeting location address"
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-400 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                required
              />
            </div>
            
            <div>
              <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-400 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Duration (minutes)</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-400 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            
            <div>
              <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Meeting Type</label>
              <select
                value={formData.appointment_type}
                onChange={(e) => setFormData({...formData, appointment_type: e.target.value})}
                className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-400 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              >
                <option value="meeting">In-Person Meeting</option>
                <option value="phone">Phone Call</option>
                <option value="video">Video Call</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-400 h-20 resize-none ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              placeholder="Any special requirements or notes..."
            />
          </div>
          
          <div className={`border rounded-lg p-4 ${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <label className={`font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Mail className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                Email Reminder
              </label>
              <input
                type="checkbox"
                checked={formData.send_reminder}
                onChange={(e) => setFormData({...formData, send_reminder: e.target.checked})}
                className="w-4 h-4 accent-purple-500"
              />
            </div>
            
            {formData.send_reminder && (
              <div>
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Send reminder before</label>
                <select
                  value={formData.reminder_time}
                  onChange={(e) => setFormData({...formData, reminder_time: e.target.value})}
                  className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-400 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                >
                  <option value="1">1 hour before</option>
                  <option value="2">2 hours before</option>
                  <option value="24">24 hours before</option>
                  <option value="48">48 hours before</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              onClick={() => console.log('Schedule Appointment button clicked')}
            >
              <Check className="w-4 h-4" />
              Schedule Appointment
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Event Details Modal
const EventDetailsModal = ({ theme, event, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(event);

  const handleUpdate = async () => {
    const result = await eventService.updateEvent(event.id, formData);
    
    if (result.success) {
      onUpdate(result.data);
      toast.success('Event updated successfully!');
    } else {
      toast.error('Failed to update event');
    }
  };

  const getTypeIcon = () => {
    if (event.status === 'appointment') {
      switch (event.type) {
        case 'video': return <Video className="w-5 h-5" />;
        case 'phone': return <Phone className="w-5 h-5" />;
        default: return <Clock className="w-5 h-5" />;
      }
    }
    return <DollarSign className="w-5 h-5" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {getTypeIcon()}
            {event.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Client:</span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{event.client_name || event.client || 'N/A'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Date:</span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{format(parseISO(event.date), 'MMM dd, yyyy')}</span>
          </div>
          
          {event.status === 'appointment' && event.time && (
            <div className="flex justify-between">
              <span className="text-gray-400">Time:</span>
              <span className="text-white">{event.time}</span>
            </div>
          )}
          
          {event.amount > 0 && (
            <div className="flex justify-between">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Amount:</span>
              <span className={theme === 'dark' ? 'text-white font-medium' : 'text-gray-900 font-medium'}>${event.amount}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              event.status === 'paid' ? 'bg-green-500/20 text-green-400' :
              event.status === 'unpaid' ? 'bg-orange-500/20 text-orange-400' :
              event.status === 'appointment' ? 'bg-blue-500/20 text-blue-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>
          
          {event.client_reply && (
            <div className={theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3' : 'bg-yellow-100 border border-yellow-300 rounded-lg p-3'}>
              <div className={theme === 'dark' ? 'text-yellow-400 text-sm font-medium mb-1' : 'text-yellow-700 text-sm font-medium mb-1'}>Client Reply:</div>
              <div className={theme === 'dark' ? 'text-white text-sm' : 'text-gray-800 text-sm'}>{event.client_reply}</div>
            </div>
          )}
          
          {event.notes && (
            <div className={theme === 'dark' ? 'bg-white/5 rounded-lg p-3' : 'bg-gray-100 rounded-lg p-3'}>
              <div className={theme === 'dark' ? 'text-gray-400 text-sm mb-1' : 'text-gray-600 text-sm mb-1'}>Notes:</div>
              <div className={theme === 'dark' ? 'text-white text-sm' : 'text-gray-800 text-sm'}>{event.notes}</div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          {event.status === 'appointment' && (
            <button
              onClick={async () => {
                const result = await eventService.updateEvent(event.id, { status: 'completed' });
                if (result.success) {
                  onUpdate(result.data);
                  toast.success('Appointment marked as complete!');
                } else {
                  toast.error('Failed to mark appointment as complete');
                }
              }}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark Complete
            </button>
          )}
          {event.status === 'unpaid' && (
            <button
              onClick={async () => {
                const result = await eventService.markAsPaid(event.id);
                if (result.success) {
                  onUpdate(result.data);
                  toast.success('Event marked as paid!');
                } else {
                  toast.error('Failed to mark as paid');
                }
              }}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Mark as Paid
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CalendarDashboard;