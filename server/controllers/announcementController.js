import announcementModel from '../models/announcementModel.js';


export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await announcementModel.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(announcements);
  } catch (error) {
    console.error('[getAllAnnouncements] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch announcements',
      error: error.message 
    });
  }
};


export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await announcementModel.findById(id);
    
    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }
    
    res.status(200).json(announcement);
  } catch (error) {
    console.error('[getAnnouncementById] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch announcement',
      error: error.message 
    });
  }
};

// Create announcement (admin only)
export const createAnnouncement = async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState !== 1) {
      console.error('[createAnnouncement] MongoDB not connected. ReadyState:', mongoose.default.connection.readyState);
      return res.status(503).json({ 
        success: false, 
        message: 'Database not connected. Please check your MongoDB connection.' 
      });
    }

    const { title, date, summary } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Title is required' 
      });
    }

    if (title.length > 200) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title cannot exceed 200 characters' 
      });
    }

    if (summary && summary.length > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Summary cannot exceed 1000 characters' 
      });
    }

    // Validate date if provided
    let announcementDate = date ? new Date(date) : new Date();
    if (isNaN(announcementDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid date format' 
      });
    }

    const newAnnouncement = new announcementModel({
      title: title.trim(),
      date: announcementDate,
      summary: summary ? summary.trim() : ''
    });

    await newAnnouncement.save();
    console.log('[createAnnouncement] Announcement saved successfully:', newAnnouncement._id);
    
    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error('[createAnnouncement] Error:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: error.toString()
    });
  }
};

// Update announcement (admin only)
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, summary } = req.body;

    // Validation
    if (title !== undefined) {
      if (!title || title.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          message: 'Title cannot be empty' 
        });
      }
      if (title.length > 200) {
        return res.status(400).json({ 
          success: false, 
          message: 'Title cannot exceed 200 characters' 
        });
      }
    }

    if (summary !== undefined && summary.length > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Summary cannot exceed 1000 characters' 
      });
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (title !== undefined) {
      updateData.title = title.trim();
    }
    if (date !== undefined) {
      const announcementDate = new Date(date);
      if (isNaN(announcementDate.getTime())) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid date format' 
        });
      }
      updateData.date = announcementDate;
    }
    if (summary !== undefined) {
      updateData.summary = summary.trim();
    }

    const updatedAnnouncement = await announcementModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error('[updateAnnouncement] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete announcement (admin only)
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAnnouncement = await announcementModel.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Announcement deleted successfully' 
    });
  } catch (error) {
    console.error('[deleteAnnouncement] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
