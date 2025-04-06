const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    source: {
        type: String,
        required: true,
        index: true
    },
    url: {
        type: String,
        required: true,
        unique: true
    },
    imageUrl: {
        type: String
    },
    category: {
        type: String,
        enum: ['scheme', 'news', 'policy', 'technology', 'market', 'weather', 'research'],
        default: 'news',
        index: true
    },
    tags: [{
        type: String,
        index: true
    }],
    region: {
        type: String,
        enum: ['global', 'national', 'state', 'local'],
        default: 'national'
    },
    state: {
        type: String,
        index: true
    },
    publishedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    type: {
        type: String,
        enum: ['Technology', 'Industry', 'Development', 'Policy', 'Agriculture', 'Market', 'Weather', 'Research'],
        default: 'Agriculture',
        index: true
    },
    views: {
        type: Number,
        default: 0
    },
    clicks: {
        type: Number,
        default: 0
    },
    relevanceScore: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create compound indexes for better query performance
newsSchema.index({ category: 1, publishedAt: -1 });
newsSchema.index({ type: 1, publishedAt: -1 });
newsSchema.index({ region: 1, state: 1 });
newsSchema.index({ tags: 1, publishedAt: -1 });

// Add text index for search
newsSchema.index({ 
    title: 'text', 
    description: 'text', 
    content: 'text' 
});

// Pre-save middleware to update lastUpdated
newsSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

// Method to increment views
newsSchema.methods.incrementViews = async function() {
    this.views += 1;
    return this.save();
};

// Method to increment clicks
newsSchema.methods.incrementClicks = async function() {
    this.clicks += 1;
    return this.save();
};

// Static method to get trending news
newsSchema.statics.getTrending = function(limit = 5) {
    return this.find()
        .sort({ views: -1, publishedAt: -1 })
        .limit(limit);
};

// Static method to get latest news by category
newsSchema.statics.getLatestByCategory = function(category, limit = 10) {
    return this.find({ category })
        .sort({ publishedAt: -1 })
        .limit(limit);
};

// Export the model
const News = mongoose.model('News', newsSchema);
module.exports = News; 