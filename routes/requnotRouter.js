const express = require('express');
const router = express.Router();
const { createRequest } = require('../controllers/requnotController');  // Import your controller

// Route to create a request and notification
router.post('/create-request', createRequest);

module.exports = router;
