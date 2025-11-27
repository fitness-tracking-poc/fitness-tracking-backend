const mongoose = require('mongoose');

/**
 * Database Connection Configuration
 * Establishes connection to MongoDB using Mongoose
 */
const connectDB = async () => {
    try {
        // Check if MONGODB_URI is defined
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // Ensure we're using the 'Fitness' database
        let MONGODB_URI = process.env.MONGODB_URI;

        // Replace or append database name
        if (MONGODB_URI.includes('mongodb://') || MONGODB_URI.includes('mongodb+srv://')) {
            // Remove any existing database name and add 'Fitness'
            MONGODB_URI = MONGODB_URI.replace(/\/[^\/]*(\?|$)/, '/Fitness$1');
        } else {
            throw new Error('Invalid MONGODB_URI format. Must start with mongodb:// or mongodb+srv://');
        }

        const conn = await mongoose.connect(MONGODB_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database Name: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
