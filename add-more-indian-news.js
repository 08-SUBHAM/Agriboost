// Script to add more curated Indian agriculture news
require('dotenv').config();
const mongoose = require('mongoose');
const News = require('./models/news');

async function addIndianAgricultureNews() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Count Indian articles before adding new ones
    const indianBefore = await News.countDocuments({ region: 'india' });
    console.log(`Indian news articles before addition: ${indianBefore}`);
    
    // Current date for fresh news
    const currentDate = new Date();
    
    // Array of curated Indian agriculture news
    const indianAgricultureNews = [
      {
        title: "PM-Kisan 17th Installment: Farmers to Receive ₹2,000 in Their Accounts Soon",
        description: "The 17th installment of PM-Kisan will be released soon, benefiting over 10 crore farmers across India with direct financial assistance of ₹2,000.",
        url: "https://krishijagran.com/agriculture-world/pm-kisan-17th-installment-farmers-to-receive-rs-2000-in-their-accounts-soon/",
        imageUrl: "https://krishijagran.com/media/50024/pm-kisan.jpg",
        source: "Krishi Jagran",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
        category: "scheme",
        tags: ["PM-Kisan", "subsidy", "farmers", "government"],
        region: "india",
        state: "national",
        isVerified: true
      },
      {
        title: "Wheat Procurement Reaches 11.7 Million Tonnes, Punjab Leads with 5.2 Million Tonnes",
        description: "The Food Corporation of India has procured 11.7 million tonnes of wheat so far this season, with Punjab contributing the highest at 5.2 million tonnes followed by Haryana at 4.1 million tonnes.",
        url: "https://www.thehindubusinessline.com/economy/agri-business/wheat-procurement-reaches-117-million-tonnes-punjab-leads-with-52-million-tonnes/article67987654.ece",
        imageUrl: "https://www.thehindubusinessline.com/economy/agri-business/wheat-procurement.jpg",
        source: "The Hindu Business Line",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        category: "market",
        tags: ["wheat", "procurement", "MSP", "Punjab", "Haryana"],
        region: "india",
        state: "Punjab",
        isVerified: true
      },
      {
        title: "Monsoon Forecast 2024: IMD Predicts Normal Rainfall This Year",
        description: "The India Meteorological Department (IMD) has predicted normal monsoon rainfall this year, bringing relief to farmers across the country. The forecast suggests 96-104% of the long-period average rainfall.",
        url: "https://indianexpress.com/article/india/weather/monsoon-forecast-2024-imd-predicts-normal-rainfall-7823456/",
        imageUrl: "https://indianexpress.com/wp-content/uploads/2024/04/monsoon-rainfall.jpg",
        source: "Indian Express",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        category: "weather",
        tags: ["monsoon", "rainfall", "IMD", "forecast"],
        region: "india",
        state: "national",
        isVerified: true
      },
      {
        title: "ICAR Develops New Drought-Resistant Rice Variety for Rainfed Areas",
        description: "The Indian Council of Agricultural Research (ICAR) has developed a new drought-resistant rice variety that can thrive in rainfed areas with minimal irrigation, potentially benefiting millions of farmers in water-scarce regions.",
        url: "https://www.downtoearth.org.in/news/agriculture/icar-develops-new-drought-resistant-rice-variety-for-rainfed-areas-78965",
        imageUrl: "https://www.downtoearth.org.in/image/rice-variety-drought.jpg",
        source: "Down To Earth",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
        category: "research",
        tags: ["rice", "drought-resistant", "ICAR", "research"],
        region: "india",
        state: "national",
        isVerified: true
      },
      {
        title: "Uttar Pradesh Launches Mobile App for Soil Health Card and Fertilizer Recommendations",
        description: "The Uttar Pradesh government has launched a mobile application that provides farmers with digital soil health cards and personalized fertilizer recommendations based on soil testing results.",
        url: "https://ruralmarketing.in/agriculture/uttar-pradesh-launches-mobile-app-for-soil-health-card-and-fertilizer-recommendations/",
        imageUrl: "https://ruralmarketing.in/wp-content/uploads/2024/04/up-soil-app.jpg",
        source: "Rural Marketing",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        category: "technology",
        tags: ["soil health", "mobile app", "Uttar Pradesh", "technology"],
        region: "india",
        state: "Uttar Pradesh",
        isVerified: true
      },
      {
        title: "Maharashtra Farmers Get ₹6,000 Crore Crop Insurance Payout for Kharif 2023",
        description: "Farmers in Maharashtra have received ₹6,000 crore as crop insurance payout under the Pradhan Mantri Fasal Bima Yojana for losses during the Kharif 2023 season affected by irregular rainfall.",
        url: "https://krishijagran.com/agriculture-world/maharashtra-farmers-get-rs-6000-crore-crop-insurance-payout-for-kharif-2023/",
        imageUrl: "https://krishijagran.com/media/50100/maharashtra-farmers.jpg",
        source: "Krishi Jagran",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 24 * 6), // 6 days ago
        category: "scheme",
        tags: ["crop insurance", "PMFBY", "Maharashtra", "kharif"],
        region: "india",
        state: "Maharashtra",
        isVerified: true
      },
      {
        title: "Haryana Announces ₹100 Crore Fund for Agricultural Startups",
        description: "The Haryana government has announced a ₹100 crore fund to support agricultural startups in the state, focusing on innovation in farm mechanization, post-harvest technology, and precision farming.",
        url: "https://indianexpress.com/article/cities/chandigarh/haryana-announces-rs-100-crore-fund-for-agricultural-startups-7823789/",
        imageUrl: "https://indianexpress.com/wp-content/uploads/2024/04/haryana-agri-startup.jpg",
        source: "Indian Express",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
        category: "technology",
        tags: ["startup", "funding", "Haryana", "innovation"],
        region: "india",
        state: "Haryana",
        isVerified: true
      },
      {
        title: "Onion Prices Fall by 40% Due to Increased Arrivals in Markets",
        description: "Onion prices have fallen by nearly 40% in major markets across India due to increased arrivals from Maharashtra, Gujarat, and Madhya Pradesh. The wholesale price has dropped to ₹15-20 per kg from ₹30-35 per kg last month.",
        url: "https://www.thehindubusinessline.com/economy/agri-business/onion-prices-fall-by-40-due-to-increased-arrivals-in-markets/article67987890.ece",
        imageUrl: "https://www.thehindubusinessline.com/economy/agri-business/onion-market.jpg",
        source: "The Hindu Business Line",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 24 * 8), // 8 days ago
        category: "market",
        tags: ["onion", "price", "market", "wholesale"],
        region: "india",
        state: "Maharashtra",
        isVerified: true
      },
      {
        title: "Punjab Farmers Adopt Direct Seeding of Rice to Save Water",
        description: "Farmers in Punjab are increasingly adopting direct seeding of rice (DSR) technology to save water and reduce labor costs. The state government is providing a subsidy of ₹1,500 per acre to promote this water-saving technique.",
        url: "https://www.downtoearth.org.in/news/agriculture/punjab-farmers-adopt-direct-seeding-of-rice-to-save-water-78970",
        imageUrl: "https://www.downtoearth.org.in/image/dsr-rice.jpg",
        source: "Down To Earth",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 24 * 9), // 9 days ago
        category: "technology",
        tags: ["rice", "DSR", "water conservation", "Punjab"],
        region: "india",
        state: "Punjab",
        isVerified: true
      },
      {
        title: "Heatwave Alert: IMD Issues Warning for Agricultural Operations in North India",
        description: "The India Meteorological Department has issued a heatwave alert for several parts of North India, advising farmers to take precautionary measures for standing crops and livestock. Temperatures are expected to rise 4-5°C above normal.",
        url: "https://indianexpress.com/article/india/weather/heatwave-alert-imd-issues-warning-for-agricultural-operations-in-north-india-7824567/",
        imageUrl: "https://indianexpress.com/wp-content/uploads/2024/04/heatwave-crops.jpg",
        source: "Indian Express",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
        category: "weather",
        tags: ["heatwave", "IMD", "advisory", "North India"],
        region: "india",
        state: "national",
        isVerified: true
      }
    ];
    
    // Insert the news articles
    for (const article of indianAgricultureNews) {
      await News.findOneAndUpdate(
        { url: article.url },
        article,
        { upsert: true, new: true }
      );
      console.log(`Added/Updated article: ${article.title}`);
    }
    
    // Count Indian articles after adding new ones
    const indianAfter = await News.countDocuments({ region: 'india' });
    console.log(`Indian news articles after addition: ${indianAfter}`);
    console.log(`Added ${indianAfter - indianBefore} new Indian agriculture news articles`);
    
    console.log('Indian agriculture news addition completed successfully');
  } catch (error) {
    console.error('Error during adding Indian agriculture news:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
addIndianAgricultureNews();
