# Agriboost - Agricultural News and Information Platform

## Overview
Agriboost is a comprehensive agricultural news and information platform that aggregates news from multiple agricultural sources, provides government scheme information, and offers various agricultural services to farmers and agricultural professionals.

## 🌐 Live Demo
Visit: [Agriboost Render Link](https://agriboost.onrender.com)

## Features
- **News Aggregation**: Real-time news from multiple agricultural sources
- **Government Schemes**: Information about agricultural schemes and subsidies
- **User Authentication**: Secure login and registration system
- **Profile Management**: User profiles with customizable settings
- **News Tracking**: View and click tracking for news articles
- **Search Functionality**: Advanced search with filters for news articles

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Frontend**: EJS Templates
- **Authentication**: JWT (JSON Web Tokens)
- **Additional Libraries**: 
  - Cheerio (Web Scraping)
  - Axios (HTTP Client)
  - Multer (File Upload)
  - Bcrypt (Password Hashing)

## Project Structure
```
├── app.js                 # Main application file
├── models/               # Database models
├── views/               # EJS templates
├── public/              # Static files
├── routes/              # Route handlers
├── services/            # Business logic
├── middleware/          # Custom middleware
└── .env                # Environment variables
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/08-SUBHAM/Agriboost.git
cd Agriboost
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret
```

4. Start the server:
```bash
npm start
```

## API Endpoints

### News
- `GET /api/news/search` - Search news articles
- `POST /api/news/:id/view` - Track article views
- `POST /api/news/:id/click` - Track article clicks

### User Management
- `POST /register` - User registration
- `POST /login` - User login
- `GET /logout` - User logout
- `GET /profile` - View profile
- `POST /profile` - Update profile

### Government Schemes
- `GET /api/schemes` - Get all schemes
- `GET /api/schemes/:id` - Get scheme details

## News Sources
The platform aggregates news from multiple sources:
- AgriNews
- Agriculture.com
- Modern Farmer

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- All news sources for providing agricultural content
- Contributors and maintainers
- Open source community

## Contact
Subham - [GitHub Profile](https://github.com/08-SUBHAM)
Project Link: [https://github.com/08-SUBHAM/Agriboost](https://github.com/08-SUBHAM/Agriboost) 