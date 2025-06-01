// travelbphc-backend/models/Comment.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    user: { // User who made the comment/reply
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    post: { // The post this comment/reply belongs to
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    parentId: { // NEW: To link replies to parent comments
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment', // References another Comment document
        default: null, // Top-level comments will have parentId as null
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Comment', CommentSchema);