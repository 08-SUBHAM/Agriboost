const mongoose = require('mongoose');
const News = require('./models/news');

async function checkNews() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/agriboost');
        console.log('Connected to MongoDB');

        const news = await News.find({});
        console.log(`Total news articles: ${news.length}`);

        const newsWithImages = news.filter(article => article.imageUrl && article.imageUrl.trim() !== '');
        console.log(`Articles with images: ${newsWithImages.length}`);

        if (newsWithImages.length > 0) {
            console.log('\nSample article with image:');
            console.log(newsWithImages[0]);
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
    }
}

checkNews(); 