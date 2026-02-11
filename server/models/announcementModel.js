import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [1000, 'Summary cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// TTL index: automatically remove announcements 14 days after `createdAt`
announcementSchema.index({ createdAt: 1 }, { expireAfterSeconds: 14 * 24 * 60 * 60 });

// Update updatedAt before saving
// Use a synchronous pre-save hook (no `next` argument) to avoid
// situations where Mongoose may not provide a `next` callback.
announcementSchema.pre('save', function() {
  if (this.isNew) {
    this.createdAt = this.createdAt || Date.now();
  }
  this.updatedAt = Date.now();
});

const announcementModel = mongoose.models.announcement || mongoose.model('announcement', announcementSchema);
export default announcementModel;
