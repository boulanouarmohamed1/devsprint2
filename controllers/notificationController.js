// controllers/notificationController.js
const Notification = require('../models/Notification'); // Update path as needed

exports.markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await Notification.findByIdAndUpdate(
      id,
      { status: 'read' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read', notification: updated });
  } catch (err) {
    console.error('Error marking as read:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
