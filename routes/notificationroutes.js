const express = require('express');
const router = express.Router();
const { markAsRead } = require('../controllers/notificationController');

// Route: PATCH /api/notifications/:id/read
router.patch('/:id/read', markAsRead);


module.exports = router;
