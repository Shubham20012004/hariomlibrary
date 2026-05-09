// admin-common.js

// Define API Base URL
const BASE_API_URL = 'http://localhost:5000/api/admin'; // Backend Admin API

// --- Helper Functions ---

/**
 * Shows a toast notification.
 * @param {string} message The message to display.
 * @param {string} type 'success', 'error', 'info'.
 */
const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.warn("Toast element not found. Cannot display toast.");
        return;
    }

    toast.textContent = message;
    // Reset classes to ensure no lingering styles
    toast.className = 'fixed bottom-5 right-5 py-3 px-5 rounded-lg shadow-xl text-sm font-semibold opacity-0 translate-y-10 transition-all duration-300';

    if (type === 'success') {
        toast.classList.add('bg-slate-900', 'dark:bg-white', 'text-white', 'dark:text-slate-900');
    } else if (type === 'error') {
        toast.classList.add('bg-red-600', 'dark:bg-red-500', 'text-white');
    } else if (type === 'info') {
        toast.classList.add('bg-blue-600', 'dark:bg-blue-500', 'text-white');
    } else {
        // Default if an unknown type is passed
        toast.classList.add('bg-slate-900', 'dark:bg-white', 'text-white', 'dark:text-slate-900');
    }

    toast.classList.remove('opacity-0', 'translate-y-10');
    toast.classList.add('opacity-100', 'translate-y-0'); // Animate in

    setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-10'); // Animate out
    }, 3000);
};

/**
 * Retrieves admin authentication data from localStorage.
 * Redirects to login if data is missing or invalid.
 * @returns {object|null} An object with token and admin user details, or null if redirection occurs.
 */
function getAdminInfo() {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (!token || !userString || userString === 'undefined' || userString === 'null') {
        console.warn("Admin data or token not found in localStorage. Redirecting to login.");
        if (!window.location.href.includes('index.html')) {
            window.location.href = 'index.html';
        }
        return null;
    }

    try {
        const user = JSON.parse(userString);
        // Basic validation for user object and role
        if (!user || !user._id || !user.email || String(user.role).trim().toLowerCase() !== 'admin') {
            throw new Error("Missing essential admin data or incorrect role in localStorage. Attempting re-login.");
        }
        user.role = String(user.role).trim().toLowerCase(); // Normalize role to lowercase
        return { token, user };
    } catch (e) {
        console.error("Error parsing admin data from localStorage:", e);
        console.warn("Invalid admin data in localStorage. Clearing data and redirecting to login.");
        // Clear all relevant localStorage items on error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('theme');
        if (!window.location.href.includes('index.html')) {
            window.location.href = 'index.html';
        }
        return null;
    }
}

/**
 * Handles API requests, including authentication and error handling.
 * @param {string} endpoint The API endpoint (e.g., '/summary', '/users').
 * @param {string} method HTTP method (e.g., 'GET', 'POST', 'DELETE', 'PUT').
 * @param {object} data Optional: data to send in the request body for POST/PUT.
 * @returns {Promise<object>} The JSON response from the API.
 */
