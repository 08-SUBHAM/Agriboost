const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const userModel = require("./models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mongoose = require('mongoose');
const Crop = require('./models/crop');
const axios = require('axios'); // Add axios for API calls
const News = require('./models/news');
const Scheme = require('./models/scheme');
const cheerio = require('cheerio');
const webpush = require('web-push');
const Subscription = require('./models/subscription');

// Import forum routes
const forumRoutes = require('./routes/forum');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Fixed syntax
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.png')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));
app.use(cookieParser());

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
  });

// Improved MongoDB connection with auto-reconnect
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Sonu0810:sonu0810@cluster.qxafmqo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    // Don't exit, let the app continue without DB
});

// Event listeners for connection status
mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB connection lost, attempting to reconnect...');
    setTimeout(() => {
        mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Sonu0810:sonu0810@cluster.qxafmqo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }, 5000);
});

// Function to fetch and store government schemes
async function fetchAndStoreSchemes() {
    try {
        console.log('Fetching government schemes...');
        
        // Example schemes (you should replace this with actual API calls)
        const schemes = [
            {
                name: "PM-KISAN",
                description: "Direct income support of Rs. 6000 per year to farmer families",
                amount: "₹6,000 per year",
                date: new Date(),
                eligibility: "All small and marginal farmers",
                documents: ["Aadhaar Card", "Land Records"],
                source: "Government of India",
                sourceUrl: "https://pmkisan.gov.in/",
                category: "Subsidy"
            },
            {
                name: "Pradhan Mantri Fasal Bima Yojana",
                description: "Crop insurance scheme to protect against crop failure",
                amount: "Variable based on crop and area",
                date: new Date(),
                eligibility: "All farmers growing notified crops",
                documents: ["Land Records", "Bank Account Details"],
                source: "Government of India",
                sourceUrl: "https://pmfby.gov.in/",
                category: "Insurance"
            },
            {
                name: "Kisan Credit Card",
                description: "Easy credit access for farmers",
                amount: "Up to ₹3 lakhs",
                date: new Date(),
                eligibility: "All farmers and agricultural laborers",
                documents: ["ID Proof", "Land Records"],
                source: "Government of India",
                sourceUrl: "https://www.nabard.org/",
                category: "Loan"
            }
        ];

        // Store each scheme in the database
        for (const scheme of schemes) {
            await Scheme.findOneAndUpdate(
                { name: scheme.name },
                scheme,
                { upsert: true, new: true }
            );
        }
        
        console.log('Government schemes updated successfully');
    } catch (error) {
        console.error('Error fetching government schemes:', error);
        // Continue without schemes
    }
}

// Run fetchAndStoreSchemes on startup and every 24 hours
mongoose.connection.once('connected', () => {
    console.log('MongoDB connected successfully');
    fetchAndStoreSchemes(); // Run immediately
    setInterval(fetchAndStoreSchemes, 24 * 60 * 60 * 1000); // Run every 24 hours
});

// Middleware to make user available to all views and check authentication
app.use(async (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "shhhhhhhhhh");
            const user = await userModel.findById(decoded.id);
            
            if (user) {
                res.locals.user = {
                    _id: user._id,
                    email: user.email || '',
                    firstname: user.firstname || '',
                    surname: user.surname || '',
                    profilePicture: user.profilePicture || ''
                };
                req.user = res.locals.user;
            } else {
                res.clearCookie("token", {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    path: '/',
                    expires: new Date(0)
                });
                res.locals.user = null;
                req.user = null;
            }
        } catch (err) {
            res.clearCookie("token", {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                path: '/',
                expires: new Date(0)
            });
            res.locals.user = null;
            req.user = null;
        }
    } else {
        res.locals.user = null;
        req.user = null;
    }
    next();
});

// Middleware to check JWT authentication for protected routes
const checkAuth = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    next();
};

// Routes
app.get('/', (req, res) => {
    res.render('home', { user: res.locals.user });
});

app.get('/about', (req, res) => {
    res.render('about');
});

