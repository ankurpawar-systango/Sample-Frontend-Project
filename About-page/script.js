/**
 * About Page Script
 *
 * Handles user session display, cookie consent banner,
 * and page initialization for the About page.
 *
 * Features:
 * - User authentication check
 * - Username and email display
 * - Cookie consent management
 * - Granular cookie preference controls
 * - Authentication-only access
 */

// Configuration
const CONFIG = {
    // Default backend URL - can be overridden by environment variable
    BACKEND_URL: localStorage.getItem('backendUrl') || 'http://localhost:3000',
    SESSION_ENDPOINT: '/5-auth/session/',
    LOGIN_PAGE: '../Responsive login form/',
    // Cookie preferences storage key
    COOKIE_PREFS_KEY: 'cookiePreferences'
};

/**
 * Initialize the About page on load
 */
document.addEventListener('DOMContentLoaded', function () {
    checkUserSession();
    initializeCookieConsent();
    setupEventListeners();
});

/**
 * Setup event listeners for cookie preference controls
 */
function setupEventListeners() {
    const updateBtn = document.getElementById('updateCookiePrefs');
    const saveBtn = document.getElementById('saveCookiePrefs');
    const manageCookiesBtn = document.getElementById('manageCookies');
    const logoutBtn = document.getElementById('logoutBtn');
    const viewCookieSettingsBtn = document.getElementById('viewCookieSettings');
    const dismissNotifBtn = document.getElementById('dismissCookieNotif');

    if (updateBtn) {
        updateBtn.addEventListener('click', toggleCookiePreferences);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveCookiePreferences);
    }

    if (manageCookiesBtn) {
        manageCookiesBtn.addEventListener('click', function() {
            document.getElementById('cookieBanner').classList.add('hidden');
            scrollToCookieSection();
            toggleCookiePreferences();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (viewCookieSettingsBtn) {
        viewCookieSettingsBtn.addEventListener('click', function() {
            dismissCookieNotification();
            scrollToCookieSection();
            toggleCookiePreferences();
        });
    }

    if (dismissNotifBtn) {
        dismissNotifBtn.addEventListener('click', dismissCookieNotification);
    }
}

/**
 * Toggle visibility of cookie preference controls
 */
function toggleCookiePreferences() {
    const prefsDiv = document.getElementById('cookiePreferences');
    if (prefsDiv) {
        prefsDiv.style.display = prefsDiv.style.display === 'none' ? 'block' : 'none';
        if (prefsDiv.style.display === 'block') {
            loadCookiePreferences();
        }
    }
}

/**
 * Load saved cookie preferences from storage
 */
function loadCookiePreferences() {
    const saved = localStorage.getItem(CONFIG.COOKIE_PREFS_KEY);
    if (saved) {
        try {
            const prefs = JSON.parse(saved);
            document.getElementById('performanceCookies').checked = prefs.performance || false;
            document.getElementById('preferenceCookies').checked = prefs.preferences || false;
        } catch (e) {
            console.error('Error loading cookie preferences:', e);
        }
    }
}

/**
 * Save cookie preferences to storage
 */
function saveCookiePreferences() {
    const prefs = {
        essential: true, // Always true
        performance: document.getElementById('performanceCookies').checked,
        preferences: document.getElementById('preferenceCookies').checked,
        date: new Date().toISOString()
    };

    localStorage.setItem(CONFIG.COOKIE_PREFS_KEY, JSON.stringify(prefs));
    localStorage.setItem('cookieConsent', 'custom');
    showAlert('success', 'Preferences Saved', 'Your cookie preferences have been saved.');
    toggleCookiePreferences();
}

/**
 * Dismiss the cookie notification for logged-in users
 */
function dismissCookieNotification() {
    const notification = document.getElementById('cookieNotification');
    if (notification) {
        notification.style.animation = 'slideUpNotif 0.3s ease-in';
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 300);
        // Store dismissal in localStorage to not show again this session
        localStorage.setItem('cookieNotificationDismissed', 'true');
    }
}

/**
 * Show the cookie notification for logged-in users
 * Only shows if not previously dismissed in this session
 */
function showCookieNotification() {
    const dismissed = localStorage.getItem('cookieNotificationDismissed');
    const notification = document.getElementById('cookieNotification');

    if (!dismissed && notification) {
        notification.style.display = 'block';
    }
}

/**
 * Scroll to cookie consent section
 */
function scrollToCookieSection() {
    const section = document.querySelector('.cookie-consent-section');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

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
    const userEmail = document.getElementById('userEmail');
    const userInfoSection = document.getElementById('userInfoSection');

    if (userInfoSection && user.username) {
        userInfoSection.style.display = 'block';

        if (userGreeting) {
            userGreeting.textContent = user.username || 'User';
        }

        if (userEmail && user.email) {
            userEmail.textContent = user.email;
        }

        // Update avatar with first letter
        const avatar = document.getElementById('userAvatar');
        if (avatar && user.username) {
            avatar.textContent = user.username.charAt(0).toUpperCase();
        }

        // Show cookie notification for logged-in users
        showCookieNotification();
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

    // Also hide the cookie banner and any other content
    const cookieBanner = document.getElementById('cookieBanner');
    if (cookieBanner) {
        cookieBanner.style.display = 'none';
    }
}

/**
 * Initialize cookie consent banner
 * Shows banner only for first-time visitors who haven't made a choice
 */
function initializeCookieConsent() {
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('acceptCookies');
    const declineBtn = document.getElementById('declineCookies');

    if (!cookieBanner) return;

    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');

    if (cookieConsent) {
        // User has already made a choice, hide banner
        cookieBanner.classList.add('hidden');
    } else {
        // Show banner for first time visitors
        cookieBanner.classList.remove('hidden');
    }

    // Handle accept button - accept all cookies
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function () {
            const allCookies = {
                essential: true,
                performance: true,
                preferences: true,
                date: new Date().toISOString()
            };
            localStorage.setItem(CONFIG.COOKIE_PREFS_KEY, JSON.stringify(allCookies));
            localStorage.setItem('cookieConsent', 'accepted');
            localStorage.setItem('cookieConsentDate', new Date().toISOString());
            hideCookieBanner();
            showAlert('success', 'Thank You!', 'You have accepted our cookie policy.');
        });
    }

    // Handle decline button - accept only essential cookies
    if (declineBtn) {
        declineBtn.addEventListener('click', function () {
            const essentialOnly = {
                essential: true,
                performance: false,
                preferences: false,
                date: new Date().toISOString()
            };
            localStorage.setItem(CONFIG.COOKIE_PREFS_KEY, JSON.stringify(essentialOnly));
            localStorage.setItem('cookieConsent', 'declined');
            localStorage.setItem('cookieConsentDate', new Date().toISOString());
            hideCookieBanner();
            showAlert('info', 'Understood', 'You have declined optional cookies. Essential cookies are still used for basic functionality.');
        });
    }
}

