const axios = require('axios');
const News = require('../models/news');
const NodeCache = require('node-cache');
const natural = require('natural');
const cheerio = require('cheerio');
const tokenizer = new natural.WordTokenizer();

class NewsService {
    constructor() {
        this.sources = [
            {
                name: 'Indian Express Agriculture',
                url: 'https://indianexpress.com/section/india/agriculture-2/',
                selector: {
                    article: '.articles',
                    title: 'h2.title',
                    description: '.synopsis',
                    link: 'h2.title a',
                    image: '.snaps img',
                    date: '.date'
                }
            },
            {
                name: 'Krishi Jagran',
                url: 'https://krishijagran.com/',
                selector: {
                    article: '.article-box',
                    title: '.article-title',
                    description: '.article-summary',
                    link: '.article-title a',
                    image: '.article-image img',
                    date: '.article-date'
                }
            },
            {
                name: 'The Hindu Agriculture',
                url: 'https://www.thehindu.com/business/agri-business/',
                selector: {
                    article: '.story-card',
                    title: '.story-card-headline',
                    description: '.story-card-summary',
                    link: '.story-card-headline a',
                    image: '.story-card-img img',
                    date: '.story-card-dateline'
                }
            },
            {
                name: 'Down To Earth Agriculture',
                url: 'https://www.downtoearth.org.in/category/agriculture/news',
                selector: {
                    article: '.news-item',
                    title: '.news-title',
                    description: '.news-description',
                    link: '.news-title a',
                    image: '.news-image img',
                    date: '.news-date'
                }
            },
            {
                name: 'Rural Marketing',
                url: 'https://ruralmarketing.in/category/agriculture/',
                selector: {
                    article: '.post',
                    title: '.entry-title',
                    description: '.entry-content p',
                    link: '.entry-title a',
                    image: '.post-thumbnail img',
                    date: '.entry-date'
                }
            }
        ];
        this.newsCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
        this.apiKey = process.env.NEWS_API_KEY;
        this.newsApiUrl = 'https://newsapi.org/v2';
    }

    async fetchFromAPI(source) {
        try {
            if (!this.apiKey) {
                console.warn('NewsAPI key not found. Skipping NewsAPI fetch.');
                return [];
            }
            // Store the current source name for region detection
            this.currentSource = source.name;
            
            console.log(`Attempting to fetch from ${source.name} with API key...`);
            
            const response = await axios.get(source.url, { 
                params: source.params,
                timeout: 10000, // 10 second timeout
                headers: {
                    'X-Api-Key': this.apiKey
                }
            });
            
            if (!response.data || !response.data.articles) {
                console.warn(`No articles found from ${source.name}`);
                return [];
            }
            
            console.log(`Successfully fetched ${response.data.articles.length} articles from ${source.name}`);
            return response.data.articles.map(article => this.transformArticle(article, source.name));
        } catch (error) {
            console.error(`Error fetching from ${source.name}: ${error.message}`);
            if (error.response) {
                console.error(`Status: ${error.response.status}`);
                console.error(`Data:`, error.response.data);
            }
            return [];
        }
    }

    async fetchFromScrape(source) {
        try {
            console.log(`Attempting to fetch from ${source.name}...`);
            // Store the current source name for region detection
            this.currentSource = source.name;
            
            const response = await axios.get(source.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                },
                timeout: 30000 // 30 second timeout
            });

            if (!response.data) {
                console.error(`No data received from ${source.name}`);
                return [];
            }

            console.log(`Successfully fetched data from ${source.name}`);
            const $ = cheerio.load(response.data);
            
            // Try specific selectors first
            console.log(`Trying specific selectors for ${source.name}...`);
            let articles = $(source.selector.article).map((i, element) => {
                const article = this.extractArticleFromElement($, element, source);
                if (article) {
                    console.log(`Found article: ${article.title}`);
                }
                return article;
            }).get();

            console.log(`Found ${articles.length} articles with specific selectors from ${source.name}`);

            // If no articles found with specific selectors, try a more generic approach
            if (articles.length === 0) {
                console.log(`No articles found with specific selectors for ${source.name}, trying generic approach...`);
                articles = $('div[class*="article"], div[class*="post"], div[class*="news"], div[class*="entry"]').map((i, element) => {
                    const article = this.extractArticleFromElement($, element, source);
                    if (article) {
                        console.log(`Found article with generic selector: ${article.title}`);
                    }
                    return article;
                }).get();
            }

