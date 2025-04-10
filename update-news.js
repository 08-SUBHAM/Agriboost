const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const News = require('./models/news');

const sampleArticles = [
    {
        title: "PM Kisan Scheme: 15th Installment to Benefit Indian Farmers Soon",
        description: "The 15th installment of PM Kisan Samman Nidhi will be released soon, providing ₹2,000 to eligible farmers across India.",
        imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
        url: "https://example.com/article1",
        category: "scheme",
        source: "Krishi Jagran",
        publishedAt: new Date(),
        region: "india"
    },
    {
        title: "Drip Irrigation Systems Transform Farming in Maharashtra",
        description: "Farmers in Maharashtra are reporting 40% water savings and increased yields after adopting modern drip irrigation technology.",
        imageUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800",
        url: "https://example.com/article2",
        category: "Technology",
        source: "Indian Express Agriculture",
        publishedAt: new Date(),
        region: "india"
    },
    {
        title: "Organic Farming Gains Momentum in Punjab",
        description: "More farmers in Punjab are switching to organic farming methods as demand for chemical-free produce continues to rise in Indian markets.",
        imageUrl: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
        url: "https://example.com/article3",
        category: "Agriculture",
        source: "The Hindu Agriculture",
        publishedAt: new Date(),
        region: "india"
    },
    {
        title: "New Government Subsidy for Modern Farm Equipment in Haryana",
        description: "Haryana government announces 50% subsidy on modern farming equipment to promote technology adoption in agriculture.",
        imageUrl: "https://images.unsplash.com/photo-1592982537447-6e93d25d119f?w=800",
        url: "https://example.com/article4",
        category: "scheme",
        source: "AgriPolicy",
        publishedAt: new Date(),
        region: "india"
    },
    {
        title: "Monsoon Forecast: Good Rainfall Expected Across India This Year",
        description: "Meteorological Department predicts above-average rainfall for most agricultural regions in India, boosting prospects for kharif crops.",
        imageUrl: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800",
        url: "https://example.com/article5",
        category: "Weather",
        source: "The Hindu Agriculture",
        publishedAt: new Date(),
        region: "india"
    },
    {
        title: "New Drought-Resistant Rice Variety Developed by Indian Scientists",
        description: "Scientists at ICAR have developed a new rice variety that can withstand drought conditions, offering hope to farmers in rain-deficient areas.",
        imageUrl: "https://images.unsplash.com/photo-1536054097392-50095188e7d8?w=800",
        url: "https://example.com/article6",
        category: "Research",
        source: "Krishi Jagran",
        publishedAt: new Date(),
        region: "india"
    }
];

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Sonu0810:sonu0810@cluster.qxafmqo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';

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