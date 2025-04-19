const express = require('express');
const router = express.Router();
const { createUser, getAllUsers } = require('../controllers/userController');

const { login, createAdmin, register } = require('../controllers/userController');

router.post('/login', login);
router.post('/api/users/create-admin', createAdmin);
router.post('/register', register);

module.exports = router;