/**
 * Hide the cookie banner with animation
 */
function hideCookieBanner() {
    const cookieBanner = document.getElementById('cookieBanner');
    if (cookieBanner) {
        cookieBanner.style.animation = 'slideDownBanner 0.3s ease-in';
        setTimeout(() => {
            cookieBanner.classList.add('hidden');
        }, 300);
    }
}

/**
 * Display alert using SweetAlert2
 * @param {string} icon - Alert icon type (success, error, warning, info)
 * @param {string} title - Alert title
 * @param {string} text - Alert message
 */
function showAlert(icon, title, text) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: icon,
            title: title,
            text: text,
            confirmButtonColor: '#667eea',
            timer: 2500,
            timerProgressBar: true,
            allowOutsideClick: true,
            allowEscapeKey: true
        });
    } else {
        // Fallback to console log if SweetAlert is not available
        console.log(`${icon.toUpperCase()}: ${title} - ${text}`);
    }
}

/**
 * Handle logout - clears session and redirects to login
 */
function handleLogout(e) {
    if (e) {
        e.preventDefault();
    }

    // Clear all session-related data
    localStorage.removeItem('userData');
    localStorage.removeItem('sessionToken');
    sessionStorage.clear();

    // Show logout message
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'Logged Out',
            text: 'You have been successfully logged out.',
            confirmButtonColor: '#667eea',
            timer: 1500,
            timerProgressBar: true,
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then(() => {
            window.location.href = CONFIG.LOGIN_PAGE;
        });
    } else {
        // Fallback if SweetAlert is not available
        window.location.href = CONFIG.LOGIN_PAGE;
    }
}

// Add animations for cookie banner and notification
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDownBanner {
        from {
            transform: translateY(0);
        }
        to {
            transform: translateY(100%);
        }
    }

    @keyframes slideUpNotif {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);
