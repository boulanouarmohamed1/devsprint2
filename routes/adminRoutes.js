const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/notifications', adminController.getAllNotifications);

module.exports = router;
