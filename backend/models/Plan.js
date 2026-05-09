// backend/src/models/Plan.js
const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Plan title is required'],
        trim: true
    },
    description: String,
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Plan', PlanSchema);