// Protected dashboard route
app.get('/dashboard', checkAuth, async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        if (!user) {
            return res.redirect('/login');
        }

        // Fetch crops data
        const crops = await Crop.find().lean();
        
        // Fetch news articles
        const news = await News.find()
            .sort({ date: -1 })
            .limit(5)
            .lean();
        
        // Fetch government schemes
        let schemes = [];
        try {
            schemes = await Scheme.find()
                .sort({ date: -1 })
                .limit(4)
                .lean();
        } catch (schemesError) {
            console.error('Error fetching schemes:', schemesError);
        }
        
        res.render('dashboard', { 
            user: {
                _id: user._id,
                email: user.email || '',
                firstname: user.firstname || '',
                surname: user.surname || '',
                profilePicture: user.profilePicture || ''
            },
            crops: crops || [],
            newsArticles: news || [],
            schemes: schemes || []
        });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.redirect('/login');
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/profile', checkAuth, async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        if (!user) {
            return res.redirect('/login');
        }
        res.render('profile', { 
            user: {
                _id: user._id,
                email: user.email || '',
                firstname: user.firstname || '',
                surname: user.surname || '',
                profilePicture: user.profilePicture || ''
            },
            activeTab: req.query.tab || 'general' // Default to general tab
        });
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
});

app.post('/profile', checkAuth, upload.single('profilePicture'), async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);

        const updates = {
            firstname: req.body.firstname,
            surname: req.body.surname,
            email: req.body.email,
            company: req.body.company,
            bio: req.body.bio,
            birthday: req.body.birthday,
            country: req.body.country,
            phone: req.body.phone,
            website: req.body.website,
            socialLinks: {
                twitter: req.body.twitter,
                facebook: req.body.facebook,
                instagram: req.body.instagram,
                linkedin: req.body.linkedin
            },
            notifications: {
                articleComments: req.body.articleComments === 'on',
                forumAnswers: req.body.forumAnswers === 'on',
                follows: req.body.follows === 'on',
                announcements: req.body.announcements === 'on',
                productUpdates: req.body.productUpdates === 'on',
                blogDigest: req.body.blogDigest === 'on'
            }
        };

        // Handle password update if requested
        if (req.body.currentPassword && req.body.newPassword && req.body.confirmPassword) {
            // Verify current password
            const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
            if (!isMatch) {
                return res.render('profile', {
                    user,
                    error: 'Current password is incorrect',
                    activeTab: 'change-password'
                });
            }

            // Check if new passwords match
            if (req.body.newPassword !== req.body.confirmPassword) {
                return res.render('profile', {
                    user,
                    error: 'New passwords do not match',
                    activeTab: 'change-password'
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);
            updates.password = hashedPassword;
        }

        // Handle file upload if present
        if (req.file) {
            updates.profilePicture = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        // Update user and get the updated document
        const updatedUser = await userModel.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true } // This returns the updated document
        );

        // Refresh the token with updated user data
        const newToken = jwt.sign(
            { 
                email: updatedUser.email,
                id: updatedUser._id 
            }, 
            process.env.JWT_SECRET || "shhhhhhhhhh"
        );

        // Set the new cookie with consistent settings
        res.cookie("token", newToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        // Single redirect with success message
        res.redirect('/profile?tab=' + (req.body.activeTab || 'general') + '&success=Profile+updated+successfully');
        
    } catch (err) {
        res.render('profile', { 
            user: req.user,
            error: 'Error updating profile: ' + err.message,
            activeTab: req.body.activeTab || 'general'
        });
    }
});

app.post('/register', (req, res) => {
    let { firstname, surname, email, password } = req.body;

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let createdUser = await userModel.create({
                firstname,
                surname,
                email,
                password: hash
            });

            let token = jwt.sign({ email, id: createdUser._id }, process.env.JWT_SECRET || "shhhhhhhhhh");
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                path: '/',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
            res.redirect('/');
        });
    });
});


app.get("/login", (req, res) => {
    res.render('login');
});

app.post("/login", async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            return res.render('login', { 
                error: 'Invalid email or password',
                email: req.body.email
            });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.render('login', {
                error: 'Invalid email or password',
                email: req.body.email
            });
        }

        const token = jwt.sign(
            { 
                email: user.email,
                id: user._id
            }, 
            process.env.JWT_SECRET || "shhhhhhhhhh",
            { expiresIn: '24h' }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Set to false for localhost
            sameSite: 'strict',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.redirect('/dashboard');
        
    } catch (err) {
        console.error(err);
        res.render('login', { 
            error: 'An error occurred. Please try again.',
            email: req.body.email
        });
    }
});




