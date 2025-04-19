const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: Boolean, default: false },  
  treated: { type: Boolean, default: false },
  qrCode: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);