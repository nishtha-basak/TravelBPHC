// travelbphc-backend/routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // Make sure path is correct

// GET all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new post
router.post('/', async (req, res) => {
    const { origin, destination, date, time, notes } = req.body;
    const newPost = new Post({ origin, destination, date, time, notes });

    try {
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a post by ID
router.delete('/:id', async (req, res) => {
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
router.put('/:id', async (req, res) => {
    try {
        const { origin, destination, date, time, notes } = req.body;
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { origin, destination, date, time, notes },
            { new: true, runValidators: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(updatedPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;