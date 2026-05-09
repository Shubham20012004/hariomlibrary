// backend/src/models/Complaint.js
const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: [true, 'Complaint subject is required'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Complaint message is required']
    },
    status: {
        type: String,
        enum: ['pending', 'working on it', 'solved'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field on save
ComplaintSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Complaint', ComplaintSchema);