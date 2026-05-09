// backend/src/controllers/studentController.js
const Plan = require('../models/Plan');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const FeeHistory = require('../models/FeeHistory'); // <--- THIS LINE IS ESSENTIAL (ensure it's here)
const Complaint = require('../models/Complaint');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const TimerSession = require('../models/TimerSession');
const User = require('../models/User'); // To get fee status (still needed for other parts if applicable, but not for getMyFeeStatus)
const asyncHandler = require('../middleware/asyncHandler');

// --- Study Plan Management ---
// @desc    Get all study plans for the logged-in student
// @route   GET /api/student/plans
// @access  Private (student)
exports.getStudentPlans = asyncHandler(async (req, res) => {
    const plans = await Plan.find({ user: req.user.id });
    res.status(200).json(plans);
});

// @desc    Create a new study plan
// @route   POST /api/student/plans
// @access  Private (student)
exports.createStudentPlan = asyncHandler(async (req, res) => {
    const { title, description, dueDate, completed } = req.body;

    if (!title || !dueDate) {
        res.status(400);
        throw new Error('Title and due date are required for a study plan.');
    }

    const plan = await Plan.create({
        user: req.user.id,
        title,
        description,
        dueDate,
        completed
    });
    res.status(201).json({ message: 'Plan created successfully!', plan });
});

// @desc    Update a study plan
// @route   PUT /api/student/plans/:id
// @access  Private (student)
exports.updateStudentPlan = asyncHandler(async (req, res) => {
    let plan = await Plan.findById(req.params.id);

    if (!plan) {
        res.status(404);
        throw new Error('Plan not found');
    }

    // Make sure user owns the plan
    if (plan.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to update this plan');
    }

    plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ message: 'Plan updated successfully!', plan });
});

// @desc    Delete a study plan
// @route   DELETE /api/student/plans/:id
// @access  Private (student)
exports.deleteStudentPlan = asyncHandler(async (req, res) => {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
        res.status(404);
        throw new Error('Plan not found');
    }

    // Make sure user owns the plan
    if (plan.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this plan');
    }

    await plan.deleteOne();
    res.status(200).json({ message: 'Plan removed' });
});


// --- Assignment Management ---
// @desc    Get all assignments for the logged-in student
// @route   GET /api/student/assignments
// @access  Private (student)
exports.getStudentAssignments = asyncHandler(async (req, res) => {
    const assignments = await Assignment.find({ user: req.user.id });
    res.status(200).json(assignments);
});

// @desc    Create a new assignment
// @route   POST /api/student/assignments
// @access  Private (student)
exports.createStudentAssignment = asyncHandler(async (req, res) => {
    const { title, subject, dueDate, status } = req.body;
    if (!title || !subject || !dueDate) {
        res.status(400);
        throw new Error('Title, subject, and due date are required for an assignment.');
    }
    const assignment = await Assignment.create({
        user: req.user.id,
        title,
        subject,
        dueDate,
        status
    });
    res.status(201).json({ message: 'Assignment created successfully!', assignment });
});

// @desc    Update an assignment
// @route   PUT /api/student/assignments/:id
// @access  Private (student)
exports.updateStudentAssignment = asyncHandler(async (req, res) => {
    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
        res.status(404);
        throw new Error('Assignment not found');
    }

    // Make sure user owns the assignment
    if (assignment.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to update this assignment');
    }

    assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ message: 'Assignment updated successfully!', assignment });
});

// @desc    Delete an assignment
// @route   DELETE /api/student/assignments/:id
// @access  Private (student)
exports.deleteStudentAssignment = asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
        res.status(404);
        throw new Error('Assignment not found');
    }

    // Make sure user owns the assignment
    if (assignment.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this assignment');
    }

    await assignment.deleteOne();
    res.status(200).json({ message: 'Assignment removed' });
});

// --- Exam Management ---
// @desc    Get all exams for the logged-in student
// @route   GET /api/student/exams
// @access  Private (student)
exports.getStudentExams = asyncHandler(async (req, res) => {
    const exams = await Exam.find({ user: req.user.id });
    res.status(200).json(exams);
});

