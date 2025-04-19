const Request = require('../models/Request');
const mongoose = require('mongoose');
const User = require('../models/User');

const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

exports.createRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, eventId } = req.body;

    if (!userId || !eventId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'userId and eventId are required' });
    }

    const [user, event] = await Promise.all([
      User.findById(userId).session(session),
      Event.findById(eventId).session(session)
    ]);

    if (!user || !event) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User or Event not found' });
    }

    const request = await Request.create([{
      userId,
      eventId,
      status: false,
      treated: false
    }], { session });

    const notification = await Notification.create([{
      userId,
      eventId,
      requestId: request[0]._id,
      message: `${user.name} has requested to join the event "${event.title}"`,
      status: 'unread'
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Request and notification created successfully',
      request: request[0],
      notification: notification[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('❌ Transaction error:', error.message);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: 'Validation Error',
        error: error.message 
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating request and notification',
      error: error.message
    });
  }
};