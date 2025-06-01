// travelbphc-backend/routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // Make sure path is correct
const authMiddleware = require('../middleware/authMiddleware'); // Import the auth middleware
// GET all posts
router.get('/', async (req, res) => {
    try {
       // const posts = await Post.find().sort({ createdAt: -1 });
        // Optionally, you might want to populate user details if you want to display the user's email/name
        const posts = await Post.find().populate('userId', 'email').sort({ createdAt: -1 });
        
        res.json(posts);
    } catch (err) {
        console.error(err.message); // Log the actual error
        res.status(500).json({ message: err.message });
    }
});

// POST a new post
router.post('/',authMiddleware, async (req, res) => {
    const {name, origin, destination, date, time, notes } = req.body;
    const newPost = new Post({ name, origin, destination, date, time, notes });

 try {
        const newPost = new Post({
            name,
            origin,
            destination,
            date,
            time,
            notes,
            userId: req.user.id // Attach the ID of the authenticated user
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        console.error(err.message); // Log the actual error
        res.status(400).json({ message: err.message });
    }
});


// DELETE a post by ID (Requires authentication and ownership)
router.delete('/:id', authMiddleware, async (req, res) => { // Use authMiddleware first
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the authenticated user is the owner of the post
        if (post.userId.toString() !== req.user.id) { // Compare IDs (Mongoose ObjectId needs toString())
            return res.status(403).json({ message: 'You are not authorized to delete this post.' });
        }

        // If authorized, proceed with deletion
        await Post.deleteOne({ _id: req.params.id }); // Mongoose recommends deleteOne or deleteMany
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error(err.message); // Log the actual error
        res.status(500).json({ message: 'Server error deleting post.' });
    }
});

// PUT (Update) a post by ID (Requires authentication and ownership)
router.put('/:id', authMiddleware, async (req, res) => { // Use authMiddleware first
    try {
        const { name, origin, destination, date, time, notes } = req.body;
        const postId = req.params.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the authenticated user is the owner of the post
        if (post.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this post.' });
        }

        // If authorized, proceed with update
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { name, origin, destination, date, time, notes },
            { new: true, runValidators: true }
        );

        res.json(updatedPost);
    } catch (err) {
        console.error(err.message); // Log the actual error
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;