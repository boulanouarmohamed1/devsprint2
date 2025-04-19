const express = require('express');
const router = express.Router();
const { createUser, getAllUsers } = require('../controllers/userController');

// POST /users – create user
router.post('/', createUser);

// GET /users – list all users (optional)
router.get('/', getAllUsers);

module.exports = router;
