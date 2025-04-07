# Agriboost Technical Documentation

## Architecture Overview

### Backend Architecture
The application follows a modular architecture with clear separation of concerns:

1. **Models Layer** (`/models`)
   - Database schemas and models
   - Data validation and business rules
   - Mongoose models for MongoDB interaction

2. **Services Layer** (`/services`)
   - Business logic implementation
   - News scraping and aggregation
   - Data processing and transformation

3. **Routes Layer** (`/routes`)
   - API endpoint definitions
   - Request handling and validation
   - Response formatting

4. **Middleware Layer** (`/middleware`)
   - Authentication and authorization
   - Request preprocessing
   - Error handling

### Frontend Architecture
- EJS templating engine for server-side rendering
- Modular view components
- Responsive design using Bootstrap

## Core Components

### News Service
The news service (`services/newsService.js`) handles:
- Web scraping from multiple sources
- Article deduplication
- Content cleaning and normalization
- Error handling and retry logic
- Caching mechanism

Key features:
```javascript
class NewsService {
    constructor() {
        this.newsCache = new Map();
        this.sources = [
            {
                name: 'AgriNews',
                url: 'https://www.agrinews-pubs.com',
                selectors: {...}
            },
            // Other sources...
        ];
    }

    async fetchAndStoreNews() {
        // Implementation details
    }

    async extractArticleFromElement(element, source) {
        // Article extraction logic
    }
}
```

### Authentication System
JWT-based authentication with:
- Secure password hashing using bcrypt
- Token-based session management
- Role-based access control
- Cookie-based token storage

### Database Schema

#### User Model
```javascript
{
    firstname: String,
    surname: String,
    email: String,
    password: String,
    profilePicture: {
        data: Buffer,
        contentType: String
    },
    // Other fields...
}
```

#### News Model
```javascript
{
    title: String,
    description: String,
    url: String,
    imageUrl: String,
    source: String,
    publishedAt: Date,
    views: Number,
    clicks: Number
}
```

#### Scheme Model
```javascript
{
    name: String,
    description: String,
    amount: String,
    date: Date,
    eligibility: String,
    documents: [String],
    source: String,
    sourceUrl: String,
    category: String
}
```

## API Documentation

### News Endpoints

#### Search News
```http
GET /api/news/search
Query Parameters:
- query: string (optional)
- category: string (optional)
- region: string (optional)
- limit: number (default: 20)
```

#### Track Article View
```http
POST /api/news/:id/view
Headers:
- Authorization: Bearer <token>
```

#### Track Article Click
```http
POST /api/news/:id/click
Headers:
- Authorization: Bearer <token>
```

### User Endpoints

#### Register
```http
POST /register
Body:
{
    "firstname": string,
    "surname": string,
    "email": string,
    "password": string
}
```

#### Login
```http
POST /login
Body:
{
    "email": string,
    "password": string
}
```

## Error Handling

The application implements a comprehensive error handling system:

1. **HTTP Errors**
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 500: Internal Server Error

2. **Custom Error Classes**
```javascript
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
```

3. **Error Middleware**
```javascript
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});
```

## Security Measures

1. **Authentication**
   - JWT token validation
   - Password hashing with bcrypt
   - Secure cookie settings

2. **Data Protection**
   - Input sanitization
   - XSS prevention
   - CSRF protection

3. **Rate Limiting**
   - API request throttling
   - Brute force protection

## Deployment

### Environment Setup
1. Node.js environment
2. MongoDB database
3. Environment variables configuration

### Deployment Platforms
- Render
- Netlify
- Custom server

### Deployment Process
1. Code push to repository
2. Automated testing
3. Build process
4. Deployment to production

## Maintenance

### Regular Tasks
1. News source monitoring
2. Database backups
3. Security updates
4. Performance optimization

### Monitoring
1. Error logging
2. Performance metrics
3. User analytics
4. Server health checks

## Future Improvements

1. **Technical Improvements**
   - Implement Redis caching
   - Add WebSocket support
   - Enhance search functionality
   - Implement rate limiting

2. **Feature Additions**
   - User notifications
   - Social sharing
   - Comment system
   - Advanced analytics

3. **Performance Optimization**
   - Image optimization
   - Code splitting
   - Lazy loading
   - CDN integration 