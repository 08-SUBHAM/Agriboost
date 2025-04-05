const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    url: {
        type: String
    },
    imageUrl: {
        type: String
    },
    category: {
        type: String,
        enum: ['scheme', 'news', 'policy'],
        default: 'news'
    },
    state: {
        type: String
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['Technology', 'Industry', 'Development', 'Policy', 'Agriculture'],
        default: 'Agriculture'
    }
});

// Create indexes for better query performance
newsSchema.index({ category: 1, publishedAt: -1 });
newsSchema.index({ title: 1 }, { unique: true });
newsSchema.index({ state: 1 });
newsSchema.index({ type: 1 });

// Export the model
const News = mongoose.model('News', newsSchema);
module.exports = News; 