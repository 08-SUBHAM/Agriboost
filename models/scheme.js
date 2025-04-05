const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Upcoming'],
        default: 'Active'
    },
    category: {
        type: String,
        enum: ['Subsidy', 'Insurance', 'Loan', 'Training', 'Other'],
        default: 'Subsidy'
    },
    eligibility: {
        type: String,
        required: true
    },
    documents: [{
        type: String,
        required: true
    }],
    source: {
        type: String,
        required: true
    },
    sourceUrl: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
schemeSchema.index({ status: 1, date: -1 });
schemeSchema.index({ category: 1 });
schemeSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Scheme', schemeSchema); 