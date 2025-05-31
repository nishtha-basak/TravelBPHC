// travelbphc-backend/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);