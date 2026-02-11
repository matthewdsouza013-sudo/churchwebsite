import express from 'express';
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';

const eventRouter = express.Router();

// Public route - get all events (new calendar format)
eventRouter.get('/', getAllEvents);

// Legacy route - get all events (backward compatibility)
eventRouter.get('/all', getAllEvents);

// Admin routes (new calendar format)
eventRouter.post('/', createEvent);
eventRouter.put('/:id', updateEvent);
eventRouter.delete('/:id', deleteEvent);

// Legacy admin routes (backward compatibility)
eventRouter.post('/create', createEvent);
eventRouter.put('/update/:id', updateEvent);
eventRouter.delete('/delete/:id', deleteEvent);

export default eventRouter;
