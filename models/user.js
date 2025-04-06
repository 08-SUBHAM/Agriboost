const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    surname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    company: String,
    bio: String,
    birthday: Date,
    country: String,
    website: String,
    emailVerified: {
        type: Boolean,
        default: false
    },
    socialLinks: {
        twitter: String,
        facebook: String,
        instagram: String,
        linkedin: String
    },
    notifications: {
        articleComments: { type: Boolean, default: true },
        forumAnswers: { type: Boolean, default: true },
        follows: { type: Boolean, default: false },
        announcements: { type: Boolean, default: true },
        productUpdates: { type: Boolean, default: false },
        blogDigest: { type: Boolean, default: true }
    },
    forumPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumPost'
    }],
    likedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumPost'
    }]
}, { timestamps: true });

// Create indexes
userSchema.index({ createdAt: -1 });

// Add virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstname} ${this.surname}`;
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("User", userSchema);