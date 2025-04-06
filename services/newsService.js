const axios = require('axios');

class NewsService {
    constructor() {
        this.apiKey = process.env.NEWS_API_KEY;
        this.apiUrl = 'https://newsapi.org/v2';
    }

    async fetchNews() {
        try {
            const response = await axios.get(`${this.apiUrl}/everything`, {
                params: {
                    q: 'agriculture farming crops',
                    language: 'en',
                    sortBy: 'publishedAt',
                    apiKey: this.apiKey
                }
            });

            return response.data.articles.map(article => ({
                title: article.title,
                description: article.description,
                url: article.url,
                imageUrl: article.urlToImage,
                publishedAt: new Date(article.publishedAt)
            }));
        } catch (error) {
            console.error('Error fetching news:', error);
            throw error;
        }
    }
}

module.exports = new NewsService(); 