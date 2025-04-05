const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const News = require('./models/news');

const sampleArticles = [
    {
        title: "New Sustainable Farming Techniques Show Promise",
        description: "Recent studies reveal that sustainable farming practices can increase crop yields by up to 30% while reducing water usage.",
        imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
        url: "https://example.com/article1",
        category: "news",
        source: "AgriNews",
        publishedAt: new Date()
    },
    {
        title: "Smart Irrigation Systems Transform Agriculture",
        description: "IoT-based irrigation systems are helping farmers optimize water usage and improve crop health through precise monitoring.",
        imageUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800",
        url: "https://example.com/article2",
        category: "news",
        source: "AgriTech Weekly",
        publishedAt: new Date()
    },
    {
        title: "Organic Farming Gains Momentum",
        description: "More farmers are switching to organic farming methods as demand for chemical-free produce continues to rise.",
        imageUrl: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
        url: "https://example.com/article3",
        category: "news",
        source: "AgriBoost",
        publishedAt: new Date()
    },
    {
        title: "New Government Subsidy for Modern Farm Equipment",
        description: "Government announces 50% subsidy on modern farming equipment to promote technology adoption in agriculture.",
        imageUrl: "https://images.unsplash.com/photo-1592982537447-6e93d25d119f?w=800",
        url: "https://example.com/article4",
        category: "scheme",
        source: "AgriPolicy",
        publishedAt: new Date()
    }
];

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sonughosh0810:Sonu0810@cluster.qxafmqo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';

async function addSampleNews() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing articles
        await News.deleteMany({});
        console.log('Cleared existing articles');

        // Add sample articles
        for (const article of sampleArticles) {
            await News.create(article);
            console.log(`Added article: ${article.title}`);
        }

        console.log('Successfully added all sample articles');
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        await mongoose.disconnect();
    }
}

console.log('Starting to add sample news...');
addSampleNews()
    .then(() => {
        console.log('Sample news added successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error adding sample news:', error);
        process.exit(1);
    }); 