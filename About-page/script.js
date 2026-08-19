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
 * - Cookie segregation by consent level (DL-1)
 */

// Configuration
const CONFIG = {
    // Default backend URL - can be overridden by environment variable
    BACKEND_URL: localStorage.getItem('backendUrl') || 'http://localhost:3000',
    SESSION_ENDPOINT: '/5-auth/session/',
    COOKIE_CONSENT_ENDPOINT: '/8-about-me/cookie-consent.php',
    LOGIN_PAGE: '../Responsive login form/',
    // Cookie preferences storage key
    COOKIE_PREFS_KEY: 'cookiePreferences'
};

/**
 * Cookie Categories for segregation
 * @readonly
 * @enum {string}
 */
const COOKIE_CATEGORY = {
    ESSENTIAL: 'essential',
    PERFORMANCE: 'performance',
    PREFERENCES: 'preferences'
};

/**
 * Get the current consent level from localStorage
 * @returns {Object} The user's consent preferences
 */
function getConsentLevel() {
    const saved = localStorage.getItem(CONFIG.COOKIE_PREFS_KEY);
    if (saved) {
        try {
            const prefs = JSON.parse(saved);
            return {
                essential: true, // Always true
                performance: prefs.performance || false,
                preferences: prefs.preferences || false
            };
        } catch (e) {
            console.error('Error parsing cookie preferences:', e);
        }
    }
    // Default: only essential cookies allowed
    return {
        essential: true,
        performance: false,
        preferences: false
    };
}

/**
 * Check if a cookie of a specific category can be set based on user consent
 * @param {string} category - The cookie category (essential, performance, preferences)
 * @returns {boolean} True if the cookie can be set, false otherwise
 */
function canSetCookie(category) {
    const consent = getConsentLevel();

    // Essential cookies are always allowed
    if (category === COOKIE_CATEGORY.ESSENTIAL) {
        return true;
    }

    // Performance cookies require explicit consent
    if (category === COOKIE_CATEGORY.PERFORMANCE) {
        return consent.performance === true;
    }

    // Preference cookies require explicit consent
    if (category === COOKIE_CATEGORY.PREFERENCES) {
        return consent.preferences === true;
    }

    // Unknown category - deny by default
    console.warn(`Unknown cookie category: ${category}`);
    return false;
}

/**
 * Set a cookie with consent validation
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {string} category - Cookie category (essential, performance, preferences)
 * @param {Object} options - Additional cookie options (expires, path, etc.)
 * @returns {boolean} True if cookie was set, false if denied due to consent
 */
