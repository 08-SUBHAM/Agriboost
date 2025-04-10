const mongoose = require('mongoose');
const News = require('./models/news');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Sonu0810:sonu0810@cluster.qxafmqo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';

// Current date for publishing
const currentDate = new Date();

// Array of curated Indian agriculture news articles
const indianAgricultureNews = [
    {
        title: "PM-KISAN 20th Installment Expected Soon: What Farmers Need to Know",
        description: "The 20th installment of PM-KISAN scheme is expected to be released soon, providing ₹2,000 to eligible farmers. Complete your e-KYC to ensure timely receipt of funds.",
        content: "The Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) scheme's 20th installment is expected to be released soon. Under this scheme, eligible farmers receive ₹6,000 annually in three equal installments. To ensure timely receipt of the upcoming ₹2,000 installment, farmers are advised to complete their e-KYC process through the official PM-KISAN portal or nearest Common Service Centers.",
        source: "AgriBoost Indian News",
        url: "https://agriboost.in/news/pm-kisan-20th-installment-2025",
        imageUrl: "https://images.unsplash.com/photo-1589923188903-2db981412037?w=800",
        category: "scheme",
        tags: ["PM-KISAN", "farmer", "subsidy", "government"],
        region: "india",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
        isVerified: true
    },
    {
        title: "Cabinet Approves ₹1,600 Crore for Irrigation Modernization Under PMKSY",
        description: "The Union Cabinet has approved ₹1,600 crore for the Modernization of Canal and Distribution Networks (M-CADWM) scheme under PMKSY for 2025-26.",
        content: "The Union Cabinet has approved ₹1,600 crore for the Modernization of Canal and Distribution Networks (M-CADWM) scheme under the Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) for 2025-26. This initiative aims to improve water use efficiency in irrigation through canal lining, pipeline distribution systems, and micro-irrigation. The scheme is expected to benefit farmers across multiple states by reducing water wastage and improving crop yields.",
        source: "AgriBoost Indian News",
        url: "https://agriboost.in/news/cabinet-approves-irrigation-modernization-scheme",
        imageUrl: "https://images.unsplash.com/photo-1589133383091-8f610f61a8c9?w=800",
        category: "scheme",
        tags: ["irrigation", "PMKSY", "water management", "government scheme"],
        region: "india",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 5), // 5 hours ago
        isVerified: true
    },
    {
        title: "India Proposes Centre of Excellence for Agriculture Cooperation at BIMSTEC 2025",
        description: "India has proposed establishing a Centre of Excellence for Agriculture Cooperation at BIMSTEC 2025, focusing on food security and digital farming technologies.",
        content: "At the BIMSTEC 2025 summit, India proposed establishing a Centre of Excellence for Agriculture Cooperation to enhance regional collaboration in agricultural development. The initiative aims to address food security challenges, promote sustainable farming practices, and accelerate the adoption of digital technologies in agriculture across member nations. The proposal includes knowledge sharing platforms, joint research programs, and technology transfer mechanisms to boost agricultural productivity and resilience in the region.",
        source: "AgriBoost Indian News",
        url: "https://agriboost.in/news/india-bimstec-agriculture-cooperation",
        imageUrl: "https://images.unsplash.com/photo-1589133114283-0c6ffa3c3c77?w=800",
        category: "policy",
        tags: ["BIMSTEC", "international cooperation", "digital farming", "food security"],
        region: "india",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 8), // 8 hours ago
        isVerified: true
    },
    {
        title: "Weather Update: IMD Warns of Heavy Rain in Bihar, Assam, Bengal; Heatwave in North India",
        description: "IMD has issued warnings for heavy rainfall in eastern states and heatwave conditions in Delhi, Rajasthan, Gujarat, Punjab, and Madhya Pradesh this week.",
        content: "The India Meteorological Department (IMD) has issued warnings for heavy rainfall in Bihar, Assam, West Bengal, Kerala, and Tamil Nadu over the coming days. Simultaneously, heatwave conditions are expected to intensify in Delhi, Rajasthan, Gujarat, Punjab, and Madhya Pradesh. Farmers are advised to take necessary precautions to protect crops from both excessive rainfall and extreme heat. The varying weather patterns across the country could impact agricultural operations and crop development in different regions.",
        source: "AgriBoost Indian News",
        url: "https://agriboost.in/news/imd-weather-update-april-2025",
        imageUrl: "https://images.unsplash.com/photo-1589133112319-5c8d0a6b8a0a?w=800",
        category: "weather",
        tags: ["IMD", "monsoon", "heatwave", "crop protection"],
        region: "india",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 10), // 10 hours ago
        isVerified: true
    },
    {
        title: "Success Story: Himachal Farmer Earns ₹8-9 Lakh Annually Through Crop Diversification",
        description: "A farmer from Himachal Pradesh is earning ₹8-9 lakh annually by growing vegetables alongside traditional wheat and maize crops.",
        content: "Pawan Kumar, a progressive farmer from Himachal Pradesh, has transformed his agricultural income by implementing crop diversification strategies. By growing high-value vegetables alongside traditional wheat and maize crops, Kumar now earns between ₹8-9 lakh annually. His success story highlights the potential of integrated farming approaches that combine traditional and modern agricultural practices. Kumar attributes his success to scientific farming methods, optimal resource utilization, and market-oriented crop selection.",
        source: "AgriBoost Indian News",
        url: "https://agriboost.in/news/himachal-farmer-success-story",
        imageUrl: "https://images.unsplash.com/photo-1589133112319-5c8d0a6b8a0b?w=800",
        category: "news",
        tags: ["success story", "crop diversification", "Himachal Pradesh", "vegetable farming"],
        region: "india",
        state: "Himachal Pradesh",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 12), // 12 hours ago
        isVerified: true
    },
    {
        title: "India, Israel Deepen Agricultural Ties with New Agreements on Seeds and Technology",
        description: "India and Israel have signed new agreements focusing on seed development, agricultural technology, and sustainability practices.",
        content: "India and Israel have strengthened their agricultural cooperation through new agreements focusing on seed development, technology transfer, and sustainable farming practices. The collaboration aims to enhance crop productivity, water efficiency, and climate resilience in Indian agriculture. Israeli expertise in drip irrigation, precision farming, and drought-resistant crop varieties will be leveraged to address agricultural challenges in various Indian states. The partnership includes joint research initiatives, technology demonstrations, and capacity building programs for Indian farmers.",
        source: "AgriBoost Indian News",
        url: "https://agriboost.in/news/india-israel-agricultural-agreements",
        imageUrl: "https://images.unsplash.com/photo-1589133112319-5c8d0a6b8a0c?w=800",
        category: "technology",
        tags: ["Israel", "international cooperation", "seed technology", "sustainable agriculture"],
        region: "india",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 15), // 15 hours ago
        isVerified: true
    },
    {
        title: "Natural Farming Revolution: How 30 Lakh Indian Farmers Are Thriving",
        description: "Over 30 lakh farmers across India have adopted natural farming methods, reporting improved health, reduced costs, and sustainable yields.",
        content: "A growing natural farming movement has transformed the agricultural practices of over 30 lakh farmers across India. These farmers report significant benefits including improved health due to chemical-free produce, reduced production costs, enhanced soil fertility, and sustainable crop yields. The movement has gained momentum through farmer-to-farmer knowledge sharing, government support programs, and increasing consumer demand for organic produce. Success stories from states like Andhra Pradesh, Gujarat, and Himachal Pradesh demonstrate the viability of natural farming as a sustainable alternative to conventional chemical-intensive agriculture.",
        source: "AgriBoost Indian News",
        url: "https://agriboost.in/news/natural-farming-revolution-india",
        imageUrl: "https://images.unsplash.com/photo-1589133112319-5c8d0a6b8a0d?w=800",
        category: "news",
        tags: ["natural farming", "organic", "sustainable agriculture", "farmer health"],
        region: "india",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 18), // 18 hours ago
        isVerified: true
    },
    {
        title: "Dr. A.K. Nayak Takes Charge as Deputy Director General at ICAR",
        description: "Dr. A.K. Nayak has assumed the role of Deputy Director General (Natural Resource Management) at the Indian Council of Agricultural Research (ICAR).",
        content: "Dr. A.K. Nayak has taken charge as the Deputy Director General (Natural Resource Management) at the Indian Council of Agricultural Research (ICAR). With over three decades of experience in agricultural research and resource management, Dr. Nayak brings valuable expertise to this critical role. His appointment is expected to strengthen ICAR's initiatives in sustainable resource management, soil health improvement, water conservation, and climate-resilient agricultural practices. Dr. Nayak has emphasized the importance of integrating traditional knowledge with modern scientific approaches to address contemporary agricultural challenges.",
        source: "AgriBoost Indian News",
        url: "https://agriboost.in/news/dr-nayak-appointed-dg-icar",
        imageUrl: "https://images.unsplash.com/photo-1589133112319-5c8d0a6b8a0e?w=800",
        category: "news",
        tags: ["ICAR", "appointment", "agricultural research", "natural resource management"],
        region: "india",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 24), // 24 hours ago
        isVerified: true
    },
    {
        title: "Merchant Navy Captain Turns Millionaire Farmer Through Natural Farming",
        description: "A former Merchant Navy Captain has become a millionaire farmer by implementing natural farming techniques and value addition in sugarcane and turmeric cultivation.",
        content: "A former Merchant Navy Captain has successfully transitioned to agriculture, becoming a millionaire farmer through natural farming methods and value addition strategies. Focusing on sugarcane and turmeric cultivation, he has achieved remarkable returns of approximately ₹2,00,000 per acre. His approach combines traditional farming wisdom with modern marketing techniques, including direct-to-consumer sales and product diversification. The success story demonstrates the economic viability of natural farming and the potential for value addition to significantly enhance farm income.",
        source: "AgriBoost Indian News",
        url: "https://agriboost.in/news/merchant-navy-captain-millionaire-farmer",
        imageUrl: "https://images.unsplash.com/photo-1589133112319-5c8d0a6b8a0f?w=800",
        category: "news",
        tags: ["success story", "natural farming", "value addition", "sugarcane", "turmeric"],
        region: "india",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 30), // 30 hours ago
        isVerified: true
    },
    {
        title: "PM POSHAN Scheme: Centre Hikes Material Cost for School Meals by 9.5%",
        description: "The central government has increased the material cost component for school meals under the PM POSHAN scheme by 9.5%, aiming to provide better nutrition to school children.",
        content: "The central government has approved a 9.5% increase in the material cost component for school meals under the PM POSHAN scheme. This enhancement will support the provision of 26 lakh metric tonnes of foodgrains annually to improve the nutritional status of school children. The initiative aims to boost school attendance, reduce dropout rates, and address malnutrition among children. The revised cost structure will help schools provide more nutritious meals with greater variety, potentially including more protein-rich foods and locally sourced fresh vegetables.",
        source: "AgriBoost Indian News",
        url: "https://agriboost.in/news/pm-poshan-scheme-cost-hike",
        imageUrl: "https://images.unsplash.com/photo-1589133112319-5c8d0a6b8a0g?w=800",
        category: "scheme",
        tags: ["PM POSHAN", "school meals", "nutrition", "government scheme"],
        region: "india",
        publishedAt: new Date(currentDate.getTime() - 1000 * 60 * 60 * 36), // 36 hours ago
        isVerified: true
    }
];

