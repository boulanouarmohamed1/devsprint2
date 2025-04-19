const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'The email field is required to log in. Please provide your email address.' });
        }
        if (!password) {
            return res.status(400).json({ message: 'The password field is required to log in. Please provide your password.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'The email or password you entered is incorrect. Please try again.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'The email or password you entered is incorrect. Please try again.' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'An unexpected server error occurred during login. Please try again later.', error: error.message });
    }
};

const createAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username) {
            return res.status(400).json({ message: 'The username field is required to create an admin user. Please provide a username.' });
        }
        if (!email) {
            return res.status(400).json({ message: 'The email field is required to create an admin user. Please provide an email address.' });
        }
        if (!password) {
            return res.status(400).json({ message: 'The password field is required to create an admin user. Please provide a password.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'The email format is invalid. Please use a format like example@domain.com.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'This email is already registered. Please use a different email address.' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        await newUser.save();
        res.status(201).json({ message: 'Admin user created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'An unexpected server error occurred while creating the admin user.', error: error.message });
    }
};

const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username) {
            return res.status(400).json({ message: 'The username field is required to register. Please provide a username.' });
        }
        if (!email) {
            return res.status(400).json({ message: 'The email field is required to register. Please provide an email address.' });
        }
        if (!password) {
            return res.status(400).json({ message: 'The password field is required to register. Please provide a password.' });
        }
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'The email format is invalid. Please use a format like example@domain.com.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'This email is already in use. Please use a different email address.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'member'
        });

        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ message: 'An unexpected server error occurred during registration. Please try again later.', error: error.message });
    }
};
module.exports = { login, createAdmin, register };