// backend/src/routes/studentRoutes.js
const express = require('express');
const {
    getStudentPlans, createStudentPlan, updateStudentPlan, deleteStudentPlan,
    getStudentAssignments, createStudentAssignment, updateStudentAssignment, deleteStudentAssignment,
    getStudentExams, createStudentExam, updateStudentExam, deleteStudentExam,
    submitComplaint, getMyComplaints,
    getMyAttendance,
    // IMPORTANT: Make sure markAttendance is imported here from your controller
    markAttendance, // <--- ADD THIS LINE IF NOT ALREADY PRESENT
    getMyFeeStatus,
    getMyTimerSessions, addTimerSession, deleteTimerSession,
    getAnnouncementsForStudents
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All student routes are protected and require 'student' role
router.use(protect);
router.use(authorize('student'));

// Study Plans
router.route('/plans')
    .get(getStudentPlans)
    .post(createStudentPlan);
router.route('/plans/:id')
    .put(updateStudentPlan)
    .delete(deleteStudentPlan);

// Assignments
router.route('/assignments')
    .get(getStudentAssignments)
    .post(createStudentAssignment);
router.route('/assignments/:id')
    .put(updateStudentAssignment)
    .delete(deleteStudentAssignment);

// Exams
router.route('/exams')
    .get(getStudentExams)
    .post(createStudentExam);
router.route('/exams/:id')
    .put(updateStudentExam)
    .delete(deleteStudentExam);

// Complaints
router.route('/complaints')
    .post(submitComplaint); // Student submits a complaint
router.route('/complaints/my')
    .get(getMyComplaints); // Student views their own complaints

// Attendance
router.route('/attendance/my')
    .get(getMyAttendance); // Student views their own attendance history

// *** CRITICAL ADDITION: ROUTE FOR MARKING ATTENDANCE ***
router.route('/attendance') // This handles POST requests to /api/student/attendance
    .post(markAttendance); // <--- ADD THIS BLOCK

// Fees
router.route('/fees/my')
    .get(getMyFeeStatus); // Student views their own fee status

// Timer
router.route('/timer')
    .post(addTimerSession);
router.route('/timer/my')
    .get(getMyTimerSessions);
router.route('/timer/:id')
    .delete(deleteTimerSession);

// Announcements
router.route('/announcements')
    .get(getAnnouncementsForStudents);

module.exports = router;