async function makeApiRequest(endpoint, method = 'GET', data = null) {
    const adminAuth = getAdminInfo();
    if (!adminAuth) {
        // getAdminInfo already handles redirection and console logs
        return Promise.reject(new Error("Authentication required."));
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminAuth.token}`
    };

    const requestOptions = {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
    };

    try {
        const response = await fetch(`${BASE_API_URL}${endpoint}`, requestOptions);

        if (!response.ok) {
            let errorDetail = `API Error: ${response.status} ${response.statusText}`;
            try {
                // Try to parse JSON error message from backend
                const errorData = await response.json();
                errorDetail = errorData.message || errorDetail;
                console.error(`API Error Details for ${endpoint}:`, errorData);
            } catch (e) {
                // If response is not JSON or parsing fails, get text
                const responseText = await response.text();
                errorDetail = `${errorDetail}. Response: ${responseText.substring(0, Math.min(responseText.length, 200))}...`;
                console.error(`API Error - Non-JSON Response for ${endpoint}:`, responseText);
            }

            if (response.status === 401 || response.status === 403) {
                showToast(errorDetail || 'Session expired or unauthorized. Please log in again.', 'error');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('theme');
                    window.location.href = 'index.html'; // Redirect to login
                }, 1500);
            } else {
                showToast(errorDetail, 'error'); // Show general API errors
            }
            throw new Error(errorDetail); // Propagate the error
        }

        // Handle 204 No Content for successful PUT/DELETE
        if (response.status === 204) {
            return { message: "Operation successful", status: 204 };
        }

        // Check content type before parsing JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            const textResult = await response.text();
            console.warn(`Non-JSON response from ${endpoint}:`, textResult);
            return textResult; // Return text if not JSON
        }

    } catch (error) {
        console.error(`Network or API Request Failed for ${endpoint}:`, error);
        // More user-friendly error for network issues (e.g., server down, CORS)
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            showToast('Network error. Is the backend server running and reachable? (Check CORS configuration)', 'error');
            throw new Error('Network error: Could not connect to the API. ' + error.message);
        } else if (!error.message.includes('Session expired')) {
            // Avoid showing redundant toast if already handled by 401/403 block
            showToast(error.message || 'An unexpected error occurred.', 'error');
        }
        throw error; // Re-throw to be caught by specific UI update functions
    }
}

// Global variable to store confirmation action for modularity
let currentConfirmAction = null;

/**
 * Shows a custom confirmation modal.
 * @param {string} message The message to display in the modal.
 * @param {Function} onConfirmCallback The callback function to execute if 'Yes' is clicked.
 */
function showCustomConfirm(message, onConfirmCallback) {
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    if (!confirmModal || !confirmMessage) {
        console.error("Confirmation modal elements not found in showCustomConfirm.");
        showToast("Confirmation modal error. Check console.", "error");
        return;
    }
    confirmMessage.textContent = message;
    confirmModal.classList.remove('hidden');
    currentConfirmAction = onConfirmCallback;
}

/**
 * Hides the custom confirmation modal.
 */
function hideCustomConfirm() {
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
        confirmModal.classList.add('hidden');
    }
    currentConfirmAction = null;
}

/**
 * Sets a loading state in a table body.
 * @param {HTMLElement} tableBodyElement The tbody element to update.
 * @param {string} message The loading message to display.
 * @param {number} colspan The number of columns to span.
 */
function setLoadingState(tableBodyElement, message, colspan = 7) {
    tableBodyElement.innerHTML = `<tr><td colspan="${colspan}" class="text-center py-4 text-slate-500 dark:text-slate-400">
        <div class="flex items-center justify-center space-x-2">
            <div class="loader"></div> <span>${message}</span>
        </div>
    </td></tr>`;
}

/**
 * Displays a message within a form or modal.
 * @param {HTMLElement} element The element to display the message in.
 * @param {string} msg The message text.
 * @param {'success'|'error'|'info'} type The type of message for styling.
 */
function showFormMessage(element, msg, type) {
    element.textContent = msg;
    element.classList.remove('hidden', 'text-green-600', 'text-red-600', 'text-blue-600', 'dark:text-green-400', 'dark:text-red-400', 'dark:text-blue-400');
    if (type === 'success') { element.classList.add('text-green-600', 'dark:text-green-400'); }
    else if (type === 'error') { element.classList.add('text-red-600', 'dark:text-red-400'); }
    else if (type === 'info') { element.classList.add('text-blue-600', 'dark:text-blue-400'); }
    element.classList.remove('hidden');
    setTimeout(() => { element.classList.add('hidden'); element.textContent = ''; }, 3000);
}

/**
 * Clears any message displayed within a form or modal.
 * @param {HTMLElement} element The element whose message to clear.
 */
function clearFormMessage(element) {
    element.classList.add('hidden');
    element.textContent = '';
}


// --- Main DOMContentLoaded Listener for common functionalities ---
document.addEventListener('DOMContentLoaded', () => {
    // Select DOM elements inside DOMContentLoaded to ensure they exist
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    const logoutBtn = document.getElementById('logoutBtn');

    const confirmYesBtn = document.getElementById('confirmYesBtn');
    const confirmNoBtn = document.getElementById('confirmNoBtn');
    const confirmModal = document.getElementById('confirmModal'); // Added to handle backdrop click

    // Attach listeners for modal buttons
    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', () => {
            if (currentConfirmAction) {
                currentConfirmAction();
            }
            hideCustomConfirm();
        });
    }

    if (confirmNoBtn) {
        confirmNoBtn.addEventListener('click', () => {
            hideCustomConfirm();
        });
    }

    // Close modal on backdrop click
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                hideCustomConfirm();
            }
        });
    }


    // Set initial theme
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
        if (themeToggleDarkIcon) themeToggleDarkIcon.classList.remove('hidden');
        if (themeToggleLightIcon) themeToggleLightIcon.classList.add('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        if (themeToggleDarkIcon) themeToggleDarkIcon.classList.add('hidden');
        if (themeToggleLightIcon) themeToggleLightIcon.classList.remove('hidden');
    }

    // Add theme toggle event listener
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            if (document.documentElement.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
                if (themeToggleDarkIcon) themeToggleDarkIcon.classList.remove('hidden');
                if (themeToggleLightIcon) themeToggleLightIcon.classList.add('hidden');
            } else {
                localStorage.setItem('theme', 'light');
                if (themeToggleDarkIcon) themeToggleDarkIcon.classList.add('hidden');
                if (themeToggleLightIcon) themeToggleLightIcon.classList.remove('hidden');
            }
        });
    }

    // Logout functionality (also common)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showCustomConfirm('Are you sure you want to log out?', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');
                localStorage.removeItem('theme');
                showToast('You have been logged out.', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html'; // Redirect to login page
                }, 1000);
            });
        });
    }

    // Expose common functions globally if needed by other scripts
    // It's generally better to use modules, but for simple scripts or if you're loading
    // this file via <script> tags, exposing them can be necessary.
    window.showToast = showToast;
    window.getAdminInfo = getAdminInfo;
    window.makeApiRequest = makeApiRequest;
    window.showCustomConfirm = showCustomConfirm;
    window.hideCustomConfirm = hideCustomConfirm;
    window.setLoadingState = setLoadingState;
    window.showFormMessage = showFormMessage;
    window.clearFormMessage = clearFormMessage;
});