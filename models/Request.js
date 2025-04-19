const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: Boolean, default: false },  // true if accepted, false if rejected
  treated: { type: Boolean, default: false }, // true if the admin has seen or treated the request
  qrCode: { type: String }, // Store the  QR code string
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);
