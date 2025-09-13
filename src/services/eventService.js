import apiService from './apiService';

class EventService {
  constructor() {
    this.useAPI = true; // Switch to false to use mock data
    
    // Mock data for development
    this.mockEvents = [
      {
        id: 1,
        title: 'Invoice #001 Due',
        date: '2025-09-12',
        time: null,
        client: 'Acme Corp',
        client_name: 'Acme Corp',
        client_email: 'contact@acmecorp.com',
        client_phone: '+1234567890',
        amount: 2500.00,
        status: 'unpaid',
        client_reply: 'Sink broke again, need more time',
        appointment_type: null,
        duration: 60,
        created_at: '2025-09-10T10:00:00Z'
      },
      {
        id: 2,
        title: 'Initial Consultation',
        date: '2025-09-13',
        time: '10:00:00',
        client: 'Tech Startup',
        client_name: 'John Smith',
        client_email: 'john@techstartup.com',
        client_phone: '+1987654321',
        amount: 0,
        status: 'appointment',
        client_reply: null,
        appointment_type: 'video',
        duration: 60,
        location: '',
        meeting_link: 'https://zoom.us/j/123456789',
        created_at: '2025-09-10T11:00:00Z'
      },
      {
        id: 3,
        title: 'Invoice #002 Due',
        date: '2025-09-14',
        time: null,
        client: 'Local Business',
        client_name: 'Local Business',
        client_email: 'owner@localbiz.com',
        client_phone: '',
        amount: 1200.00,
        status: 'paid',
        client_reply: null,
        appointment_type: null,
        duration: 60,
        created_at: '2025-09-10T12:00:00Z'
      },
      {
        id: 4,
        title: 'Project Review Meeting',
        date: '2025-09-15',
        time: '14:00:00',
        client: 'Enterprise Client',
        client_name: 'Sarah Johnson',
        client_email: 'sarah@enterprise.com',
        client_phone: '+1555123456',
        amount: 0,
        status: 'appointment',
        client_reply: null,
        appointment_type: 'meeting',
        duration: 90,
        location: '123 Business Ave, Suite 100',
        meeting_link: '',
        created_at: '2025-09-10T13:00:00Z'
      }
    ];
  }

  // Get all events
  async getEvents(filters = {}) {
    if (this.useAPI) {
      try {
        const params = new URLSearchParams();
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.status) params.append('status', filters.status);
        if (filters.client_id) params.append('client_id', filters.client_id);

        const response = await apiService.get(`events/?${params.toString()}`);
        console.log('Events API response:', response);
        return {
          success: true,
          data: response.data || response,
          message: 'Events fetched successfully'
        };
      } catch (error) {
        console.error('API Error fetching events:', error);
        // Fallback to mock data
        return {
          success: true,
          data: this.mockEvents,
          message: 'Using mock data (API unavailable)'
        };
      }
    }
    
