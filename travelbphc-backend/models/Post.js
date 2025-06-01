// travelbphc-backend/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Make it required so every post must have a name
        trim: true // Remove whitespace from both ends of a string
    },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    notes: { type: String, default: '' },
    // --- NEW FIELD ---
    userId: {
        type: mongoose.Schema.Types.ObjectId, // This is a Mongoose ID type
        ref: 'User', // This references the 'User' model
        required: true // A post must be associated with a user
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);