app.get("/logout", (req, res) => {
    // Clear the token cookie with all security options
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
        expires: new Date(0)
    });

    // Clear all session data
    res.locals.user = null;
    req.user = null;
    
    // Set cache control headers to prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    // Send a response that forces a complete page reload
    res.status(200).send(`
        <script>
            // Clear all cookies
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            // Force a complete page reload
            window.location.href = "/";
        </script>
    `);
});

// Get all crops for the logged-in user
app.get('/api/crops', checkAuth, async (req, res) => {
    try {
        const crops = await Crop.find({ userId: req.user.id });
        res.json(crops);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch crops' });
    }
});

// Add a new crop
app.post('/api/crops', checkAuth, async (req, res) => {
    try {
        const crop = new Crop({
            name: req.body.name,
            type: req.body.type,
            plantingDate: req.body.plantingDate,
            harvestDate: req.body.harvestDate,
            fieldSize: req.body.fieldSize,
            location: req.body.location || 'Default Location',
            status: 'Growing',
            health: req.body.health || 85,
            userId: req.user.id
        });
        
        const savedCrop = await crop.save();
        res.json(savedCrop);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add crop', details: error.message });
    }
});

// Update crop health
app.put('/api/crops/:id/health', checkAuth, async (req, res) => {
    try {
        const crop = await Crop.findOne({ _id: req.params.id, userId: req.user.id });
        if (!crop) {
            return res.status(404).json({ error: 'Crop not found' });
        }

        crop.health = req.body.health;
        await crop.save();
        res.json(crop);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update crop health' });
    }
});

// Delete a crop
app.delete('/api/crops/:id', checkAuth, async (req, res) => {
    try {
        const crop = await Crop.findOne({ _id: req.params.id, userId: req.user.id });
        
        if (!crop) {
            return res.status(404).json({ error: 'Crop not found' });
        }

        // Check if the crop belongs to the user
        if (crop.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this crop' });
        }

        await crop.deleteOne();
        res.json({ message: 'Crop deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete crop', details: error.message });
    }
});

// Disease Detection API endpoint
app.post('/api/detect-disease', checkAuth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ error: 'Invalid file type. Please upload a JPEG or PNG image.' });
        }

        // Convert the image buffer to base64
        const imageBase64 = req.file.buffer.toString('base64');

        // Make request to Plant.id API
        const API_KEY = 'IBggC2Huag8QREDlRc80CEqtQQH3dVHekK8jzYMZZLFi41Ayn8';
        
        const response = await axios.post('https://plant.id/api/v3/health_assessment', {
            images: [imageBase64],
            latitude: 49.207,
            longitude: 16.608,
            similar_images: true,
            health: "only"
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': API_KEY
            }
        });

        // Process the response
        if (response.data && response.data.result) {
            const result = response.data.result;
            
            // Check if it's a plant first
            if (!result.is_plant?.binary) {
                return res.json({
                    disease: 'Analysis inconclusive',
                    confidence: 0,
                    treatment: 'Please upload a clear image of a plant.',
                    description: 'The uploaded image does not appear to contain a plant. Please ensure the image shows the plant clearly.'
                });
            }

            // Check health status
            if (result.disease && result.disease.suggestions && result.disease.suggestions.length > 0) {
                const diseases = result.disease.suggestions;
                const primaryDisease = diseases[0]; // Get the most likely disease
                
                // Combine top disease causes if there are multiple with high probability
                const significantDiseases = diseases
                    .filter(d => d.probability > 0.3)
                    .map(d => d.name)
                    .join(", ");

                // Format treatment recommendations based on detected issues
                let treatment = "Based on the analysis:\n";
                diseases.forEach(disease => {
                    if (disease.probability > 0.3) {
                        treatment += `- For ${disease.name}: Ensure proper ${
                            disease.name.includes('nutrient') ? 'fertilization' :
                            disease.name.includes('water') ? 'watering schedule' :
                            disease.name.includes('light') ? 'lighting conditions' :
                            'care'
                        }\n`;
                    }
                });

                res.json({
                    disease: significantDiseases || primaryDisease.name,
                    confidence: primaryDisease.probability,
                    treatment: treatment,
                    description: `The analysis detected potential issues with: ${significantDiseases}. ${
                        result.disease.question ? 
                        `\nDiagnostic question: ${result.disease.question.text}` : 
                        ''
                    }`,
                    similar_images: primaryDisease.similar_images
                });
            } else if (result.is_healthy?.binary) {
                res.json({
                    disease: 'No disease detected',
                    confidence: result.is_healthy.probability,
                    treatment: 'Your crop appears to be healthy. Continue with regular maintenance.',
                    description: 'No significant health issues were detected in the image.'
                });
            } else {
                res.json({
                    disease: 'Analysis inconclusive',
                    confidence: 0,
                    treatment: 'Please try again with a clearer image that shows the plant and any affected areas clearly.',
                    description: 'The analysis was unable to determine specific issues. This might be due to image quality or lighting.'
                });
            }
        } else {
            res.json({
                disease: 'Analysis inconclusive',
                confidence: 0,
                treatment: 'Please try again with a clearer image.',
                description: 'The analysis was unable to process the image properly. Please ensure good lighting and focus.'
            });
        }
    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json({
                error: 'Error analyzing image',
                details: error.response.data.message || error.response.data
            });
        }
        res.status(500).json({ 
            error: 'Error analyzing image. Please try again.',
            details: error.message
        });
    }
});

