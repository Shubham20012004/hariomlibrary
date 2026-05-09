// backend/src/controllers/adminController.js
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Announcement = require('../models/Announcement');
const FeeHistory = require('../models/FeeHistory'); // Import FeeHistory model
const asyncHandler = require('../middleware/asyncHandler');
const generateReceiptId = require('../utils/generateReceiptId'); // Utility to generate unique receipt IDs

// @desc    Get dashboard summary statistics
// @route   GET /api/admin/summary
// @access  Private (admin)
exports.getDashboardSummary = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const unpaidFeesUsers = await User.countDocuments({ 'fees.status': 'unpaid', role: 'student' }); // Count users with unpaid fees

    res.status(200).json({
        totalUsers,
        pendingComplaints,
        unpaidFeesUsers,
    });
});

// @desc    Get all users (students and admins)
// @route   GET /api/admin/users
// @access  Private (admin)
exports.getAllUsers = asyncHandler(async (req, res) => {
    // Fetch all users, but only show relevant details for security
    // Ensure 'fees' field is included for frontend display
    const users = await User.find().select('-password'); // Exclude password
    res.status(200).json(users);
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Prevent admin from deleting themselves or other admins unless specific logic is added
    if (user.role === 'admin' && req.user.id !== req.params.id) {
        res.status(403);
        throw new Error('Cannot delete another admin account.');
    }
    if (user.role === 'admin' && req.user.id === req.params.id) {
        res.status(403);
        throw new Error('Cannot delete your own admin account.');
    }

    await user.deleteOne();
    res.status(200).json({ message: 'User removed' });
});

// @desc    Update user fees status and amount
// @route   PUT /api/admin/users/:id/fees
// @access  Private (admin)
exports.updateUserFees = asyncHandler(async (req, res) => {
    const { status, amount, method } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!status || !['paid', 'unpaid', 'overdue', 'waived'].includes(status.toLowerCase())) {
        res.status(400);
        throw new Error('Invalid fee status provided.');
    }

    if (amount !== undefined && (isNaN(amount) || amount < 0)) {
        res.status(400);
        throw new Error('Invalid fee amount. Must be a non-negative number.');
    }

    if ((status.toLowerCase() === 'paid' || status.toLowerCase() === 'unpaid') && amount > 0 && !method) {
        res.status(400);
        throw new Error('Payment method is required for non-zero fee updates.');
    }

    if (!user.fees) user.fees = {};

    if (status.toLowerCase() === 'paid' || (status.toLowerCase() === 'unpaid' && amount > 0)) {
        const feeHistoryEntry = {
            student: userId,
            amount: parseFloat(amount),
            method: method || 'N/A',
            receiptId: generateReceiptId(),
            status: status.toLowerCase() === 'paid' ? 'paid' : 'pending',
            description: `Fee ${status.toLowerCase()} for user ${user.name}`
        };
        await FeeHistory.create(feeHistoryEntry);
        console.log(`FeeHistory record created for user ${user.name}: ${JSON.stringify(feeHistoryEntry)}`);
    }

    await User.findByIdAndUpdate(userId, {
        $set: {
            'fees.status': status.toLowerCase(),
            'fees.amount': amount !== undefined ? parseFloat(amount) : user.fees.amount,
            'fees.method': method || user.fees.method,
            'fees.lastUpdated': Date.now()
        }
    }, { new: true, runValidators: false });

    res.status(200).json({
        message: 'User fees updated successfully!',
        fees: {
            status: status.toLowerCase(),
            amount: parseFloat(amount),
            method,
            lastUpdated: new Date()
        }
    });
});
// @desc    Get all complaints
// @route   GET /api/admin/complaints
// @access  Private (admin)
exports.getAllComplaints = asyncHandler(async (req, res) => {
    // Populate the userId to get student's name and email
    const complaints = await Complaint.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.status(200).json(complaints);
});

// @desc    Update complaint status
// @route   PUT /api/admin/complaints/:id/status
// @access  Private (admin)
exports.updateComplaintStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const complaintId = req.params.id;

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
        res.status(404);
        throw new Error('Complaint not found');
    }

    if (!status || !['pending', 'working on it', 'solved'].includes(status.toLowerCase())) {
        res.status(400);
        throw new Error('Invalid complaint status. Must be "pending", "working on it", or "solved".');
    }

    complaint.status = status.toLowerCase();
    await complaint.save();

    res.status(200).json({
        message: 'Complaint status updated successfully!',
        complaint,
    });
});

// @desc    Delete a complaint
// @route   DELETE /api/admin/complaints/:id
// @access  Private (admin)
exports.deleteComplaint = asyncHandler(async (req, res) => {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
        res.status(404);
        throw new Error('Complaint not found');
    }

    await complaint.deleteOne();
    res.status(200).json({ message: 'Complaint removed' });
});

// @desc    Get all announcements
// @route   GET /api/admin/announcements
// @access  Private (admin)
exports.getAllAnnouncements = asyncHandler(async (req, res) => {
    const announcements = await Announcement.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    res.status(200).json(announcements);
});

// @desc    Create an announcement
// @route   POST /api/admin/announcements
// @access  Private (admin)
exports.createAnnouncement = asyncHandler(async (req, res) => {
    const { title, message, type } = req.body;
    if (!title || !message) {
        res.status(400);
        throw new Error('Title and message are required for an announcement.');
    }

    const announcement = await Announcement.create({
        title,
        message,
        type: type || 'general',
        createdBy: req.user.id, // The admin creating the announcement
    });

    res.status(201).json({ message: 'Announcement published successfully!', announcement });
});

// @desc    Delete an announcement
// @route   DELETE /api/admin/announcements/:id
// @access  Private (admin)
exports.deleteAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
        res.status(404);
        throw new Error('Announcement not found');
    }

    // Optional: Add authorization check if only the creator or specific roles can delete
    // if (announcement.createdBy.toString() !== req.user.id && req.user.role !== 'superadmin') {
    //     res.status(401);
    //     throw new Error('Not authorized to delete this announcement');
    // }

    await announcement.deleteOne();
    res.status(200).json({ message: 'Announcement removed' });
});
