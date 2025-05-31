// travelbphc-backend/controllers/authController.js
const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For creating JWTs

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user instance
        user = new User({
            email,
            password // Password will be hashed by the pre-save hook in User model
        });

        // Save user to database
        await user.save();

        // Generate JWT (optional for register, but useful to auto-login)
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Make sure JWT_SECRET is in your .env file
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ message: 'User registered successfully', token }); // Send token and success message
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during registration');
    }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' }); // Use generic message for security
        }

        // 2. Compare provided password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password); // Compare plain password with hashed password
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' }); // Use generic message for security
        }

        // 3. Generate JWT token
        const payload = {
            user: {
                id: user.id // Payload contains user's ID
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Use the same secret from your .env
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                res.json({ token, message: 'Logged in successfully!' }); // Send token back to frontend
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during login');
    }
};