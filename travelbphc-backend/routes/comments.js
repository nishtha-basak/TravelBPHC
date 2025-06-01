// travelbphc-backend/routes/comments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Comment = require('../models/Comment'); // New Comment model
const Post = require('../models/Post'); // Needed to check if post exists

// @route   POST /api/comments/:postId
// @desc    Add a top-level comment to a post
// @access  Private
router.post('/:postId', auth, async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).json({ message: 'Comment text is required.' });
    }

    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const newComment = new Comment({
            text,
            user: req.user.id,
            post: req.params.postId,
            parentId: null // Top-level comment
        });

        const comment = await newComment.save();
        // Optionally populate the user field before sending back
        await comment.populate('user', 'email'); // Populate user's email

        res.status(201).json(comment);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error creating comment.' });
    }
});

// @route   POST /api/comments/:postId/:commentId/reply
// @desc    Reply to an existing comment
// @access  Private
router.post('/:postId/:commentId/reply', auth, async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).json({ message: 'Reply text is required.' });
    }

    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const parentComment = await Comment.findById(req.params.commentId);
        if (!parentComment) {
            return res.status(404).json({ message: 'Parent comment not found.' });
        }
        // Ensure reply is for the correct post
        if (parentComment.post.toString() !== req.params.postId) {
            return res.status(400).json({ message: 'Parent comment does not belong to this post.' });
        }

        const newReply = new Comment({
            text,
            user: req.user.id,
            post: req.params.postId,
            parentId: req.params.commentId // Link to the parent comment
        });

        const reply = await newReply.save();
        await reply.populate('user', 'email'); // Populate user's email

        res.status(201).json(reply);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error creating reply.' });
    }
});

// @route   GET /api/comments/:postId
// @desc    Get all comments and replies for a specific post
// @access  Public
router.get('/:postId', async (req, res) => {
    try {
        // Fetch all comments and replies for the given post
        const comments = await Comment.find({ post: req.params.postId })
                                    .populate('user', 'email') // Populate user details
                                    .sort({ createdAt: 1 }); // Sort by oldest first

        res.json(comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching comments.' });
    }
});

// @route   DELETE /api/comments/:commentId
// @desc    Delete a comment or reply
// @access  Private (Owner only)
router.delete('/:commentId', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Check if user owns the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this comment.' });
        }

        // If it's a parent comment, you might want to delete all its replies as well
        // Or prevent deletion if it has replies and force deletion of replies first
        // For simplicity, let's delete all associated replies as well.
        await Comment.deleteMany({ parentId: req.params.commentId }); // Delete nested replies
        await Comment.deleteOne({ _id: req.params.commentId }); // Delete the comment itself

        res.json({ message: 'Comment and its replies removed successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error deleting comment.' });
    }
});

module.exports = router;