const User = require('../models/User');

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const newUser = new User({ username, email, password, role });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

// Get all users (optional, for testing)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};
