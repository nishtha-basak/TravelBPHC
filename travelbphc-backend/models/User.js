const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Ensures email is unique across all users
        lowercase: true, // Stores emails in lowercase
        match: [/^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please enter a valid email address'] // Basic email regex validation
        // You might want to refine this regex for your university domain later,
        // e.g., /^[\w-]+(?:\.[\w-]+)*@youruniversity\.edu$/
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Minimum password length
    },
    // You can add more fields here, e.g., fullName, studentId, etc.
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to hash password before saving to database
// 'pre' means it runs before the 'save' event
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) { // Only hash if the password has been modified (or is new)
        return next();
    }
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next(); // Move to the next middleware/save operation
});

// Method to compare entered password with hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);