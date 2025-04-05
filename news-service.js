const mongoose = require('mongoose');
const { fetchAndStoreNews } = require('./app');

// Configuration
const FETCH_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const DB_URI = 'mongodb://127.0.0.1:27017/agriboost';

async function startNewsService() {
    try {
        // Connect to MongoDB
        await mongoose.connect(DB_URI);
        console.log('Connected to MongoDB');

        // Initial fetch
        console.log('Performing initial news fetch...');
        await fetchAndStoreNews();
        console.log('Initial news fetch completed');

        // Schedule periodic fetches
        setInterval(async () => {
            console.log(`\n${new Date().toISOString()} - Starting scheduled news fetch...`);
            try {
                await fetchAndStoreNews();
                console.log('Scheduled news fetch completed successfully');
            } catch (error) {
                console.error('Error in scheduled news fetch:', error);
            }
        }, FETCH_INTERVAL);

        console.log(`News service started. Will fetch news every ${FETCH_INTERVAL / (60 * 60 * 1000)} hours`);

    } catch (error) {
        console.error('Failed to start news service:', error);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT. Cleaning up...');
    await mongoose.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM. Cleaning up...');
    await mongoose.disconnect();
    process.exit(0);
});

// Start the service
startNewsService(); 