// @desc    Create a new exam entry
// @route   POST /api/student/exams
// @access  Private (student)
exports.createStudentExam = asyncHandler(async (req, res) => {
    const { subject, examDate, notes } = req.body;
    if (!subject || !examDate) {
        res.status(400);
        throw new Error('Subject and exam date are required for an exam entry.');
    }
    const exam = await Exam.create({
        user: req.user.id,
        subject,
        examDate,
        notes
    });
    res.status(201).json({ message: 'Exam created successfully!', exam });
});

// @desc    Update an exam entry
// @route   PUT /api/student/exams/:id
// @access  Private (student)
exports.updateStudentExam = asyncHandler(async (req, res) => {
    let exam = await Exam.findById(req.params.id);

    if (!exam) {
        res.status(404);
        throw new Error('Exam not found');
    }

    // Make sure user owns the exam
    if (exam.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to update this exam');
    }

    exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ message: 'Exam updated successfully!', exam });
});

// @desc    Delete an exam entry
// @route   DELETE /api/student/exams/:id
// @access  Private (student)
exports.deleteStudentExam = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
        res.status(404);
        throw new Error('Exam not found');
    }

    // Make sure user owns the exam
    if (exam.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this exam');
    }

    await exam.deleteOne();
    res.status(200).json({ message: 'Exam removed' });
});

// --- Complaint Management ---
// @desc    Submit a new complaint
// @route   POST /api/student/complaints
// @access  Private (student)
exports.submitComplaint = asyncHandler(async (req, res) => {
    const { subject, message } = req.body;
    if (!subject || !message) {
        res.status(400);
        throw new Error('Subject and message are required for a complaint.');
    }
    const complaint = await Complaint.create({
        userId: req.user.id, // Referencing the user
        subject,
        message,
        status: 'pending' // Default status
    });
    res.status(201).json({ message: 'Complaint submitted successfully!', complaint });
});

// @desc    Get all complaints submitted by the logged-in student
// @route   GET /api/student/complaints/my
// @access  Private (student)
exports.getMyComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(complaints);
});

// --- Attendance Management ---
// @desc    Get attendance records for the logged-in student
// @route   GET /api/student/attendance/my
// @access  Private (student)
exports.getMyAttendance = asyncHandler(async (req, res) => {
    // Sort ascending for chart visualization (oldest data first)
    const attendanceRecords = await Attendance.find({ student: req.user.id }).sort({ date: 1 });

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    const attendanceDays = {}; // Map YYYY-MM-DD to status for calendar dots
    const chartLabels = []; // Labels for the chart (dates)
    const cumulativePercentageData = []; // Data for cumulative percentage chart

    // Calculate cumulative attendance percentage
    for (let i = 0; i < attendanceRecords.length; i++) {
        const record = attendanceRecords[i];
        const dateKey = record.date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        attendanceDays[dateKey] = record.status; // Populate calendar data

        if (record.status.toLowerCase() === 'present') {
            presentCount++;
        } else if (record.status.toLowerCase() === 'absent') {
            absentCount++;
        } else if (record.status.toLowerCase() === 'late') {
            lateCount++;
        }

        const totalDays = presentCount + absentCount + lateCount;
        const currentCumulativePercentage = totalDays > 0 ? ((presentCount / totalDays) * 100) : 0;
        cumulativePercentageData.push(parseFloat(currentCumulativePercentage.toFixed(2))); // Store cumulative percentage
        chartLabels.push(new Date(record.date).toLocaleDateString('en-US')); // Store formatted date for chart label
    }

    const totalDaysOverall = presentCount + absentCount + lateCount;
    const overallPercentage = totalDaysOverall > 0 ? ((presentCount / totalDaysOverall) * 100).toFixed(2) : 0;

    // Example alerts (you can customize these)
    const alerts = [];
    if (absentCount > 0 && totalDaysOverall > 5) { // If some absences after a few days
        alerts.push({ message: `You have ${absentCount} total absences.`, type: 'warning' });
    }
    if (parseFloat(overallPercentage) < 75 && totalDaysOverall > 10) { // If attendance percentage is low
        alerts.push({ message: `Your overall attendance (${overallPercentage}%) is below the recommended 75%.`, type: 'danger' });
    }
    if (lateCount > 0 && totalDaysOverall > 5) {
        alerts.push({ message: `You have ${lateCount} late marks. Please be punctual.`, type: 'info' });
    }

    res.status(200).json({
        percentage: parseFloat(overallPercentage), // Overall percentage
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        chartData: cumulativePercentageData, // Use cumulative data for chart
        chartLabels: chartLabels, // Use formatted dates for chart labels
        attendanceDays: attendanceDays, // For calendar dots
        alerts
    });
});

