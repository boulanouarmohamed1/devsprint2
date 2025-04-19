const mongoose = require('mongoose');
const Notification = require('./Notification');
const User = require('./User');
const Event = require('./Event');

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: Boolean, default: false },
  treated: { type: Boolean, default: false },
  qrCode: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 🔔 Auto-create a notification after a new request is saved
requestSchema.post('save', async function (doc) {
  try {
    const user = await User.findById(doc.userId);
    const event = await Event.findById(doc.eventId);

    if (!user || !event) return;

    const message = `${user.name} has requested to join the event "${event.title}"`;

    await Notification.create({
      userId: doc.userId,
      eventId: doc.eventId,
      requestId: doc._id,
      message: message,
    });

    console.log(`🔔 Notification created for request by ${user.name}`);
  } catch (err) {
    console.error('Error creating notification:', err);
  }
});
  status: { type: Boolean, default: false },  // true if accepted, false if rejected
  treated: { type: Boolean, default: false }, // true if the admin has seen or treated the request
  qrCode: { type: String }, // Store the  QR code string
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Request', requestSchema);
