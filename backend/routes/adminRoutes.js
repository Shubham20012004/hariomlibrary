// backend/src/routes/adminRoutes.js

const express = require('express');
const {
    getDashboardSummary,
    getAllUsers,
    deleteUser,
    updateUserFees, // Import the updated controller function
    getAllComplaints,
    updateComplaintStatus,
    deleteComplaint,
    getAllAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes are protected and require 'admin' role
router.use(protect);
router.use(authorize('admin'));

// Dashboard Summary
router.get('/summary', getDashboardSummary);

// User Management
router.route('/users')
    .get(getAllUsers);
router.route('/users/:id')
    .delete(deleteUser);

// User Fees Management - NEW ROUTE / MODIFIED BEHAVIOR
router.route('/users/:id/fees')
    .put(updateUserFees); // This route will now handle amount and method

// Complaint Management
router.route('/complaints')
    .get(getAllComplaints);
router.route('/complaints/:id')
    .delete(deleteComplaint);
router.route('/complaints/:id/status')
    .put(updateComplaintStatus);

// Announcements Management
router.route('/announcements')
    .get(getAllAnnouncements)
    .post(createAnnouncement);
router.route('/announcements/:id')
    .delete(deleteAnnouncement);

module.exports = router;