// @desc    Mark attendance for the logged-in student
// @route   POST /api/student/attendance
// @access  Private (student)
exports.markAttendance = asyncHandler(async (req, res) => {
    const { date, status } = req.body;
    const studentId = req.user.id || req.user._id;

    if (!date || !status) {
        res.status(400);
        throw new Error('Please provide date and status.');
    }

    // Normalize date to start of the day in UTC for consistent checking
    const todayStart = new Date(date);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1); // Next day start UTC

    const existingAttendance = await Attendance.findOne({
        student: studentId,
        date: {
            $gte: todayStart,
            $lt: todayEnd
        }
    });

    if (existingAttendance) {
        res.status(400); // Bad Request
        throw new Error(`Attendance already marked as ${existingAttendance.status} for today.`);
    }

    const attendanceRecord = await Attendance.create({
        student: studentId,
        date: new Date(date), // Store as Date object
        status: status.toLowerCase()
    });

    res.status(201).json({
        success: true,
        message: `Attendance marked as ${status} for ${date}!`,
        attendanceRecord
    });
});


// --- Fee Management ---
// @desc    Get fee history for the logged-in student
// @route   GET /api/student/fees/my
// @access  Private (student)
exports.getMyFeeStatus = asyncHandler(async (req, res) => {
    // MODIFIED: Fetch from FeeHistory model instead of User model
    const feeRecords = await FeeHistory.find({ student: req.user.id }).sort({ date: -1 });

    if (!feeRecords) { // Check if feeRecords is null/undefined (though .find() returns [] if no match)
        res.status(404);
        throw new Error('Fee history not found for this student.');
    }
    res.status(200).json(feeRecords);
});

// --- Timer Sessions ---
// @desc    Get all timer sessions for the logged in user
// @route   GET /api/student/timer/my
// @access  Private (student)
exports.getMyTimerSessions = asyncHandler(async (req, res) => {
    const sessions = await TimerSession.find({ user: req.user.id }).sort({ endTime: -1 });
    res.status(200).json(sessions);
});

// @desc    Add a new timer session
// @route   POST /api/student/timer
// @access  Private (student)
exports.addTimerSession = asyncHandler(async (req, res) => {
    const { title, durationSeconds, startTime, endTime } = req.body;

    if (durationSeconds === undefined || !startTime || !endTime) {
        res.status(400);
        throw new Error('Duration, start time, and end time are required for a timer session.');
    }
    if (isNaN(durationSeconds) || durationSeconds < 0) {
        res.status(400);
        throw new Error('Invalid duration. Must be a non-negative number.');
    }

    const newSession = await TimerSession.create({
        user: req.user.id,
        title: title || 'Untitled Session',
        durationSeconds,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
    });
    res.status(201).json(newSession); // Return the created session
});

// @desc    Delete a timer session
// @route   DELETE /api/student/timer/:id
// @access  Private (student)
exports.deleteTimerSession = asyncHandler(async (req, res) => {
    const session = await TimerSession.findById(req.params.id);

    if (!session) {
        res.status(404);
        throw new Error('Timer session not found');
    }

    if (session.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this session');
    }

    await session.deleteOne();
    res.status(200).json({ message: 'Timer session deleted successfully!' });
});


// --- Announcements for Students ---
// @desc    Get all announcements (for students to view)
// @route   GET /api/student/announcements
// @access  Private (student)
exports.getAnnouncementsForStudents = asyncHandler(async (req, res) => {
    // Fetch announcements, optionally filter by type if needed
    // Sort by creation date, newest first
    const announcements = await Announcement.find({}).sort({ createdAt: -1 }).populate('createdBy', 'name');
    res.status(200).json(announcements);
});
