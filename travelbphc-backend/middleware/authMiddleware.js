const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token'); // Common practice to send token in 'x-auth-token' header

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user from token to the request object
        req.user = decoded.user;
        next(); // Move to the next middleware or route handler
    } catch (err) {
        // Token is not valid
        res.status(401).json({ message: 'Token is not valid' });
    }
};