/**
 * Frontend Login Integration Script
 *
 * Handles form submission, backend API communication, session management,
 * and error handling for the login form.
 */

// Configuration
const CONFIG = {
    // Default backend URL - can be overridden by environment variable
    BACKEND_URL: localStorage.getItem('backendUrl') || 'http://localhost:3000',
    LOGIN_ENDPOINT: '/5-auth/login/',
    SESSION_ENDPOINT: '/5-auth/session/',
    // Redirect paths after successful login
    USER_DASHBOARD: './',
    ADMIN_DASHBOARD: './admin/',
};

/**
 * Initialize the login form on page load
 */
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // Check if user is already logged in
    checkExistingSession();
});

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
async function handleLoginSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const keepLogged = document.getElementById('keepLogged').checked;
    const submitBtn = document.getElementById('submitBtn');

    // Validate inputs
    if (!username || !password) {
        showAlert('error', '⚠️ Validation Error', 'Please enter both username and password');
        return;
    }

    // Disable submit button to prevent duplicate submissions
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.LOGIN_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include', // Include cookies for session management
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (data.success) {
            // Store session information if needed
            if (keepLogged) {
                localStorage.setItem('lastUsername', username);
                localStorage.setItem('keepLogged', 'true');
            }

            // Show success message
            showAlert('success', data.title || '✅ Success!', data.message || 'Login successful!');

            // Redirect after brief delay
            setTimeout(() => {
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    window.location.href = CONFIG.USER_DASHBOARD;
                }
            }, 1500);
        } else {
            // Show error message
            showAlert('error', data.title || '❌ Login Failed', data.message || 'Invalid credentials');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Go !';
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('error', '❌ Network Error', 'Failed to connect to the server. Please check the backend URL and try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Go !';
    }
}

/**
 * Check if user already has an active session
 */
async function checkExistingSession() {
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.SESSION_ENDPOINT}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.loggedin) {
                // User is already logged in, redirect to dashboard
                const role = data.user?.role || 'user';
                const redirectUrl = role === 'admin' ? CONFIG.ADMIN_DASHBOARD : CONFIG.USER_DASHBOARD;
                window.location.href = redirectUrl;
            }
        }
    } catch (error) {
        console.warn('Session check failed:', error);
        // Continue showing login form if session check fails
    }
}

/**
 * Display alert using SweetAlert2
 * @param {string} icon - Alert icon type (success, error, warning, info)
 * @param {string} title - Alert title
 * @param {string} text - Alert message
 */
function showAlert(icon, title, text) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonText: 'OK',
        allowOutsideClick: icon === 'success' ? false : true,
        allowEscapeKey: icon === 'success' ? false : true
    });
}

/**
 * Set custom backend URL (useful for testing different environments)
 * @param {string} url - Backend URL
 */
function setBackendUrl(url) {
    CONFIG.BACKEND_URL = url;
    localStorage.setItem('backendUrl', url);
}

/**
 * Get current backend URL
 * @returns {string} Current backend URL
 */
function getBackendUrl() {
    return CONFIG.BACKEND_URL;
}
