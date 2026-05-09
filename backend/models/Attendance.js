// backend/src/models/Attendance.js
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: { // e.g., Present, Absent, Late
        type: String,
        enum: ['present', 'absent', 'late'],
        default: 'present'
    },
    remarks: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);