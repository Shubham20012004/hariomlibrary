// backend/src/models/Exam.js
const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: [true, 'Exam subject is required'],
        trim: true
    },
    examDate: {
        type: Date,
        required: [true, 'Exam date is required']
    },
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Exam', ExamSchema);