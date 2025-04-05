const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://127.0.0.1:27017/authtestapp');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        data: Buffer,
        contentType: String
    },
    company: String,
    bio: String,
    birthday: Date,
    country: String,
    phone: String,
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

module.exports = mongoose.model("User", userSchema);