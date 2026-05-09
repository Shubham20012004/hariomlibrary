// backend/src/models/Assignment.js
const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Assignment title is required'],
        trim: true
    },
   
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'missed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);