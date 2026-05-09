// dashboard.js

// BASE URL for your backend API
const BASE_API_URL = 'http://localhost:5000/api'; // Ensure this matches your backend URL

// DOM Elements
const studentNameSpan = document.getElementById('studentName');
const studentRoleSpan = document.getElementById('studentRole');
const studentEmailSpan = document.getElementById('studentEmail');
const logoutBtn = document.getElementById('logoutBtn');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('.main-content .section');

// Overview Elements
const overviewAssignmentsCount = document.getElementById('overview-assignments-count');
const overviewAssignmentsNext = document.getElementById('overview-assignments-next');
const overviewPlansCount = document.getElementById('overview-plans-count');
const overviewPlansNext = document.getElementById('overview-plans-next');
const overviewFeesStatus = document.getElementById('overview-fees-status');
const overviewFeesAmount = document.getElementById('overview-fees-amount');
const overviewAnnouncementsCount = document.getElementById('overview-announcements-count');
const overviewAnnouncementsLatest = document.getElementById('overview-announcements-latest');

// Section List Containers
const plansList = document.getElementById('plansList');
const assignmentsList = document.getElementById('assignmentsList');
const examsList = document.getElementById('examsList');
const complaintsList = document.getElementById('complaintsList');
const attendanceList = document.getElementById('attendanceList');
const announcementsList = document.getElementById('announcementsList');
const timerSessionsList = document.getElementById('timerSessionsList');
const feeStatusCard = document.getElementById('feeStatusCard');
const noFeeInfo = document.getElementById('noFeeInfo');

// Add/Submit Buttons
const addPlanBtn = document.getElementById('addPlanBtn');
const addAssignmentBtn = document.getElementById('addAssignmentBtn');
const addExamBtn = document.getElementById('addExamBtn');
const submitComplaintBtn = document.getElementById('submitComplaintBtn');

// Modals and Forms
const planModal = document.getElementById('planModal');
const planModalTitle = document.getElementById('planModalTitle');
const planForm = document.getElementById('planForm');
const planIdInput = document.getElementById('planId');
const planTitleInput = document.getElementById('planTitle');
const planDescriptionInput = document.getElementById('planDescription');
const planDueDateInput = document.getElementById('planDueDate');
const planCompletedInput = document.getElementById('planCompleted');

const assignmentModal = document.getElementById('assignmentModal');
const assignmentModalTitle = document.getElementById('assignmentModalTitle');
const assignmentForm = document.getElementById('assignmentForm');
const assignmentIdInput = document.getElementById('assignmentId');
const assignmentTitleInput = document.getElementById('assignmentTitle');
const assignmentSubjectInput = document.getElementById('assignmentSubject');
const assignmentDueDateInput = document.getElementById('assignmentDueDate');
const assignmentStatusInput = document.getElementById('assignmentStatus');

const examModal = document.getElementById('examModal');
const examModalTitle = document.getElementById('examModalTitle');
const examForm = document.getElementById('examForm');
const examIdInput = document.getElementById('examId');
const examSubjectInput = document.getElementById('examSubject');
const examDateInput = document.getElementById('examDate');
const examNotesInput = document.getElementById('examNotes');

const complaintModal = document.getElementById('complaintModal');
const complaintForm = document.getElementById('complaintForm');
const complaintSubjectInput = document.getElementById('complaintSubject');
const complaintMessageInput = document.getElementById('complaintMessage');

const closeButtons = document.querySelectorAll('.modal .close-button');

// Timer Elements
const timerDisplay = document.getElementById('timer-display');
const startTimerBtn = document.getElementById('start-timer-btn');
const stopTimerBtn = document.getElementById('stop-timer-btn');
const timerTitleInput = document.getElementById('timer-title-input');

let timerInterval;
let startTime;
let elapsedSeconds = 0;

// --- Helper Functions ---

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function showModal(modalElement) {
    modalElement.style.display = 'flex'; // Use flex to center
}

