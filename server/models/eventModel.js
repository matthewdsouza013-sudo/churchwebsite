import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    // Not required anymore, can use start instead
  },
  start: {
    type: String,
    // New field for calendar format
  },
  end: {
    type: String,
    // New field for calendar format
  },
  description: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['feast', 'mass', 'special', 'event'],
    default: 'event',
  },
  createdBy: {
    type: String,
    default: 'admin',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Validation: ensure either date or start is provided
// Use a synchronous pre-validate hook (no `next` argument) to avoid
// situations where Mongoose may not provide a `next` callback.
eventSchema.pre('validate', function() {
  if (!this.date && !this.start) {
    this.date = this.start || new Date().toISOString().split('T')[0];
  }
  if (!this.start && this.date) {
    this.start = this.date;
  }
  if (!this.end) {
    this.end = this.start || this.date;
  }
});

const eventModel = mongoose.models.event || mongoose.model('event', eventSchema);
export default eventModel;
