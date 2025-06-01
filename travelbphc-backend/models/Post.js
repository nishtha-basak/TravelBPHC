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
        type: Date, // CHANGE: Storing as Date type for better date range queries
        required: true
    },
    time: { // KEEP: For display of exact preferred time
        type: String, // Storing as string (HH:MM)
        required: true
    },
    // NEW: Time range for flexible departure
    leaveTimeStart: {
        type: String, // Storing as string "HH:MM"
        required: true
    },
    leaveTimeEnd: {
        type: String, // Storing as string "HH:MM"
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    // --- Existing Fields for Likes and Comments ---
    likes: [
        {
            user: { // User ID of the person who liked
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ],
    // IMPORTANT: The `comments` array *inside* Post will now only store top-level comments.
    // Replies will be separate `Comment` documents linked via `parentId`.
    // You might choose to remove this embedded comments array entirely if you're going fully
    // with a separate Comment model for all comments/replies.
    // For now, let's keep it to avoid breaking existing functionality, but acknowledge
    // that new replies won't go here.
    comments: [
        {
            user: {
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
    // --- NEW FIELDS FOR ARCHIVE & PEOPLE ---
    isArchived: { // For archiving/hiding posts
        type: Boolean,
        default: false,
    },
    lookingForPeople: { // Total number of additional people the user is looking for
        type: Number,
        default: 0,
        min: 0 // Cannot be negative
    },
    currentPeopleFound: { // Number of people who have already confirmed joining
        type: Number,
        default: 0,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add a virtual field for available slots (optional, but good for quick frontend calculation)
PostSchema.virtual('availableSlots').get(function() {
    return Math.max(0, this.lookingForPeople - this.currentPeopleFound);
});


module.exports = mongoose.model('Post', PostSchema);