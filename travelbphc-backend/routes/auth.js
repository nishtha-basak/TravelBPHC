// travelbphc-backend/routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Make sure this path is correct

// Register route
router.post('/register', authController.register); // This is the route for POST /api/auth/register

// Login route
router.post('/login', authController.login);

module.exports = router;