            // Filter out null articles and duplicates
            const seenUrls = new Set();
            const validArticles = articles.filter(article => {
                if (!article) return false;
                
                // Skip articles that are too short (likely not actual articles)
                if (article.title.length < 10) {
                    console.log(`Skipping short title: "${article.title}"`);
                    return false;
                }

                // Skip author pages and other non-article pages
                if (article.url.includes('/author/') || 
                    article.url.includes('/format/') || 
                    article.url.includes('/tag/') || 
                    article.url.includes('/category/')) {
                    console.log(`Skipping non-article URL: ${article.url}`);
                    return false;
                }

                // Skip duplicates
                if (seenUrls.has(article.url)) {
                    console.log(`Skipping duplicate URL: ${article.url}`);
                    return false;
                }
                seenUrls.add(article.url);

                return true;
            });

            console.log(`Found ${validArticles.length} valid articles from ${source.name}`);
            
            return validArticles;
        } catch (error) {
            console.error(`Error scraping from ${source.name}:`, error.message);
            if (error.response) {
                console.error(`Status: ${error.response.status}`);
                console.error(`Headers:`, error.response.headers);
            }
            return [];
        }
    }

    extractArticleFromElement($, element, source) {
        try {
            // Try to find title and link using both specific and generic selectors
            let title = $(element).find(source.selector.title).text().trim();
            let link = $(element).find(source.selector.link).attr('href');
            
            // Log the initial attempt
            console.log(`Initial attempt for title: "${title}", link: "${link}"`);
            
            // If not found, try generic selectors
            if (!title) {
                title = $(element).find('h1, h2, h3, [class*="title"], [class*="heading"]').first().text().trim();
                console.log(`Tried generic title selectors, got: "${title}"`);
            }
            if (!link) {
                const linkElement = $(element).find('a').first();
                link = linkElement.attr('href');
                if (!title) {
                    title = linkElement.text().trim();
                }
                console.log(`Tried generic link selector, got: "${link}"`);
            }

            // Skip if title is too short or looks like a navigation item
            if (!title || title.length < 10 || title === 'Article' || title === 'News') {
                console.log('Invalid title, skipping article');
                return null;
            }

            // Try to find description using both specific and generic selectors
            let description = $(element).find(source.selector.description).text().trim();
            if (!description) {
                description = $(element).find('p, [class*="summary"], [class*="excerpt"], [class*="description"], [class*="text"]').first().text().trim();
                console.log(`Using generic description: "${description}"`);
            }

            // Try to find image using both specific and generic selectors
            let image = $(element).find(source.selector.image).attr('src');
            if (!image) {
                image = $(element).find('img').first().attr('src');
                console.log(`Using generic image: "${image}"`);
            }

            if (!title || !link) {
                console.log('Missing required fields, skipping article');
                return null;
            }

            // Create a new article object with current date
            const now = new Date();
            const article = {
                title,
                description: description || 'No description available',
                url: link.startsWith('http') ? link : new URL(link, source.url).toString(),
                imageUrl: image ? (image.startsWith('http') ? image : new URL(image, source.url).toString()) : null,
                source: source.name,
                publishedAt: now,
                category: this.determineCategory(title, description),
                tags: this.extractTags(title, description),
                region: this.determineRegion(title, description),
                isVerified: true,
                lastUpdated: now
            };

            console.log(`Successfully created article object for: ${title}`);
            return article;
        } catch (error) {
            console.error('Error extracting article:', error.message);
            return null;
        }
    }

    transformArticle(article, source) {
        if (!article.url) {
            console.warn('Article missing URL, skipping:', article.title);
            return null;
        }

        return {
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            imageUrl: article.urlToImage,
            source: source,
            publishedAt: new Date(article.publishedAt),
            category: this.determineCategory(article.title, article.description),
            tags: this.extractTags(article.title, article.description),
            region: this.determineRegion(article.title, article.description),
            isVerified: true
        };
    }

    determineCategory(title, description) {
        const text = (title + ' ' + description).toLowerCase();
        if (text.includes('scheme') || text.includes('subsidy')) return 'scheme';
        if (text.includes('weather') || text.includes('climate')) return 'Weather';
        if (text.includes('market') || text.includes('price')) return 'Market';
        if (text.includes('research') || text.includes('study')) return 'Research';
        if (text.includes('technology') || text.includes('innovation')) return 'Technology';
        return 'Agriculture';
    }

    extractTags(title, description) {
        const text = (title + ' ' + description).toLowerCase();
        const tokens = tokenizer.tokenize(text);
        const commonTags = ['farming', 'agriculture', 'crops', 'farmers', 'rural', 'technology'];
        return tokens.filter(token => commonTags.includes(token));
    }

    determineRegion(title, description) {
        const text = (title + ' ' + description).toLowerCase();
        
        // Check for Indian regions, states, and cities
        const indianKeywords = [
            'india', 'indian', 'delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 
            'hyderabad', 'punjab', 'haryana', 'uttar pradesh', 'madhya pradesh', 
            'gujarat', 'rajasthan', 'bihar', 'maharashtra', 'karnataka', 'tamil nadu',
            'telangana', 'kerala', 'odisha', 'assam', 'rupee', 'rupees', 'rs.'
        ];
        
        for (const keyword of indianKeywords) {
            if (text.includes(keyword)) return 'india';
        }
        
        // Default to India for all news sources since we're only keeping Indian sources
        return 'india';
    }

    async fetchAndStoreNews() {
        try {
            console.log('Starting news fetch from all sources...');
            const allArticles = [];

            // Add NewsAPI source for Indian agriculture news
            if (this.apiKey) {
                console.log('Fetching Indian agriculture news from NewsAPI...');
                try {
                    const newsApiSource = {
                        name: 'NewsAPI India Agriculture',
                        type: 'api',
                        url: `${this.newsApiUrl}/everything`,
                        params: {
                            apiKey: this.apiKey,
                            q: '(agriculture OR farming OR crops OR farmers OR "rural development") AND (india OR indian OR "uttar pradesh" OR punjab OR haryana OR gujarat OR rajasthan OR maharashtra OR karnataka OR "tamil nadu" OR telangana OR kerala)',
                            language: 'en',
                            sortBy: 'publishedAt',
                            pageSize: 20
                        }
                    };
                    
                    const newsApiArticles = await this.fetchFromAPI(newsApiSource);
                    if (newsApiArticles.length > 0) {
                        console.log(`Found ${newsApiArticles.length} articles from NewsAPI`);
                        allArticles.push(...newsApiArticles);
                    } else {
                        console.log('No articles found from NewsAPI, trying alternative sources');
                    }
                } catch (error) {
                    console.error('Error with NewsAPI fetch:', error.message);
                    console.log('Continuing with other sources...');
                }
            } else {
                console.log('No NewsAPI key provided, skipping NewsAPI fetch');
            }

            for (const source of this.sources) {
                console.log(`Fetching from ${source.name}...`);
                const articles = source.type === 'api' 
                    ? await this.fetchFromAPI(source)
                    : await this.fetchFromScrape(source);
                
                // Filter out any null articles (those missing required fields)
                const validArticles = articles.filter(article => article !== null);
                allArticles.push(...validArticles);
            }

            console.log(`Found ${allArticles.length} valid articles total`);

            // Store articles in database
            for (const article of allArticles) {
                try {
                    if (!article.url) {
                        console.warn('Skipping article without URL:', article.title);
                        continue;
                    }
                    await News.findOneAndUpdate(
                        { url: article.url },
                        article,
                        { upsert: true, new: true }
                    );
                } catch (error) {
                    console.error('Error storing article:', error.message);
                }
            }

            // Clear cache after update
            this.newsCache.flushAll();
            
            return allArticles.length;
        } catch (error) {
            console.error('Error in fetchAndStoreNews:', error.message);
            throw error;
        }
    }

    async getLatestNews(category = null, limit = 10) {
        const cacheKey = `latest_${category || 'all'}_${limit}`;
        const cached = this.newsCache.get(cacheKey);
        
        if (cached) return cached;

        try {
            const query = category ? { category } : {};
            const news = await News.find(query)
                .sort({ publishedAt: -1 })
                .limit(limit)
                .lean();

            this.newsCache.set(cacheKey, news);
            return news;
        } catch (error) {
            console.error('Error fetching latest news:', error.message);
            throw error;
        }
    }

    async getTrendingNews(limit = 5) {
        const cacheKey = `trending_${limit}`;
        const cached = this.newsCache.get(cacheKey);
        
        if (cached) return cached;

        try {
            const news = await News.getTrending(limit);
            this.newsCache.set(cacheKey, news);
            return news;
        } catch (error) {
            console.error('Error fetching trending news:', error.message);
            throw error;
        }
    }

    async searchNews(query, limit = 20) {
        try {
            return await News.find(
                { $text: { $search: query } },
                { score: { $meta: "textScore" } }
            )
            .sort({ score: { $meta: "textScore" }, publishedAt: -1 })
            .limit(limit)
            .lean();
        } catch (error) {
            console.error('Error searching news:', error.message);
            throw error;
        }
    }

    async incrementViews(articleId) {
        try {
            await News.incrementViewsById(articleId);
        } catch (error) {
            console.error('Error incrementing views:', error.message);
        }
    }

    async incrementClicks(articleId) {
        try {
            await News.incrementClicksById(articleId);
        } catch (error) {
            console.error('Error incrementing clicks:', error.message);
        }
    }
}

module.exports = new NewsService(); 