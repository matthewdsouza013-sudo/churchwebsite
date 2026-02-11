import express from 'express';
import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';

const announcementRouter = express.Router();

// Public routes
announcementRouter.get('/', getAllAnnouncements);
announcementRouter.get('/:id', getAnnouncementById);

// Admin routes (add authentication middleware later if needed)
announcementRouter.post('/', createAnnouncement);
announcementRouter.put('/:id', updateAnnouncement);
announcementRouter.delete('/:id', deleteAnnouncement);

export default announcementRouter;
