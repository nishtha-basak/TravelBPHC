// travelbphc-backend/routes/posts.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware.js'); // Your authentication middleware
const Post = require('../models/Post');

// @route   POST api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, async (req, res) => {
    const { name, origin, destination, date, time, notes } = req.body;

    try {
        const newPost = new Post({
            userId: req.user.id, // User ID from the token
            name,
            origin,
            destination,
            date,
            time,
            notes
        });

        const post = await newPost.save();
        res.status(201).json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error creating post.' });
    }
});

// @route   GET api/posts
// @desc    Get all posts (with sorting)
// @access  Public
router.get('/', async (req, res) => {
    try {
        let postsQuery = Post.find();

        // Sorting logic
        // Example: /api/posts?sortBy=createdAt&order=desc
        // Default sort: most recent
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1; // 1 for ascending, -1 for descending

        postsQuery = postsQuery.sort({ [sortBy]: order });

        // Populate userId (owner of the post) and comments.user (comment author)
        // We populate 'email' and '_id' from the User model for display on frontend
        const posts = await postsQuery
            .populate('userId', 'email _id') // Populates post owner's email and ID
            .populate('comments.user', 'email _id'); // Populates comment author's email and ID

        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching posts.' });
    }
});

// @route   GET api/posts/my-posts
// @desc    Get posts by the logged-in user
// @access  Private
router.get('/my-posts', auth, async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.user.id })
            .populate('userId', 'email _id') // Still populate for consistency, though it's own user
            .populate('comments.user', 'email _id')
            .sort({ createdAt: -1 }); // Most recent first
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching user posts.' });
    }
});

// @route   PUT api/posts/:id
// @desc    Update a post by ID
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { name, origin, destination, date, time, notes } = req.body;

    try {
        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Check if user owns the post
        if (post.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this post.' });
        }

        // Update post fields
        post.name = name;
        post.origin = origin;
        post.destination = destination;
        post.date = date;
        post.time = time;
        post.notes = notes;

        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid post ID.' });
        }
        res.status(500).json({ message: 'Server error updating post.' });
    }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Check if user owns the post
        if (post.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this post.' });
        }

        await Post.deleteOne({ _id: req.params.id }); // Use deleteOne for Mongoose 5.x/6.x or findByIdAndDelete for 7.x+
        res.json({ message: 'Post deleted successfully.' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid post ID.' });
        }
        res.status(500).json({ message: 'Server error deleting post.' });
    }
});

// --- NEW ROUTES FOR LIKES AND COMMENTS ---

// @route   PUT api/posts/like/:id
// @desc    Like or unlike a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Check if the post has already been liked by this user
        const alreadyLiked = post.likes.some(
            (like) => like.user.toString() === req.user.id
        );

        if (alreadyLiked) {
            // User already liked, so unlike it (remove from likes array)
            post.likes = post.likes.filter(
                ({ user }) => user.toString() !== req.user.id
            );
            await post.save();
            return res.json({ message: 'Post unliked.', likes: post.likes.length });
        } else {
            // User has not liked, so like it (add to likes array)
            post.likes.unshift({ user: req.user.id }); // Add to the beginning of the array
            await post.save();
            return res.json({ message: 'Post liked.', likes: post.likes.length });
        }
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid post ID.' });
        }
        res.status(500).json({ message: 'Server error toggling like.' });
    }
});

// @route   POST api/posts/comment/:id
// @desc    Add a comment to a post
// @access  Private
router.post('/comment/:id', auth, async (req, res) => {
    const { text } = req.body;

    // Basic validation
    if (!text) {
        return res.status(400).json({ message: 'Comment text is required.' });
    }

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const newComment = {
            user: req.user.id, // User ID from the token
            text,
            createdAt: new Date() // Set creation time
        };

        post.comments.unshift(newComment); // Add to the beginning of the array (most recent comments first)

        await post.save();

        // Populate the user field of the newly added comment before sending response
        // This ensures the frontend gets email/ID for the commenter immediately
        const populatedPost = await Post.findById(post._id)
                                        .populate('comments.user', 'email _id');
        const latestComment = populatedPost.comments[0]; // Assuming it's the first one after unshift

        res.status(201).json({ message: 'Comment added.', comment: latestComment });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid post ID.' });
        }
        res.status(500).json({ message: 'Server error adding comment.' });
    }
});


// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete a comment from a post
// @access  Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Pull out comment
        const comment = post.comments.find(
            (c) => c.id === req.params.comment_id
        );

        // Make sure comment exists
        if (!comment) {
            return res.status(404).json({ message: 'Comment does not exist.' });
        }

        // Check user ownership of the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this comment.' });
        }

        // Get remove index
        const removeIndex = post.comments
            .map((c) => c.id)
            .indexOf(req.params.comment_id);

        post.comments.splice(removeIndex, 1); // Remove the comment from the array

        await post.save();

        res.json({ message: 'Comment removed successfully.' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid post or comment ID.' });
        }
        res.status(500).json({ message: 'Server error deleting comment.' });
    }
});


module.exports = router;