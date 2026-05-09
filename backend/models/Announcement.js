// backend/src/models/Announcement.js
const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Announcement title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Announcement message is required']
    },
    type: {
        type: String,
        enum: ['general', 'urgent', 'event', 'holiday'],
        default: 'general'
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);