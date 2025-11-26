/**
 * Custom Error Response Class
 * Extends the built-in Error class to include status codes
 */
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
    }
}

module.exports = ErrorResponse;
