/**
 * About Page Script
 *
 * Handles user session display, cookie consent banner,
 * and page initialization for the About page.
 */

// Configuration
const CONFIG = {
    // Default backend URL - can be overridden by environment variable
    BACKEND_URL: localStorage.getItem('backendUrl') || 'http://localhost:3000',
    SESSION_ENDPOINT: '/5-auth/session/',
    LOGIN_PAGE: '../Responsive login form/',
};

/**
 * Initialize the About page on load
 */
document.addEventListener('DOMContentLoaded', function () {
    checkUserSession();
    initializeCookieConsent();
});

/**
 * Check if user is logged in and display their username
 */
async function checkUserSession() {
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
            if (data.success && data.loggedin && data.user) {
                displayUserInfo(data.user);
            } else {
                showLoginRequired();
            }
        } else {
            showLoginRequired();
        }
    } catch (error) {
        console.error('Session check failed:', error);
        showLoginRequired();
    }
}

/**
 * Display logged-in user information
 * @param {Object} user - User object containing username and other info
 */
function displayUserInfo(user) {
    const userGreeting = document.getElementById('userGreeting');
    const userInfoSection = document.getElementById('userInfoSection');

    if (userGreeting && user.username) {
        const username = user.username;
        userGreeting.textContent = `Welcome, ${username}! 👋`;
        userInfoSection.style.display = 'block';
    }
}

/**
 * Show login required message when user is not authenticated
 */
function showLoginRequired() {
    const aboutContainer = document.querySelector('.about-container');

    if (aboutContainer) {
        const existingContent = aboutContainer.querySelector('.about-content');
        if (existingContent) {
            existingContent.remove();
        }

        const loginRequired = document.createElement('div');
        loginRequired.className = 'login-required';
        loginRequired.innerHTML = `
            <p>You must be logged in to view this page.</p>
            <a href="${CONFIG.LOGIN_PAGE}">Go to Login</a>
        `;

        aboutContainer.appendChild(loginRequired);
    }
}

/**
 * Initialize cookie consent banner
 */
function initializeCookieConsent() {
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('acceptCookies');
    const declineBtn = document.getElementById('declineCookies');

    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');

    if (cookieConsent) {
        // User has already made a choice, hide banner
        cookieBanner.classList.add('hidden');
    } else {
        // Show banner for first time visitors
        cookieBanner.classList.remove('hidden');
    }

    // Handle accept button
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function () {
            localStorage.setItem('cookieConsent', 'accepted');
            localStorage.setItem('cookieConsentDate', new Date().toISOString());
            hideCookieBanner();
            showAlert('success', 'Thank You!', 'You have accepted our cookie policy.');
        });
    }

    // Handle decline button
    if (declineBtn) {
        declineBtn.addEventListener('click', function () {
            localStorage.setItem('cookieConsent', 'declined');
            localStorage.setItem('cookieConsentDate', new Date().toISOString());
            hideCookieBanner();
            showAlert('info', 'Understood', 'You have declined cookies. Some features may not work optimally.');
        });
    }
}

/**
 * Hide the cookie banner
 */
function hideCookieBanner() {
    const cookieBanner = document.getElementById('cookieBanner');
    if (cookieBanner) {
        cookieBanner.classList.add('hidden');
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
        confirmButtonColor: '#667eea',
        timer: 2000,
        timerProgressBar: true
    });
}

/**
 * Handle logout
 */
function handleLogout() {
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            // Clear session data if any
            localStorage.removeItem('userData');
            // Redirect to login page
            window.location.href = CONFIG.LOGIN_PAGE;
        });
    }
}

// Initialize logout handler
document.addEventListener('DOMContentLoaded', handleLogout);
