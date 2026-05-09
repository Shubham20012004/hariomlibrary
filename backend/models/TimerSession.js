// backend/src/models/TimerSession.js
const mongoose = require('mongoose');

const TimerSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        trim: true,
        default: 'Study Session',
    },
    durationSeconds: {
        type: Number,
        required: [true, 'Duration in seconds is required'],
        min: 0,
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required'],
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('TimerSession', TimerSessionSchema);