async function addIndianNews() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Count existing Indian news
        const existingIndianNews = await News.countDocuments({ region: 'india' });
        console.log(`Found ${existingIndianNews} existing Indian news articles`);

        // Add Indian news articles
        let addedCount = 0;
        for (const article of indianAgricultureNews) {
            try {
                // Check if article with same URL already exists
                const existingArticle = await News.findOne({ url: article.url });
                
                if (existingArticle) {
                    console.log(`Article already exists: ${article.title}`);
                    continue;
                }
                
                // Create new article
                await News.create(article);
                console.log(`Added Indian news article: ${article.title}`);
                addedCount++;
            } catch (error) {
                console.error(`Error adding article "${article.title}":`, error.message);
            }
        }

        console.log(`Successfully added ${addedCount} new Indian news articles`);
        
        // Count Indian news after adding
        const updatedIndianNews = await News.countDocuments({ region: 'india' });
        console.log(`Now have ${updatedIndianNews} Indian news articles in total`);
        
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        
        return { added: addedCount, total: updatedIndianNews };
    } catch (error) {
        console.error('Error:', error);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
        }
        throw error;
    }
}

// Run the function
addIndianNews()
    .then(result => {
        console.log(`Operation completed: Added ${result.added} articles, total ${result.total} Indian articles`);
        process.exit(0);
    })
    .catch(error => {
        console.error('Failed to add Indian news:', error);
        process.exit(1);
    });
