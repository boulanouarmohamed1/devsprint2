const Notification = require('../models/Notification');
const User = require('../models/User');


// Get all notifications for the admin
exports.getAllNotifications = async (req, res) => {
    try {
        // Find the admin user from DB
        const adminUser = await User.findOne({ role: 'admin' });

        if (!adminUser) {
            return res.status(404).json({
                success: false,
                message: "No admin user found in the database"
            });
        }

        // Find notifications where userId matches the admin's ID
        const notifications = await Notification.find()
            
            // .populate('userId', 'username email')
            // .populate('eventId', 'title')
            // .populate('requestId', 'status treated');

        res.status(200).json({
            success: true,
            count: notifications.length,
            admin: {
                _id: adminUser._id,
                username: adminUser.username,
                email: adminUser.email
            },
            notifications
        });
    } catch (error) {
        console.error('Admin notification fetch error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
            error: error.message
        });
    }
};
// Mark a notification as read
