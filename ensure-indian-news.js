// Script to ensure all news articles are marked as Indian
require('dotenv').config();
const mongoose = require('mongoose');
const News = require('./models/news');

async function ensureIndianNews() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Count total articles before update
    const totalBefore = await News.countDocuments();
    console.log(`Total news articles: ${totalBefore}`);
    
    // Count non-Indian articles before update
    const nonIndianBefore = await News.countDocuments({ region: { $ne: 'india' } });
    console.log(`Non-Indian news articles before update: ${nonIndianBefore}`);
    
    if (nonIndianBefore > 0) {
      // Update all news articles to have region 'india'
      const updateResult = await News.updateMany(
        { region: { $ne: 'india' } },
        { $set: { region: 'india' } }
      );
      
      console.log(`Updated ${updateResult.modifiedCount} articles to region 'india'`);
    } else {
      console.log('All articles are already marked as Indian');
    }
    
    // Verify all articles are now Indian
    const nonIndianAfter = await News.countDocuments({ region: { $ne: 'india' } });
    console.log(`Non-Indian news articles after update: ${nonIndianAfter}`);
    
    console.log('News database update completed successfully');
  } catch (error) {
    console.error('Error during news database update:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
ensureIndianNews();
