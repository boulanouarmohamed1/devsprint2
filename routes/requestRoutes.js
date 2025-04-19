const express = require('express');
const router = express.Router();
const { createRequest, handleRequestDecision } = require('../controllers/requestController');

router.post('/', createRequest);
router.patch('/:id/decision', handleRequestDecision);

module.exports = router;
// Compare this snippet from routes/userRoutes.js:
