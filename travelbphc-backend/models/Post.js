// travelbphc-backend/models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Link to the User model
        ref: 'User',
        required: true
    },
    name: {
        type: String, // Name of the person creating the post (can be derived from user or separate)
        required: true
    },
    origin: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    date: {
        type: String, // Storing as string (YYYY-MM-DD) for simplicity or use Date type
        required: true
    },
    time: {
        type: String, // Storing as string (HH:MM)
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    // --- NEW FIELDS FOR LIKES AND COMMENTS ---
    likes: [
        {
            user: { // User ID of the person who liked
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ],
    comments: [
        {
            user: { // User ID of the person who commented
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            text: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    // --- END NEW FIELDS ---
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);