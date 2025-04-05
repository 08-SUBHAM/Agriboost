const mongoose = require('mongoose');
const News = require('./models/news');

const DB_URI = process.env.MONGODB_URI || 'mongodb+srv://sonughosh0810:Sonu0810@cluster.qxafmqo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';

async function checkNews() {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB Atlas');

        const news = await News.find({});
        console.log(`Total news articles: ${news.length}`);

        const newsWithImages = news.filter(article => article.imageUrl && article.imageUrl.trim() !== '');
        console.log(`Articles with images: ${newsWithImages.length}`);

        if (newsWithImages.length > 0) {
            console.log('\nSample article with image:');
            console.log(newsWithImages[0]);
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB Atlas');
    } catch (error) {
        console.error('Error:', error);
        // Don't exit on error
        console.log('Continuing without news check...');
    }
}

checkNews(); 