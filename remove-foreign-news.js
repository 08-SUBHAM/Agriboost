// Script to remove all non-Indian news articles and keep only Indian agriculture news
require('dotenv').config();
const mongoose = require('mongoose');
const News = require('./models/news');

async function cleanupNewsDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Count total articles before cleanup
    const totalBefore = await News.countDocuments();
    console.log(`Total news articles before cleanup: ${totalBefore}`);
    
    // Count Indian articles before cleanup
    const indianBefore = await News.countDocuments({ region: 'india' });
    console.log(`Indian news articles before cleanup: ${indianBefore}`);
    
    // Delete all non-Indian news
    const deleteResult = await News.deleteMany({ region: { $ne: 'india' } });
    console.log(`Deleted ${deleteResult.deletedCount} non-Indian news articles`);
    
    // Count remaining articles
    const remaining = await News.countDocuments();
    console.log(`Remaining news articles (all Indian): ${remaining}`);
    
    console.log('News database cleanup completed successfully');
  } catch (error) {
    console.error('Error during news database cleanup:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the cleanup function
cleanupNewsDatabase();