// Function to fetch and store news
async function fetchAndStoreNews() {
    try {
        const sources = [
            {
                url: 'https://www.agweb.com/news',
                category: 'news',
                selector: {
                    article: 'article',
                    title: 'h2',
                    description: 'p',
                    image: 'img',
                    link: 'a',
                    date: 'time'
                }
            }
        ];

        for (const source of sources) {
            try {
                console.log(`Fetching news from ${source.url}...`);
                const response = await axios.get(source.url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    },
                    timeout: 10000
                });

                const $ = cheerio.load(response.data);
                const articles = [];

                $(source.selector.article).each((i, element) => {
                    try {
                        const title = $(element).find(source.selector.title).text().trim();
                        const description = $(element).find(source.selector.description).text().trim();
                        let imageUrl = $(element).find(source.selector.image).attr('src');
                        const link = $(element).find(source.selector.link).attr('href');
                        const date = $(element).find(source.selector.date).text().trim();

                        // Handle relative image URLs
                        if (imageUrl && !imageUrl.startsWith('http')) {
                            const baseUrl = new URL(source.url).origin;
                            imageUrl = new URL(imageUrl, baseUrl).href;
                        }

                        // Handle relative links
                        if (link && !link.startsWith('http')) {
                            const baseUrl = new URL(source.url).origin;
                            link = new URL(link, baseUrl).href;
                        }

                        if (title && description) {
                            articles.push({
                                title,
                                description,
                                imageUrl: imageUrl || null,
                                url: link,
                                category: source.category,
                                source: new URL(source.url).hostname,
                                publishedAt: new Date(date || Date.now())
                            });
                        }
                    } catch (articleError) {
                        console.error('Error processing article:', articleError);
                    }
                });

                console.log(`Found ${articles.length} articles from ${source.url}`);

                // Store articles in database
                for (const article of articles) {
                    try {
                        await News.findOneAndUpdate(
                            { title: article.title },
                            article,
                            { upsert: true, new: true }
                        );
                    } catch (dbError) {
                        console.error('Error storing article:', dbError);
                    }
                }

                // Add delay between requests to avoid overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`Error fetching from ${source.url}:`, error);
            }
        }
    } catch (error) {
        console.error('Error in fetchAndStoreNews:', error);
    }
}

// Schedule news and scheme updates
setInterval(fetchAndStoreNews, 2 * 60 * 60 * 1000); // Every 2 hours

