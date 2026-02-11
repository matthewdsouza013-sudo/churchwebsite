import eventModel from '../models/eventModel.js';

// Helper function to convert event to calendar format
function toCalendarFormat(event) {
  // If event already has start/end, return as is
  if (event.start) {
    return {
      _id: event._id,
      id: event._id,
      title: event.title,
      start: event.start,
      end: event.end || event.start,
      extendedProps: {
        description: event.description || '',
        type: event.type || 'event'
      }
    };
  }
  
  // Convert from old format (date) to new format (start/end)
  return {
    _id: event._id,
    id: event._id,
    title: event.title,
    start: event.date || event.start,
    end: event.date || event.end || event.start,
    extendedProps: {
      description: event.description || '',
      type: event.type || 'event'
    }
  };
}

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await eventModel.find().sort({ date: 1, start: 1 });
    
    // Check if request wants calendar format (new API uses /api/events, legacy uses /api/events/all)
    const isLegacyRoute = req.originalUrl.includes('/all');
    
    if (!isLegacyRoute) {
      // Return array format for calendar
      const calendarEvents = events.map(toCalendarFormat);
      return res.status(200).json(calendarEvents);
    }
    
    // Return legacy format
    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error('[getAllEvents] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create event (admin only)
export const createEvent = async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState !== 1) {
      console.error('[createEvent] MongoDB not connected. ReadyState:', mongoose.default.connection.readyState);
      return res.status(503).json({ 
        success: false, 
        message: 'Database not connected. Please check your MongoDB connection.' 
      });
    }

    const { title, date, start, end, description, type, extendedProps } = req.body;

    console.log('[createEvent] Received data:', { title, date, start, end, description, type, extendedProps });

    // Support both old format (date) and new format (start)
    const eventDate = start || date;
    
    if (!title || !eventDate) {
      console.error('[createEvent] Validation failed: missing title or date');
      return res.status(400).json({ success: false, message: 'Title and date/start are required' });
    }

    // Extract description from extendedProps if provided
    const eventDescription = description || extendedProps?.description || '';
    const eventType = type || extendedProps?.type || 'event';

    const newEvent = new eventModel({
      title,
      date: eventDate, // Keep for backward compatibility
      start: start || eventDate, // New format
      end: end || start || eventDate, // New format
      description: eventDescription,
      type: eventType,
      createdBy: req.user?.email || 'admin',
    });

    console.log('[createEvent] Saving event to MongoDB:', newEvent);
    await newEvent.save();
    console.log('[createEvent] Event saved successfully:', newEvent._id);
    
    // Check if request wants calendar format (new API uses /api/events, legacy uses /api/events/create)
    const isLegacyRoute = req.originalUrl.includes('/create');
    
    if (!isLegacyRoute) {
      // Return calendar format (direct event object)
      return res.status(201).json(toCalendarFormat(newEvent));
    }
    
    // Return legacy format
    res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    console.error('[createEvent] Error:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: error.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update event (admin only)
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, start, end, description, type, extendedProps } = req.body;

    // Support both old format (date) and new format (start)
    const eventDate = start || date;
    const eventDescription = description || extendedProps?.description || '';
    const eventType = type || extendedProps?.type || 'event';

    const updateData = {
      title,
      updatedAt: new Date()
    };

    // Update date/start fields
    if (eventDate) {
      updateData.date = eventDate;
      updateData.start = start || eventDate;
    }
    if (end) {
      updateData.end = end;
    }
    if (eventDescription !== undefined) {
      updateData.description = eventDescription;
    }
    if (eventType !== undefined) {
      updateData.type = eventType;
    }

    const updatedEvent = await eventModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if request wants calendar format
    const wantsCalendarFormat = !req.path.includes('/update');
    
    if (wantsCalendarFormat) {
      return res.status(200).json(toCalendarFormat(updatedEvent));
    }

    res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete event (admin only)
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEvent = await eventModel.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if request wants calendar format
    const wantsCalendarFormat = !req.path.includes('/delete');
    
    if (wantsCalendarFormat) {
      return res.status(200).json({ ok: true });
    }

    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
