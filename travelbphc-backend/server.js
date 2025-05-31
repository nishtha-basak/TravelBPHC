// travelbphc-backend/server.js
require('dotenv').config(); // Loads variables from your .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- NEW/CORRECTED IMPORTS ---
// Import your route files
const authRoutes = require('./routes/auth'); // Correctly import the auth routes
const postRoutes = require('./routes/posts'); // Assuming you'll have post routes in a separate file too

// Import your Mongoose models from their dedicated files
const User = require('./models/User'); // Import the User model
// Make sure you have a models/Post.js file. If not, create it.
// If you don't have a models/Post.js, uncomment the Post schema definition below and use it carefully.
// Otherwise, create models/Post.js and move the schema there.
// For now, let's assume Post.js exists and import it.
const Post = require('./models/Post'); // Import the Post model


const app = express();
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

// Middleware: Essential for handling requests
app.use(cors()); // Enables cross-origin requests (frontend to backend)
app.use(express.json()); // Parses JSON data sent in requests

// Connect to MongoDB Atlas
// Ensure your .env has MONGO_URI, not MONGODB_URI, for consistency with previous guidance
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI) // Fallback for either variable name
    .then(() => console.log('MongoDB Atlas Connected Successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- REMOVE THE DIRECT API ROUTES FOR POSTS AND AUTH HERE ---
// You were directly defining app.get('/api/posts'), app.post('/api/posts'), etc.,
// AND app.post('/api/auth/login') directly in server.js.
// When using route files, these definitions should live in the route files themselves.

// --- ROUTE INTEGRATIONS (THE FIX FOR YOUR 404) ---
// This is where you tell Express to use your imported route modules
// Any request starting with /api/auth will be handled by authRoutes
app.use('/api/auth', authRoutes);
// Any request starting with /api/posts will be handled by postRoutes (for travel posts)
app.use('/api/posts', postRoutes); // Make sure you have a 'routes/posts.js' and move your post routes there!

// Simple root route for testing if server is up
app.get('/', (req, res) => {
    res.send('TravelBPHC Backend API is running!');
});

// Start the server and listen for requests
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});