const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['General', 'Crop Management', 'Weather', 'Market', 'Technology', 'Disease Control'],
        default: 'General'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    replies: [{
        content: String,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        authorName: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create indexes for better query performance
forumSchema.index({ category: 1, createdAt: -1 });
forumSchema.index({ author: 1 });

const Forum = mongoose.model('Forum', forumSchema);
module.exports = Forum; 