function setCookieWithConsent(name, value, category, options = {}) {
    if (!canSetCookie(category)) {
        console.log(`Cookie "${name}" not set: consent for "${category}" not given`);
        showConsentRequiredFeedback(category);
        return false;
    }

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.expires) {
        const date = new Date();
        date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${date.toUTCString()}`;
    }

    cookieString += `; path=${options.path || '/'}`;

    if (options.secure) {
        cookieString += '; secure';
    }

    if (options.sameSite) {
        cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
    return true;
}

/**
 * Get a cookie value with consent validation
 * @param {string} name - Cookie name
 * @param {string} category - Cookie category (essential, performance, preferences)
 * @returns {string|null} Cookie value or null if not found or consent not given
 */
function getCookieWithConsent(name, category) {
    if (!canSetCookie(category)) {
        console.log(`Cookie "${name}" not accessible: consent for "${category}" not given`);
        return null;
    }

    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length));
        }
    }

    return null;
}

/**
 * Delete a cookie
 * @param {string} name - Cookie name
 * @param {string} path - Cookie path
 */
function deleteCookie(name, path = '/') {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
}

/**
 * Show feedback when consent is required but not given
 * @param {string} category - The required cookie category
 */
function showConsentRequiredFeedback(category) {
    const categoryNames = {
        [COOKIE_CATEGORY.PERFORMANCE]: 'Performance',
        [COOKIE_CATEGORY.PREFERENCES]: 'Preference'
    };

    const categoryName = categoryNames[category] || category;

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'info',
            title: 'Consent Required',
            text: `${categoryName} cookies require your consent. Please update your cookie preferences to enable this feature.`,
            confirmButtonColor: '#667eea',
            showCancelButton: true,
            confirmButtonText: 'Update Preferences',
            cancelButtonText: 'Not Now'
        }).then((result) => {
            if (result.isConfirmed) {
                scrollToCookieSection();
                toggleCookiePreferences();
            }
        });
    } else {
        console.log(`${categoryName} cookies require consent to be enabled.`);
    }
}

/**
 * Validate consent with backend before cookie operations
 * Checks both local and server-side consent state
 *
 * DL-5: Enhanced to properly validate against server consent state
 * @param {string} category - Cookie category to validate
 * @returns {Promise<Object>} Validation result from backend
 */
async function validateConsentWithBackend(category) {
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.COOKIE_CONSENT_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                action: 'validate',
                consent_level: category
            })
        });

        const result = await response.json();

        if (response.ok) {
            console.log(`DL-5: Backend consent validation passed for ${category}`);
            return result;
        } else if (response.status === 403) {
            console.warn(`DL-5: Backend consent validation failed for ${category}: ${result.message}`);
            showConsentRequiredFeedback(category);
            return { status: 'error', message: result.message, allowed: false };
        }

        console.error('DL-5: Consent validation error:', result.message);
        return { status: 'error', message: 'Validation failed', allowed: false };
    } catch (error) {
        console.error('DL-5: Backend consent validation failed:', error);
        // Fall back to local validation only
        const localAllow = canSetCookie(category);
        console.log(`DL-5: Falling back to local validation for ${category}: ${localAllow}`);
        return { status: 'success', allowed: localAllow };
    }
}

/**
 * Sync cookie preferences with backend
 * @param {Object} prefs - Cookie preferences object
 * @returns {Promise<boolean>} True if sync successful
 */
async function syncPreferencesWithBackend(prefs) {
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.COOKIE_CONSENT_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                action: 'save',
                essential: prefs.essential,
                performance: prefs.performance,
                preferences: prefs.preferences
            })
        });

        return response.ok;
    } catch (error) {
        console.error('Failed to sync preferences with backend:', error);
        return false;
    }
}

/**
 * Initialize the About page on load
 *
 * DL-5: Enhanced initialization with backend sync on page load
 */
document.addEventListener('DOMContentLoaded', function () {
    checkUserSession();
    initializeCookieConsent();
    setupEventListeners();

    // DL-5: Sync current preferences to backend on page load for consistency
    syncCurrentPreferencesToBackend();
});

/**
 * DL-5: Sync current frontend preferences to backend on page load
 * Ensures backend and frontend consent state are in sync
 */
async function syncCurrentPreferencesToBackend() {
    const prefs = getConsentLevel();

    // Only sync if we have stored preferences
    const stored = localStorage.getItem(CONFIG.COOKIE_PREFS_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            const synced = await syncPreferencesWithBackend(parsed);
            if (synced) {
                console.log('DL-5: Preferences synced to backend on page load');
            }
        } catch (e) {
            console.error('DL-5: Error syncing preferences on page load:', e);
        }
    }
}

/**
 * Setup event listeners for cookie preference controls
 */
function setupEventListeners() {
    const updateBtn = document.getElementById('updateCookiePrefs');
    const saveBtn = document.getElementById('saveCookiePrefs');
    const cancelBtn = document.getElementById('cancelCookiePrefs');
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

    if (cancelBtn) {
        cancelBtn.addEventListener('click', toggleCookiePreferences);
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
 * Save cookie preferences to storage and sync with backend
 *
 * DL-5: Enhanced with better sync and error handling
 */
async function saveCookiePreferences() {
    const prefs = {
        essential: true, // Always true
        performance: document.getElementById('performanceCookies').checked,
        preferences: document.getElementById('preferenceCookies').checked,
        date: new Date().toISOString()
    };

    // Save to localStorage immediately
    localStorage.setItem(CONFIG.COOKIE_PREFS_KEY, JSON.stringify(prefs));
    localStorage.setItem('cookieConsent', 'custom');

    // Clean up cookies that are no longer consented
    // This happens BEFORE backend sync to ensure immediate client-side enforcement
    cleanupNonConsentedCookies(prefs);
    console.log('DL-5: Preferences updated locally and cookies cleaned up:', prefs);

    // Sync with backend - persists to server session
    const synced = await syncPreferencesWithBackend(prefs);
    if (synced) {
        showAlert('success', 'Preferences Saved', 'Your cookie preferences have been saved and synced with the server.');
        console.log('DL-5: Preferences successfully synced to backend');
    } else {
        showAlert('warning', 'Partial Save', 'Your cookie preferences have been saved locally. Server sync will retry.');
        console.warn('DL-5: Backend sync failed, preferences saved locally only');
    }

    toggleCookiePreferences();
}

/**
 * Clean up cookies that user has revoked consent for
 * Immediately deletes cookies when user revokes consent for a category
 *
 * DL-5: Enhanced cleanup with comprehensive cookie enumeration
 * @param {Object} prefs - Current cookie preferences
 */
function cleanupNonConsentedCookies(prefs) {
    // List of known non-essential cookies to clean up
    const performanceCookies = [
        '_ga', '_gid', '_analytics',
        '_gat', '_gat_gtag_*', 'ga_*',
        '__utma', '__utmb', '__utmc', '__utmz', '__utmv',
        'analytics', 'analytics_session'
    ];
    const preferenceCookies = [
        '_theme', '_language', '_preferences',
        'theme_preference', 'language_setting', 'user_preferences',
        'ui_preferences', 'display_preferences'
    ];

    // Clean up performance cookies if user revoked consent
    if (!prefs.performance) {
        performanceCookies.forEach(name => {
            deleteCookie(name);
            deleteCookie(name, '/');
        });
        console.log('DL-5: Cleaned up performance tracking cookies');
    }

    // Clean up preference cookies if user revoked consent
    if (!prefs.preferences) {
        preferenceCookies.forEach(name => {
            deleteCookie(name);
            deleteCookie(name, '/');
        });
        console.log('DL-5: Cleaned up preference cookies');
    }

    // Also scan for any cookies with tracking-related names
    const allCookies = document.cookie.split(';');
    allCookies.forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim();

        // Check if this is a performance cookie and user didn't consent
        if (!prefs.performance && isPerformanceCookie(cookieName)) {
            deleteCookie(cookieName);
        }

        // Check if this is a preference cookie and user didn't consent
        if (!prefs.preferences && isPreferenceCookie(cookieName)) {
            deleteCookie(cookieName);
        }
    });
}

/**
 * DL-5: Determine if a cookie name indicates it's a performance/tracking cookie
 * @param {string} name - Cookie name
 * @returns {boolean} True if likely a performance cookie
 */
function isPerformanceCookie(name) {
    const perfIndicators = ['analytics', 'ga', 'utm', 'tracking', 'track', 'metric'];
    return perfIndicators.some(indicator => name.toLowerCase().includes(indicator));
}

/**
 * DL-5: Determine if a cookie name indicates it's a preference cookie
 * @param {string} name - Cookie name
 * @returns {boolean} True if likely a preference cookie
 */
function isPreferenceCookie(name) {
    const prefIndicators = ['theme', 'preference', 'language', 'setting', 'pref', 'ui'];
    return prefIndicators.some(indicator => name.toLowerCase().includes(indicator));
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
