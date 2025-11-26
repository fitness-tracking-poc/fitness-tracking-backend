const mongoose = require('mongoose');

/**
 * Database Connection Configuration
 * Establishes connection to MongoDB using Mongoose
 */
const connectDB = async () => {
    try {
        // Ensure we're using the 'Fitness' database
        const MONGODB_URI = process.env.MONGODB_URI.replace(/\/[^\/]*$/, '/Fitness');

        const conn = await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database Name: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