function hideModal(modalElement) {
    modalElement.style.display = 'none';
    // Reset forms when closing
    modalElement.querySelector('form').reset();
    // Clear hidden ID for edit modes
    const idInput = modalElement.querySelector('input[type="hidden"]');
    if (idInput) idInput.value = '';
    // Uncheck completed for plans/assignments
    if (planCompletedInput) planCompletedInput.checked = false;
    if (assignmentStatusInput) assignmentStatusInput.value = 'pending';
}

function renderEmptyState(container, message) {
    container.innerHTML = `<p class="empty-state">${message}</p>`;
}

function calculateTimeDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
}

// --- Authentication and Initial Load ---

async function checkAuthAndRole() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const userRole = localStorage.getItem('userRole');

    if (!token || !user || userRole !== 'student') {
        alert('Access denied. Please login as a student.');
        window.location.href = 'index.html'; // Redirect to login page
    } else {
        studentNameSpan.textContent = user.name;
        studentRoleSpan.textContent = user.role;
        studentEmailSpan.textContent = user.email;
        fetchOverviewData();
        // Set initial active nav link and show overview section
        navLinks[0].classList.add('active');
        sections[0].style.display = 'block';
    }
}

// --- Navigation ---

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        // Remove 'active' from all links
        navLinks.forEach(l => l.classList.remove('active'));
        // Add 'active' to clicked link
        this.classList.add('active');

        // Hide all sections
        sections.forEach(sec => sec.style.display = 'none');

        // Show the target section
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.style.display = 'block';
            // Fetch data for the section when it becomes active
            switch (targetId) {
                case 'overview': fetchOverviewData(); break;
                case 'study-plans': fetchPlans(); break;
                case 'assignments': fetchAssignments(); break;
                case 'exams': fetchExams(); break;
                case 'complaints': fetchMyComplaints(); break;
                case 'attendance': fetchMyAttendance(); break;
                case 'fees': fetchMyFeeStatus(); break;
                case 'announcements': fetchAnnouncements(); break;
                case 'timer': fetchTimerSessions(); break;
            }
        }
    });
});

// --- Overview Data ---
async function fetchOverviewData() {
    try {
        const [assignmentsRes, plansRes, feesRes, announcementsRes] = await Promise.all([
            fetch(`${BASE_API_URL}/student/assignments`, { headers: getAuthHeaders() }),
            fetch(`${BASE_API_URL}/student/plans`, { headers: getAuthHeaders() }),
            fetch(`${BASE_API_URL}/student/fees/my`, { headers: getAuthHeaders() }),
            fetch(`${BASE_API_URL}/student/announcements`, { headers: getAuthHeaders() }),
        ]);

        const assignmentsData = await assignmentsRes.json();
        const plansData = await plansRes.json();
        const feesData = await feesRes.json();
        const announcementsData = await announcementsRes.json();

        // Assignments Overview
        const pendingAssignments = assignmentsData.filter(a => a.status === 'pending');
        overviewAssignmentsCount.textContent = `${pendingAssignments.length} Pending`;
        const nextAssignment = pendingAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
        overviewAssignmentsNext.textContent = nextAssignment ? `Next: ${nextAssignment.title} (${formatDate(nextAssignment.dueDate)})` : 'None due soon.';

        // Plans Overview
        const pendingPlans = plansData.filter(p => !p.completed);
        overviewPlansCount.textContent = `${pendingPlans.length} Pending`;
        const nextPlan = pendingPlans.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
        overviewPlansNext.textContent = nextPlan ? `Next: ${nextPlan.title} (${formatDate(nextPlan.dueDate)})` : 'None due soon.';

        // Fees Overview
        if (feesRes.ok && feesData) {
            overviewFeesStatus.className = `status ${feesData.status}`;
            overviewFeesStatus.textContent = feesData.status.toUpperCase();
            overviewFeesAmount.textContent = `Amount: ₹${feesData.amount || 0}`;
        } else {
            overviewFeesStatus.textContent = 'N/A';
            overviewFeesAmount.textContent = 'Amount: N/A';
        }

        // Announcements Overview
        overviewAnnouncementsCount.textContent = `${announcementsData.length} Total`;
        const latestAnnouncement = announcementsData[0];
        overviewAnnouncementsLatest.textContent = latestAnnouncement ? `Latest: ${latestAnnouncement.title}` : 'None';

    } catch (error) {
        console.error('Error fetching overview data:', error);
        alert('Failed to load overview data.');
    }
}


