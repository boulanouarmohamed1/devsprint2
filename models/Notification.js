const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who made the request
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // Event the request is for
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true }, // Link to the specific request
  message: { type: String, required: true }, // Notification message (e.g., "New request for event...")
  status: { type: String, enum: ['read','unread'], default: 'unread' }, // Current status
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Notification', notificationSchema);
