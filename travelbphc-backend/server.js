// travelbphc-backend/server.js
require('dotenv').config(); // Loads variables from your .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000; // Use port from .env or default to 5000

// Middleware: Essential for handling requests
app.use(cors()); // Enables cross-origin requests (frontend to backend)
app.use(express.json()); // Parses JSON data sent in requests

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Atlas Connected Successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define the schema for your travel posts (what data each post will hold)
const postSchema = new mongoose.Schema({
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: String, required: true }, // Storing as string for simplicity on Day 1
    time: { type: String, required: true }, // Storing as string for simplicity on Day 1
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now } // Automatically set creation time
});
const Post = mongoose.model('Post', postSchema); // Create a Mongoose Model from the schema

// API Routes: Endpoints for your frontend to interact with

// GET all posts (e.g., http://localhost:5000/api/posts)
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); // Find all posts, sort by newest first
        res.json(posts); // Send them as JSON
    } catch (err) {
        res.status(500).json({ message: err.message }); // Send error if something goes wrong
    }
});

// POST a new post (e.g., http://localhost:5000/api/posts)
app.post('/api/posts', async (req, res) => {
    const { origin, destination, date, time, notes } = req.body; // Get data from the request body
    const newPost = new Post({ origin, destination, date, time, notes }); // Create a new Post object

    try {
        const savedPost = await newPost.save(); // Save the new post to MongoDB
        res.status(201).json(savedPost); // Send back the saved post with a 201 Created status
    } catch (err) {
        res.status(400).json({ message: err.message }); // Send error if data is invalid
    }
});

// DELETE a post by ID (e.g., http://localhost:5000/api/posts/60d5ec49c612b4001c8c9e5a)
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully', deletedPost });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT (Update) a post by ID
app.put('/api/posts/:id', async (req, res) => {
    try {
        const { origin, destination, date, time, notes } = req.body;
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id, // ID from the URL parameter
            { origin, destination, date, time, notes }, // New data
            { new: true, runValidators: true } // Options: return the updated doc, run schema validators
        );

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(updatedPost);
    } catch (err) {
        res.status(400).json({ message: err.message }); // 400 for validation errors
    }
});

// Start the server and listen for requests
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});