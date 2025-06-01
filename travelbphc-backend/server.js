// travelbphc-backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import your route files
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments'); // NEW: Import the new comment routes

// --- NEW IMPORT ---
const authMiddleware = require('./middleware/authMiddleware'); // Import the auth middleware

// Import your Mongoose models (already there, just confirming)
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment'); // NEW: Import the Comment model

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Atlas Connected Successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Route integrations
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes); // NEW: Integrate comment routes

app.get('/', (req, res) => {
    res.send('TravelBPHC Backend API is running!');
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});