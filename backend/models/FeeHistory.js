// backend/src/models/FeeHistory.js

const mongoose = require('mongoose');

const FeeHistorySchema = mongoose.Schema(
    {
        // Reference to the student (User) who made the payment
        student: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Student ID is required.'],
            ref: 'User', // This assumes your User model is named 'User'
        },
        // The amount paid for this specific fee record
        amount: {
            type: Number,
            required: [true, 'Amount is required.'],
            min: [0, 'Amount cannot be negative.'],
        },
        // The method of payment (e.g., "Cash", "UPI", "Card", "Online")
        method: {
            type: String,
            required: [true, 'Payment method is required.'],
            trim: true, // Removes whitespace from both ends of a string
            enum: ['Cash', 'UPI', 'Card', 'Online', 'Bank Transfer', 'Other'], // Define allowed payment methods
        },
        // A unique identifier for the payment receipt
        receiptId: {
            type: String,
            required: [true, 'Receipt ID is required.'],
            unique: true, // Ensures each receipt ID is unique
            trim: true,
        },
        // The date when the payment was made
        date: {
            type: Date,
            required: [true, 'Payment date is required.'],
            default: Date.now, // Defaults to current date if not provided
        },
        // Additional field for a more descriptive entry (optional, but good for UI)
        description: {
            type: String,
            trim: true,
            default: 'General Fee Payment',
        },
        // Status of the fee history record itself (e.g., paid, refunded, pending verification)
        status: {
            type: String,
            enum: ['paid', 'refunded', 'pending_verification', 'pending'], // Added 'pending' for 'unpaid' records
            default: 'paid',
        }
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Create and export the model
module.exports = mongoose.model('FeeHistory', FeeHistorySchema);
