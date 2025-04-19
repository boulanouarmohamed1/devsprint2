const express = require('express');
const router = express.Router();
const { 
    importEventsFromCSV, 
    createEvent, 
    getAllEvents, 
    getEventById, 
    updateEvent, 
    deleteEvent, 
    logout 
} = require('../controllers/eventController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.get('/events/csv', importEventsFromCSV);
router.post('/events', authenticateToken, isAdmin, createEvent);
router.get('/events', getAllEvents);
router.get('/events/:id', getEventById);
router.put('/events/:id', authenticateToken, isAdmin, updateEvent);
router.delete('/events/:id', authenticateToken, isAdmin, deleteEvent);
router.post('/logout', authenticateToken, logout);

module.exports = router;