// Update the government schemes endpoint
app.get('/api/govt-schemes', checkAuth, async (req, res) => {
    console.log('Received request for government schemes');
    try {
        const schemes = await Scheme.find({ status: 'Active' })
            .sort({ date: -1 })
            .limit(10);
        res.json(schemes);
    } catch (error) {
        console.error('Error in /api/govt-schemes endpoint:', error);
        res.status(500).json({ 
            error: 'Failed to fetch government schemes', 
            details: error.message
        });
    }
});

// Add endpoint to manually add government schemes
app.post('/api/govt-schemes', checkAuth, async (req, res) => {
    try {
        const scheme = new Scheme({
            name: req.body.name,
            description: req.body.description,
            amount: req.body.amount,
            date: req.body.date,
            eligibility: req.body.eligibility,
            documents: req.body.documents,
            source: req.body.source,
            sourceUrl: req.body.sourceUrl,
            status: req.body.status
        });

        await scheme.save();
        res.json({ message: 'Scheme added successfully', scheme });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add scheme', details: error.message });
    }
});

// Search endpoint for schemes and news
app.get('/api/search', checkAuth, async (req, res) => {
    try {
        const query = req.query.q;
        const results = await News.find({
            $or: [
                { title: { $regex: new RegExp(query, "i") } },
                { description: { $regex: new RegExp(query, "i") } }
            ]
        })
        .sort({ publishedAt: -1 })
        .limit(20);

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Search failed', details: error.message });
    }
});

// API endpoint for news
app.get('/api/news', checkAuth, async (req, res) => {
    try {
        const category = req.query.category;
        const query = category ? { category } : {};
        const news = await News.find(query)
            .sort({ publishedAt: -1 })
            .limit(10);
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Start automatic news fetching when the server starts
async function startAutomaticNewsFetching() {
    try {
        // Initial fetch when server starts
        console.log('Performing initial news fetch...');
        await fetchAndStoreNews();
        console.log('Initial news fetch completed');

        // Schedule periodic fetches every 2 hours
        setInterval(async () => {
            console.log('Starting scheduled news fetch...');
            try {
                await fetchAndStoreNews();
                console.log('Scheduled news fetch completed');
            } catch (error) {
                console.error('Error in scheduled news fetch:', error);
            }
        }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
    } catch (error) {
        console.error('Error in initial news fetch:', error);
    }
}

// Use forum routes with /api/forum prefix
app.use('/api/forum', forumRoutes);

// Configure web-push
const vapidKeys = {
    publicKey: 'BCthrRYr-vr6s7bhSQQ0Zc5N0EZXIMFCINlMTnhaxO-wqv_nqIo05uxaJhS87MIzVVZUf9cx7n7ryCRLbJlHE6M',
    privateKey: '1HbvLW9sHnHbuUl_Z2o1s01FTLBgvQhwrQTPGfHdl-8'
};

webpush.setVapidDetails(
    'mailto:support@agriboost.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// Serve manifest.json
app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

// Handle push notification subscription
app.post('/api/notifications/subscribe', checkAuth, async (req, res) => {
    try {
        const subscription = req.body;
        
        // Store subscription in database
        await Subscription.findOneAndUpdate(
            { userId: req.user.id },
            {
                userId: req.user.id,
                endpoint: subscription.endpoint,
                keys: subscription.keys
            },
            { upsert: true, new: true }
        );
        
        res.status(201).json({ message: 'Subscription saved successfully' });
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(500).json({ error: 'Failed to save subscription' });
    }
});

// Send push notification
app.post('/api/notifications/send', checkAuth, async (req, res) => {
    try {
        const { title, body, userId } = req.body;
        
        // Get subscription for the user
        const subscription = await Subscription.findOne({ userId: userId || req.user.id });
        if (!subscription) {
            return res.status(404).json({ error: 'No subscription found for user' });
        }

        const notificationPayload = {
            notification: {
                title: title,
                body: body,
                icon: '/images/icons/icon-192x192.png',
                badge: '/images/icons/icon-72x72.png',
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: 1
                },
                actions: [{
                    action: 'explore',
                    title: 'View Details'
                }]
            }
        };

        await webpush.sendNotification(
            subscription,
            JSON.stringify(notificationPayload)
        );

        res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

// Start the server and news fetching
app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
    startAutomaticNewsFetching();
});

// Export the function
module.exports = {
    app,
    fetchAndStoreNews
};