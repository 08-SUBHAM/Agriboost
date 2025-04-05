const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    plantingDate: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Growing', 'Harvested', 'Dormant']
    },
    health: {
        type: Number,
        default: 85,
        min: 0,
        max: 100
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    harvestDate: {
        type: Date,
        required: true
    },
    fieldSize: {
        type: Number,
        required: true
    },
    healthStatus: {
        type: String,
        enum: ['healthy', 'at_risk', 'diseased'],
        default: 'healthy'
    },
    lastDiseaseCheck: Date,
    diseaseHistory: [{
        disease: String,
        date: Date,
        treatment: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Crop', cropSchema); 