// --- Study Plans Management ---
async function fetchPlans() {
    try {
        const res = await fetch(`${BASE_API_URL}/student/plans`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch plans');

        plansList.innerHTML = ''; // Clear previous plans

        if (data.length === 0) {
            renderEmptyState(plansList, 'No study plans yet. Click "Add New Plan" to get started!');
            return;
        }

        data.forEach(plan => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${plan.title}</h4>
                <p>${plan.description || 'No description'}</p>
                <p>Due: ${formatDate(plan.dueDate)}</p>
                <p>Status: <span class="status ${plan.completed ? 'completed' : 'pending'}">${plan.completed ? 'Completed' : 'Pending'}</span></p>
                <div class="card-actions">
                    <button class="action-button edit" data-id="${plan._id}" data-type="plan"><i class="fas fa-edit"></i> Edit</button>
                    <button class="action-button delete" data-id="${plan._id}" data-type="plan"><i class="fas fa-trash-alt"></i> Delete</button>
                </div>
            `;
            plansList.appendChild(card);
        });

        addEventListenersToCrudButtons();

    } catch (error) {
        console.error('Error fetching plans:', error);
        alert('Failed to load study plans: ' + error.message);
    }
}

addPlanBtn.addEventListener('click', () => {
    planModalTitle.textContent = 'Add New Study Plan';
    planForm.reset();
    planIdInput.value = ''; // Ensure no ID for new plan
    showModal(planModal);
});

planForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const planId = planIdInput.value;
    const method = planId ? 'PUT' : 'POST';
    const url = planId ? `${BASE_API_URL}/student/plans/${planId}` : `${BASE_API_URL}/student/plans`;

    const planData = {
        title: planTitleInput.value,
        description: planDescriptionInput.value,
        dueDate: planDueDateInput.value,
        completed: planCompletedInput.checked,
    };

    try {
        const res = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(planData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to save plan');

        alert(data.message);
        hideModal(planModal);
        fetchPlans(); // Re-fetch plans to update the list
        fetchOverviewData(); // Update overview
    } catch (error) {
        console.error('Error saving plan:', error);
        alert('Failed to save study plan: ' + error.message);
    }
});

// --- Assignments Management ---
async function fetchAssignments() {
    try {
        const res = await fetch(`${BASE_API_URL}/student/assignments`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch assignments');

        assignmentsList.innerHTML = '';

        if (data.length === 0) {
            renderEmptyState(assignmentsList, 'No assignments recorded. Time to add some!');
            return;
        }

        data.forEach(assignment => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${assignment.title}</h4>
                <p>Subject: ${assignment.subject}</p>
                <p>Due: ${formatDate(assignment.dueDate)}</p>
                <p>Status: <span class="status ${assignment.status}">${assignment.status.toUpperCase()}</span></p>
                <div class="card-actions">
                    <button class="action-button edit" data-id="${assignment._id}" data-type="assignment"><i class="fas fa-edit"></i> Edit</button>
                    <button class="action-button delete" data-id="${assignment._id}" data-type="assignment"><i class="fas fa-trash-alt"></i> Delete</button>
                </div>
            `;
            assignmentsList.appendChild(card);
        });

        addEventListenersToCrudButtons();

    } catch (error) {
        console.error('Error fetching assignments:', error);
        alert('Failed to load assignments: ' + error.message);
    }
}

addAssignmentBtn.addEventListener('click', () => {
    assignmentModalTitle.textContent = 'Add New Assignment';
    assignmentForm.reset();
    assignmentIdInput.value = '';
    showModal(assignmentModal);
});

assignmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const assignmentId = assignmentIdInput.value;
    const method = assignmentId ? 'PUT' : 'POST';
    const url = assignmentId ? `${BASE_API_URL}/student/assignments/${assignmentId}` : `${BASE_API_URL}/student/assignments`;

    const assignmentData = {
        title: assignmentTitleInput.value,
        subject: assignmentSubjectInput.value,
        dueDate: assignmentDueDateInput.value,
        status: assignmentStatusInput.value,
    };

    try {
        const res = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(assignmentData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to save assignment');

        alert(data.message);
        hideModal(assignmentModal);
        fetchAssignments(); // Re-fetch assignments
        fetchOverviewData(); // Update overview
    } catch (error) {
        console.error('Error saving assignment:', error);
        alert('Failed to save assignment: ' + error.message);
    }
});

// --- Exams Management ---
async function fetchExams() {
    try {
        const res = await fetch(`${BASE_API_URL}/student/exams`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch exams');

        examsList.innerHTML = '';

        if (data.length === 0) {
            renderEmptyState(examsList, 'No exams planned. Stay on top of your schedule!');
            return;
        }

        data.forEach(exam => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${exam.subject} Exam</h4>
                <p>Date: ${formatDate(exam.examDate)}</p>
                <p>Notes: ${exam.notes || 'No notes'}</p>
                <div class="card-actions">
                    <button class="action-button edit" data-id="${exam._id}" data-type="exam"><i class="fas fa-edit"></i> Edit</button>
                    <button class="action-button delete" data-id="${exam._id}" data-type="exam"><i class="fas fa-trash-alt"></i> Delete</button>
                </div>
            `;
            examsList.appendChild(card);
        });

        addEventListenersToCrudButtons();

    } catch (error) {
        console.error('Error fetching exams:', error);
        alert('Failed to load exams: ' + error.message);
    }
}

addExamBtn.addEventListener('click', () => {
    examModalTitle.textContent = 'Add New Exam';
    examForm.reset();
    examIdInput.value = '';
    showModal(examModal);
});

examForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const examId = examIdInput.value;
    const method = examId ? 'PUT' : 'POST';
    const url = examId ? `${BASE_API_URL}/student/exams/${examId}` : `${BASE_API_URL}/student/exams`;

    const examData = {
        subject: examSubjectInput.value,
        examDate: examDateInput.value,
        notes: examNotesInput.value,
    };

    try {
        const res = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(examData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to save exam');

        alert(data.message);
        hideModal(examModal);
        fetchExams(); // Re-fetch exams
    } catch (error) {
        console.error('Error saving exam:', error);
        alert('Failed to save exam: ' + error.message);
    }
});

// --- Complaints Management ---
async function fetchMyComplaints() {
    try {
        const res = await fetch(`${BASE_API_URL}/student/complaints/my`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch complaints');

        complaintsList.innerHTML = '';

        if (data.length === 0) {
            renderEmptyState(complaintsList, 'No complaints submitted. All good!');
            return;
        }

        data.forEach(complaint => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${complaint.subject}</h4>
                <p>${complaint.message}</p>
                <p>Status: <span class="status">${complaint.status.toUpperCase()}</span></p>
                <p>Submitted: ${formatDate(complaint.createdAt)}</p>
            `;
            complaintsList.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        alert('Failed to load complaints: ' + error.message);
    }
}

submitComplaintBtn.addEventListener('click', () => {
    complaintForm.reset();
    showModal(complaintModal);
});

complaintForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const complaintData = {
        subject: complaintSubjectInput.value,
        message: complaintMessageInput.value,
    };

    try {
        const res = await fetch(`${BASE_API_URL}/student/complaints`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(complaintData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to submit complaint');

        alert(data.message);
        hideModal(complaintModal);
        fetchMyComplaints(); // Re-fetch complaints
    } catch (error) {
        console.error('Error submitting complaint:', error);
        alert('Failed to submit complaint: ' + error.message);
    }
});

// --- Attendance Management ---
async function fetchMyAttendance() {
    try {
        const res = await fetch(`${BASE_API_URL}/student/attendance/my`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch attendance');

        attendanceList.innerHTML = '';

        if (data.length === 0) {
            renderEmptyState(attendanceList, 'No attendance records available yet.');
            return;
        }

        data.forEach(record => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>Date: ${formatDate(record.date)}</h4>
                <p>Status: <span class="status ${record.status}">${record.status.toUpperCase()}</span></p>
                <p>Remarks: ${record.remarks || 'N/A'}</p>
            `;
            attendanceList.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        alert('Failed to load attendance records: ' + error.message);
    }
}

// --- Fee Management ---
async function fetchMyFeeStatus() {
    try {
        const res = await fetch(`${BASE_API_URL}/student/fees/my`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch fee status');

        if (!data || Object.keys(data).length === 0) {
            feeStatusCard.style.display = 'none';
            noFeeInfo.style.display = 'block';
            return;
        }

        feeStatusCard.style.display = 'grid'; // Show the card container
        noFeeInfo.style.display = 'none'; // Hide empty state

        document.getElementById('feeStatus').className = `status ${data.status}`;
        document.getElementById('feeStatus').textContent = data.status.toUpperCase();
        document.getElementById('feeAmount').textContent = `₹${data.amount}`;
        document.getElementById('feeLastUpdated').textContent = formatDate(data.lastUpdated);

        fetchOverviewData(); // Update overview
    } catch (error) {
        console.error('Error fetching fee status:', error);
        alert('Failed to load fee status: ' + error.message);
    }
}

// --- Announcements for Students ---
async function fetchAnnouncements() {
    try {
        const res = await fetch(`${BASE_API_URL}/student/announcements`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch announcements');

        announcementsList.innerHTML = '';

        if (data.length === 0) {
            renderEmptyState(announcementsList, 'No announcements at the moment.');
            return;
        }

        data.forEach(announcement => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${announcement.title} <span style="float:right; font-size:0.8em; color:#888;">${announcement.type.toUpperCase()}</span></h4>
                <p>${announcement.message}</p>
                <p>Posted By: ${announcement.createdBy ? announcement.createdBy.name : 'Admin'}</p>
                <p>Date: ${formatDate(announcement.createdAt)}</p>
            `;
            announcementsList.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        alert('Failed to load announcements: ' + error.message);
    }
}

// --- Study Timer ---
function updateTimerDisplay() {
    timerDisplay.textContent = calculateTimeDuration(elapsedSeconds);
}

startTimerBtn.addEventListener('click', () => {
    if (timerInterval) clearInterval(timerInterval); // Clear any existing timer

    startTime = Date.now();
    elapsedSeconds = 0;
    timerTitleInput.disabled = true; // Disable title input once timer starts
    startTimerBtn.style.display = 'none';
    stopTimerBtn.style.display = 'inline-block';

    timerInterval = setInterval(() => {
        elapsedSeconds++;
        updateTimerDisplay();
    }, 1000);
});

stopTimerBtn.addEventListener('click', async () => {
    if (timerInterval) clearInterval(timerInterval);

    const endTime = Date.now();
    const sessionTitle = timerTitleInput.value.trim() || 'Untitled Session';

    try {
        const res = await fetch(`${BASE_API_URL}/student/timer`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                title: sessionTitle,
                durationSeconds: elapsedSeconds,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString()
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to save timer session');

        alert('Timer session saved successfully!');
        // Reset timer display and controls
        elapsedSeconds = 0;
        updateTimerDisplay();
        timerTitleInput.value = '';
        timerTitleInput.disabled = false;
        startTimerBtn.style.display = 'inline-block';
        stopTimerBtn.style.display = 'none';

        fetchTimerSessions(); // Re-fetch timer sessions
    } catch (error) {
        console.error('Error saving timer session:', error);
        alert('Failed to save timer session: ' + error.message);
    }
});

async function fetchTimerSessions() {
    try {
        const res = await fetch(`${BASE_API_URL}/student/timer/my`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch timer sessions');

        timerSessionsList.innerHTML = '';

        if (data.length === 0) {
            renderEmptyState(timerSessionsList, 'No study sessions recorded yet. Start the timer!');
            return;
        }

        data.forEach(session => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${session.title}</h4>
                <p>Duration: ${calculateTimeDuration(session.durationSeconds)}</p>
                <p>Started: ${formatDate(session.startTime)}</p>
                <p>Ended: ${formatDate(session.endTime)}</p>
                <div class="card-actions">
                    <button class="action-button delete" data-id="${session._id}" data-type="timerSession"><i class="fas fa-trash-alt"></i> Delete</button>
                </div>
            `;
            timerSessionsList.appendChild(card);
        });
        addEventListenersToCrudButtons(); // Add event listeners for delete buttons
    } catch (error) {
        console.error('Error fetching timer sessions:', error);
        alert('Failed to load timer sessions: ' + error.message);
    }
}


// --- CRUD Button Event Listeners (Edit/Delete) ---
function addEventListenersToCrudButtons() {
    document.querySelectorAll('.action-button.edit').forEach(button => {
        button.onclick = (e) => handleEdit(e.target.dataset.id, e.target.dataset.type);
    });
    document.querySelectorAll('.action-button.delete').forEach(button => {
        button.onclick = (e) => handleDelete(e.target.dataset.id, e.target.dataset.type);
    });
}

async function handleEdit(id, type) {
    try {
        const res = await fetch(`${BASE_API_URL}/student/${type}s/${id}`, { headers: getAuthHeaders() });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || `Failed to fetch ${type}`);

        switch (type) {
            case 'plan':
                planModalTitle.textContent = 'Edit Study Plan';
                planIdInput.value = data._id;
                planTitleInput.value = data.title;
                planDescriptionInput.value = data.description;
                planDueDateInput.value = new Date(data.dueDate).toISOString().split('T')[0];
                planCompletedInput.checked = data.completed;
                showModal(planModal);
                break;
            case 'assignment':
                assignmentModalTitle.textContent = 'Edit Assignment';
                assignmentIdInput.value = data._id;
                assignmentTitleInput.value = data.title;
                assignmentSubjectInput.value = data.subject;
                assignmentDueDateInput.value = new Date(data.dueDate).toISOString().split('T')[0];
                assignmentStatusInput.value = data.status;
                showModal(assignmentModal);
                break;
            case 'exam':
                examModalTitle.textContent = 'Edit Exam';
                examIdInput.value = data._id;
                examSubjectInput.value = data.subject;
                examDateInput.value = new Date(data.examDate).toISOString().split('T')[0];
                examNotesInput.value = data.notes;
                showModal(examModal);
                break;
            // No edit for complaints, attendance, fees, announcements, timer sessions (only delete)
        }
    } catch (error) {
        console.error(`Error fetching ${type} for edit:`, error);
        alert(`Failed to load ${type} for editing: ` + error.message);
    }
}

async function handleDelete(id, type) {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
        return;
    }

    try {
        const url = `${BASE_API_URL}/student/${type}s/${id}`;
        const res = await fetch(url, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Failed to delete ${type}`);

        alert(data.message);
        // Re-fetch data for the corresponding section
        switch (type) {
            case 'plan': fetchPlans(); break;
            case 'assignment': fetchAssignments(); break;
            case 'exam': fetchExams(); break;
            case 'timerSession': fetchTimerSessions(); break;
        }
        fetchOverviewData(); // Update overview as well
    } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        alert(`Failed to delete ${type}: ` + error.message);
    }
}


// --- Modal Close Buttons ---
closeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) hideModal(modal);
    });
});

window.addEventListener('click', (e) => {
    if (e.target === planModal) hideModal(planModal);
    if (e.target === assignmentModal) hideModal(assignmentModal);
    if (e.target === examModal) hideModal(examModal);
    if (e.target === complaintModal) hideModal(complaintModal);
});

// --- Logout ---
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    alert('You have been logged out.');
    window.location.href = 'index.html';
});

// --- Initialize Dashboard ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndRole();
});

// Initial fetch for the active section (Overview by default)
// No need to call individual fetch functions here, as checkAuthAndRole
// will call fetchOverviewData, and navLinks click handlers will load others.