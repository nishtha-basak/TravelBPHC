// travelbphc-backend/routes/posts.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware.js'); // Your authentication middleware
const Post = require('../models/Post');
const Comment = require('../models/Comment'); // NEW: Import the new Comment model
const User = require('../models/User'); // NEW: Import User model to populate name for comments and likes

// @route   POST api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, async (req, res) => {
    // Include new fields for post creation
    const {
        name,
        origin,
        destination,
        date, // Now expected as a Date string (e.g., "2025-12-25")
        time, // "HH:MM"
        leaveTimeStart, // "HH:MM"
        leaveTimeEnd,   // "HH:MM"
        notes,
        lookingForPeople
    } = req.body;

    try {
        const newPost = new Post({
            userId: req.user.id, // User ID from the token
            name,
            origin,
            destination,
            date: new Date(date), // Convert date string to Date object
            time,
            leaveTimeStart,
            leaveTimeEnd,
            notes,
            lookingForPeople: lookingForPeople || 0 // Default to 0 if not provided
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
        let postsQuery = Post.find({ isArchived: false }); // Only fetch non-archived posts

        // Sorting logic
        // Example: /api/posts?sortBy=createdAt&order=desc
        // Default sort: most recent
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.order === 'asc' ? 1 : -1;

        postsQuery = postsQuery.sort({ [sortBy]: sortOrder });
        postsQuery = postsQuery.populate('userId', 'email'); // Populate user email for display

        const posts = await postsQuery.exec();
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching posts.' });
    }
});

// @route   GET api/posts/my-posts
// @desc    Get all posts by the logged-in user
// @access  Private
router.get('/my-posts', auth, async (req, res) => {
    try {
        // Fetch all posts by the logged-in user, including archived ones
        const posts = await Post.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching user posts.' });
    }
});

// @route   GET api/posts/archived/me
// @desc    Get all archived posts by the logged-in user
// @access  Private
router.get('/archived/me', auth, async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.user.id, isArchived: true }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching archived posts.' });
    }
});


// @route   PUT api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { name, origin, destination, date, time, leaveTimeStart, leaveTimeEnd, notes, lookingForPeople, currentPeopleFound, isArchived } = req.body;

    // Build post fields object
    const postFields = {
        name,
        origin,
        destination,
        date: new Date(date), // Ensure date is a Date object
        time,
        leaveTimeStart,
        leaveTimeEnd,
        notes,
        lookingForPeople,
        currentPeopleFound,
        isArchived
    };

    try {
        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Check if the user owns the post
        if (post.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to update this post.' });
        }

        post = await Post.findByIdAndUpdate(
            req.params.id,
            { $set: postFields },
            { new: true } // Return the updated document
        );

        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.status(500).json({ message: 'Server error updating post.' });
    }
});


// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Check if the user owns the post
        if (post.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to delete this post.' });
        }

        await Post.deleteOne({ _id: req.params.id }); // Use deleteOne for Mongoose 5.x+
        await Comment.deleteMany({ post: req.params.id }); // Delete all comments associated with the post


        res.json({ message: 'Post and associated comments removed successfully.' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.status(500).json({ message: 'Server error deleting post.' });
    }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Check if the post has already been liked by this user
        if (post.likes.some(like => like.user.toString() === req.user.id)) {
            return res.status(400).json({ message: 'Post already liked.' });
        }

        post.likes.unshift({ user: req.user.id }); // Add user ID to the beginning of the likes array

        await post.save();
        res.json(post.likes); // Send back updated likes array
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.status(500).json({ message: 'Server error liking post.' });
    }
});

// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Check if the post has NOT yet been liked by this user
        if (!post.likes.some(like => like.user.toString() === req.user.id)) {
            return res.status(400).json({ message: 'Post has not yet been liked.' });
        }

        // Get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1); // Remove the like from the array

        await post.save();
        res.json(post.likes); // Send back updated likes array
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.status(500).json({ message: 'Server error unliking post.' });
    }
});

// @route   GET api/posts/search
// @desc    Search posts based on criteria
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { date, timeStart, timeEnd, origin, destination, minSeatsAvailable } = req.query;
        const query = { isArchived: false }; // Only search non-archived posts

        // Date filter
        if (date) {
            // For a date string like 'YYYY-MM-DD', we need to match the date part
            // We can use $gte and $lt to create a range for the specific day
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(searchDate.getDate() + 1);

            query.date = {
                $gte: searchDate,
                $lt: nextDay
            };
        }

        // Time range filter (flexible departure times)
        // If both timeStart and timeEnd are provided, the post's flexible time range
        // must overlap with the search time range.
        // A post's interval [post.leaveTimeStart, post.leaveTimeEnd] overlaps with
        // search interval [timeStart, timeEnd] if:
        // (post.leaveTimeStart <= timeEnd) AND (post.leaveTimeEnd >= timeStart)
        if (timeStart && timeEnd) {
            query.leaveTimeStart = { $lte: timeEnd };   // Post can start before or at search end time
            query.leaveTimeEnd = { $gte: timeStart };   // Post can end after or at search start time
        } else if (timeStart) {
            query.leaveTimeEnd = { $gte: timeStart }; // If only start is given, any post ending after or at that time
        } else if (timeEnd) {
            query.leaveTimeStart = { $lte: timeEnd }; // If only end is given, any post starting before or at that time
        }

        // Origin filter (case-insensitive)
        if (origin) {
            query.origin = { $regex: new RegExp(origin, 'i') };
        }

        // Destination filter (case-insensitive)
        if (destination) {
            query.destination = { $regex: new RegExp(destination, 'i') };
        }

        // Minimum seats available filter
        if (minSeatsAvailable !== undefined && minSeatsAvailable !== null) {
            const minSeats = parseInt(minSeatsAvailable);
            if (!isNaN(minSeats) && minSeats >= 0) {
                // Use $expr to compare two fields
                query.$expr = { $gte: [{ $subtract: ['$lookingForPeople', '$currentPeopleFound'] }, minSeats] };
            }
        }

        const posts = await Post.find(query).sort({ date: 1, leaveTimeStart: 1 }); // Sort by date then time
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error during search.' });
    }
});

// @route   POST /api/posts/comment/:id
// @desc    Add a top-level comment to a post (deprecated - now handled by /api/comments)
// @access  Private
// This route is effectively replaced by the new /api/comments routes,
// but kept here for now as a placeholder or if direct post embedding is still desired for legacy.
router.post('/comment/:id', auth, async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).json({ message: 'Comment text is required.' });
    }
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Add the comment to the post's embedded comments array
        const newComment = {
            user: req.user.id,
            text: text
        };
        post.comments.unshift(newComment); // Add to beginning

        await post.save();
        res.json(post.comments); // Return updated comments
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error adding comment.');
    }
});

// @route   DELETE /api/posts/comment/:id/:comment_id
// @desc    Delete a comment from a post (deprecated - now handled by /api/comments)
// @access  Private
// Similar to above, this route is replaced by the new /api/comments DELETE route.
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
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.status(500).send('Server error deleting comment.');
    }
});

module.exports = router;