    return {
      success: true,
      data: this.mockEvents,
      message: 'Using mock events data'
    };
  }

  // Get single event
  async getEvent(id) {
    if (this.useAPI) {
      try {
        const response = await apiService.get(`events/${id}/`);
        return {
          success: true,
          data: response.data || response,
          message: 'Event fetched successfully'
        };
      } catch (error) {
        console.error('API Error fetching event:', error);
        const mockEvent = this.mockEvents.find(e => e.id === parseInt(id));
        return {
          success: !!mockEvent,
          data: mockEvent,
          message: mockEvent ? 'Using mock data (API unavailable)' : 'Event not found'
        };
      }
    }

    const mockEvent = this.mockEvents.find(e => e.id === parseInt(id));
    return {
      success: !!mockEvent,
      data: mockEvent,
      message: mockEvent ? 'Using mock event data' : 'Event not found'
    };
  }

  // Create new event
  async createEvent(eventData) {
    console.log('EventService.createEvent called with:', eventData);
    if (this.useAPI) {
      try {
        console.log('Making API call to create event...');
        const response = await apiService.post('events/', eventData);
        console.log('API response:', response);
        return {
          success: true,
          data: response.data || response,
          message: 'Event created successfully'
        };
      } catch (error) {
        console.error('API Error creating event:', error);
        return {
          success: false,
          error: error.message,
          message: 'Failed to create event'
        };
      }
    }

    // Mock creation
    const newEvent = {
      ...eventData,
      id: Math.max(...this.mockEvents.map(e => e.id)) + 1,
      created_at: new Date().toISOString()
    };
    this.mockEvents.push(newEvent);

    return {
      success: true,
      data: newEvent,
      message: 'Event created successfully (mock)'
    };
  }

  // Create event from invoice
  async createEventFromInvoice(invoiceId, eventData = {}) {
    if (this.useAPI) {
      try {
        const response = await apiService.post('events/', {
          invoice_id: invoiceId,
          ...eventData
        });
        return {
          success: true,
          data: response.data || response,
          message: 'Event created from invoice successfully'
        };
      } catch (error) {
        console.error('API Error creating event from invoice:', error);
        return {
          success: false,
          error: error.message,
          message: 'Failed to create event from invoice'
        };
      }
    }

    // Mock creation from invoice
    const newEvent = {
      title: `Invoice #${invoiceId} Due`,
      date: eventData.date || new Date().toISOString().split('T')[0],
      client_name: 'Mock Client',
      client_email: 'client@example.com',
      amount: 1500.00,
      status: 'unpaid',
      ...eventData,
      id: Math.max(...this.mockEvents.map(e => e.id)) + 1,
      invoice_id: invoiceId,
      created_at: new Date().toISOString()
    };
    this.mockEvents.push(newEvent);

    return {
      success: true,
      data: newEvent,
      message: 'Event created from invoice successfully (mock)'
    };
  }

  // Schedule appointment
  async scheduleAppointment(appointmentData) {
    console.log('EventService.scheduleAppointment called with:', appointmentData);
    if (this.useAPI) {
      try {
        console.log('Making API call to schedule appointment...');
        const response = await apiService.post('events/appointments/', appointmentData);
        console.log('API response:', response);
        return {
          success: true,
          data: response.data || response,
          message: 'Appointment scheduled successfully'
        };
      } catch (error) {
        console.error('API Error scheduling appointment:', error);
        return {
          success: false,
          error: error.message,
          message: 'Failed to schedule appointment'
        };
      }
    }

    // Mock appointment scheduling
    const newAppointment = {
      ...appointmentData,
      id: Math.max(...this.mockEvents.map(e => e.id)) + 1,
      status: 'appointment',
      amount: 0,
      created_at: new Date().toISOString()
    };
    this.mockEvents.push(newAppointment);

    return {
      success: true,
      data: newAppointment,
      message: 'Appointment scheduled successfully (mock)'
    };
  }

  // Update event (including drag and drop)
  async updateEvent(id, eventData) {
    if (this.useAPI) {
      try {
        const method = Object.keys(eventData).length === 1 ? 'patch' : 'put';
        const response = await apiService[method](`events/${id}/`, eventData);
        return {
          success: true,
          data: response.data || response,
          message: 'Event updated successfully'
        };
      } catch (error) {
        console.error('API Error updating event:', error);
        return {
          success: false,
          error: error.message,
          message: 'Failed to update event'
        };
      }
    }

    // Mock update
    const eventIndex = this.mockEvents.findIndex(e => e.id === parseInt(id));
    if (eventIndex !== -1) {
      this.mockEvents[eventIndex] = { ...this.mockEvents[eventIndex], ...eventData };
      return {
        success: true,
        data: this.mockEvents[eventIndex],
        message: 'Event updated successfully (mock)'
      };
    }

    return {
      success: false,
      error: 'Event not found',
      message: 'Failed to update event'
    };
  }

  // Update event date (drag and drop)
  async updateEventDate(id, newDate) {
    return this.updateEvent(id, { date: newDate });
  }

  // Delete event
  async deleteEvent(id) {
    if (this.useAPI) {
      try {
        await apiService.delete(`events/${id}/`);
        return {
          success: true,
          message: 'Event deleted successfully'
        };
      } catch (error) {
        console.error('API Error deleting event:', error);
        return {
          success: false,
          error: error.message,
          message: 'Failed to delete event'
        };
      }
    }

    // Mock deletion
    const eventIndex = this.mockEvents.findIndex(e => e.id === parseInt(id));
    if (eventIndex !== -1) {
      this.mockEvents.splice(eventIndex, 1);
      return {
        success: true,
        message: 'Event deleted successfully (mock)'
      };
    }

    return {
      success: false,
      error: 'Event not found',
      message: 'Failed to delete event'
    };
  }

  // Send all reminders
  async sendAllReminders() {
    if (this.useAPI) {
      try {
        const response = await apiService.post('events/send_reminders/');
        return {
          success: true,
          data: response.data || response,
          message: response.data?.message || 'Reminders sent successfully'
        };
      } catch (error) {
        console.error('API Error sending reminders:', error);
        return {
          success: false,
          error: error.message,
          message: 'Failed to send reminders'
        };
      }
    }

    return {
      success: true,
      data: { emails_sent: 3, sms_sent: 1 },
      message: 'All reminders sent successfully (mock)'
    };
  }

  // Send individual reminder
  async sendReminder(id) {
    if (this.useAPI) {
      try {
        const response = await apiService.post(`events/${id}/send_reminder/`);
        return {
          success: true,
          data: response.data || response,
          message: 'Reminder sent successfully'
        };
      } catch (error) {
        console.error('API Error sending reminder:', error);
        return {
          success: false,
          error: error.message,
          message: 'Failed to send reminder'
        };
      }
    }

    return {
      success: true,
      data: { email_sent: true, sms_sent: false },
      message: 'Reminder sent successfully (mock)'
    };
  }

  // Mark event as paid
  async markAsPaid(id) {
    if (this.useAPI) {
      try {
        const response = await apiService.post(`events/${id}/mark_paid/`);
        return {
          success: true,
          data: response.data || response,
          message: 'Event marked as paid'
        };
      } catch (error) {
        console.error('API Error marking event as paid:', error);
        return {
          success: false,
          error: error.message,
          message: 'Failed to mark event as paid'
        };
      }
    }

    // Mock mark as paid
    return this.updateEvent(id, { status: 'paid' });
  }

  // Add client reply
  async addClientReply(id, reply) {
    if (this.useAPI) {
      try {
        const response = await apiService.post(`events/${id}/client-reply/`, { reply });
        return {
          success: true,
          data: response.data || response,
          message: 'Client reply added'
        };
      } catch (error) {
        console.error('API Error adding client reply:', error);
        return {
          success: false,
          error: error.message,
          message: 'Failed to add client reply'
        };
      }
    }

    // Mock client reply
    return this.updateEvent(id, { client_reply: reply });
  }

  // Confirm appointment
  async confirmAppointment(id) {
    if (this.useAPI) {
      try {
        const response = await apiService.post(`events/${id}/confirm-appointment/`);
        return {
          success: true,
          data: response.data || response,
          message: 'Appointment confirmed'
        };
      } catch (error) {
        console.error('API Error confirming appointment:', error);
        return {
          success: false,
          error: error.message,
          message: 'Failed to confirm appointment'
        };
      }
    }

    // Mock confirmation
    return this.updateEvent(id, { client_confirmed: true });
  }

  // Cancel appointment
  async cancelAppointment(id, reason = '') {
    if (this.useAPI) {
      try {
        const response = await apiService.post(`events/${id}/cancel-appointment/`, { reason });
        return {
          success: true,
          data: response.data || response,
          message: 'Appointment cancelled'
        };
      } catch (error) {
        console.error('API Error cancelling appointment:', error);
        return {
          success: false,
          error: error.message,
          message: 'Failed to cancel appointment'
        };
      }
    }

    // Mock cancellation
    return this.updateEvent(id, { status: 'cancelled', cancellation_reason: reason });
  }

  // Get event templates
  async getEventTemplates() {
    if (this.useAPI) {
      try {
        const response = await apiService.get('/event-templates/');
        return {
          success: true,
          data: response.data || response,
          message: 'Templates fetched successfully'
        };
      } catch (error) {
        console.error('API Error fetching templates:', error);
        return {
          success: false,
          error: error.message,
          message: 'Failed to fetch templates'
        };
      }
    }

    // Mock templates
    const mockTemplates = [
      {
        id: 1,
        name: 'Initial Consultation',
        title_template: 'Initial Consultation with {client}',
        default_duration: 60,
        appointment_type: 'meeting',
        default_send_reminder: true,
        default_reminder_time: 24
      },
      {
        id: 2,
        name: 'Follow-up Call',
        title_template: 'Follow-up Call - {client}',
        default_duration: 30,
        appointment_type: 'phone',
        default_send_reminder: true,
        default_reminder_time: 2
      }
    ];

    return {
      success: true,
      data: mockTemplates,
      message: 'Using mock template data'
    };
  }
}

const eventService = new EventService();
export default eventService;