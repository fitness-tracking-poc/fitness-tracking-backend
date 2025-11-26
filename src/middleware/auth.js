const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * Protect Routes - JWT Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user id to request
        req.userId = decoded.id;

        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
};

module.exports = { protect };
