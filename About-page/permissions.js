/**
 * Permissions Page Script
 *
 * Handles cookie permission management by user permission levels
 * Displays cookie categories segregated by required permission levels
 * Allows users to view and modify cookie preferences based on their permission tier
 *
 * DL-22: Cookie segregation by permission level
 */

// Configuration
const CONFIG = {
    BACKEND_URL: localStorage.getItem('backendUrl') || 'http://localhost:3000',
    COOKIE_CONSENT_ENDPOINT: '/8-about-me/cookie-consent.php',
    SESSION_ENDPOINT: '/5-auth/session/',
    COOKIE_PREFS_KEY: 'cookiePreferences'
};

/**
 * Permission level definitions
 * @readonly
 */
const PERMISSION_LEVELS = {
    0: { name: 'Public', description: 'No permission required - publicly available' },
    1: { name: 'Basic User', description: 'Requires basic user authentication' },
    2: { name: 'Premium User', description: 'Requires premium user status' }
};

/**
 * Cookie category mapping to permission levels
 * @readonly
 */
const COOKIE_CATEGORY_PERMISSIONS = {
    'essential': { level: 0, name: 'Essential Cookies', type: 'essential' },
    'performance': { level: 1, name: 'Performance Cookies', type: 'performance' },
    'preferences': { level: 2, name: 'Preference Cookies', type: 'preferences' }
};

/**
 * Initialize the permissions page on load
 * Checks authentication and loads permission level data
 */
document.addEventListener('DOMContentLoaded', async function () {
    // Check user session first
    const isAuthenticated = await checkUserAuthentication();
    if (!isAuthenticated) {
        showNotAuthenticated();
        return;
    }

    // Load and display permission levels
    await loadPermissionLevels();
});

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if user is authenticated
 */
async function checkUserAuthentication() {
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
            return data.success && data.loggedin;
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
    }

    return false;
}

/**
 * Show message for unauthenticated users
 */
function showNotAuthenticated() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('errorMessage').textContent = 'You must be logged in to view this page. Please log in first.';
    document.getElementById('errorMessage').innerHTML += '<br><a href="index.html" style="color: #667eea; text-decoration: underline;">Return to About Page</a>';
}

/**
 * Load permission levels from backend and populate the page
 */
async function loadPermissionLevels() {
    try {
        // Hide loading, error, and content states initially
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('errorState').style.display = 'none';
        document.getElementById('contentState').style.display = 'none';

        // Fetch permission levels from backend
        const response = await fetch(
            `${CONFIG.BACKEND_URL}${CONFIG.COOKIE_CONSENT_ENDPOINT}?permissions=true`,
            {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch permission levels: ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to load permission levels');
        }

        // Fetch full cookie policy with permission info
        const policyResponse = await fetch(
            `${CONFIG.BACKEND_URL}${CONFIG.COOKIE_CONSENT_ENDPOINT}`,
            {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }
        );

        if (!policyResponse.ok) {
            throw new Error(`Failed to fetch cookie policy: ${policyResponse.status}`);
        }

        const policyData = await policyResponse.json();

        if (policyData.status !== 'success') {
            throw new Error(policyData.message || 'Failed to load cookie policy');
        }

        // Get current user's consent state
        const consentState = getConsentLevel();

        // Populate the page with data
        populatePermissionCards(data.permissionLevels);
        populateCookieTable(policyData.cookiePolicy, consentState);
        populateCategoryConsents(policyData.cookiePolicy, consentState);
        populatePermissionExplanation(data.permissionLevels);
        updateCurrentLevelInfo();

        // Hide loading, show content
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('contentState').style.display = 'block';
    } catch (error) {
        console.error('Error loading permission levels:', error);
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'block';
        document.getElementById('errorMessage').textContent = `Error: ${error.message}`;
    }
}

/**
 * Populate permission level cards
 * @param {Object} permissionLevels Permission level definitions
 */
function populatePermissionCards(permissionLevels) {
    const container = document.getElementById('permissionLevelsContainer');
    container.innerHTML = '';

    for (const [levelKey, levelInfo] of Object.entries(permissionLevels)) {
        const level = levelInfo.level;
        const card = document.createElement('div');
        card.className = `permission-card level-${level}`;

        const categoryList = Object.entries(COOKIE_CATEGORY_PERMISSIONS)
            .filter(([_, info]) => info.level <= level)
            .map(([_, info]) => info.name)
            .join('<br>');

        card.innerHTML = `
            <div class="permission-card-content">
                <div class="permission-badge">Level ${level}</div>
                <h2>${levelInfo.name}</h2>
                <p class="permission-description">${levelInfo.description}</p>
                <div class="cookie-categories">
                    <strong>Access to:</strong>
                    <ul class="category-list">
                        ${Object.entries(COOKIE_CATEGORY_PERMISSIONS)
                            .filter(([_, info]) => info.level <= level)
                            .map(([_, info]) => `<li>${info.name}</li>`)
                            .join('')}
                    </ul>
                </div>
            </div>
        `;

        container.appendChild(card);
    }
}

/**
 * Populate cookie categories table
 * @param {Object} cookiePolicy Cookie policy with categories and their info
 * @param {Object} consentState Current user consent state
 */
async function populateCookieTable(cookiePolicy, consentState) {
    const tbody = document.getElementById('cookieTableBody');
    tbody.innerHTML = '';

    // Get user's current permission level (simulate from session)
    const userPermissionLevel = await getUserPermissionLevel();

    for (const [category, info] of Object.entries(cookiePolicy)) {
        const permissionInfo = info.permissionLevel;
        const requiredLevel = permissionInfo.level;
        const hasPermission = userPermissionLevel >= requiredLevel;
        const hasConsent = consentState[category] === true;
        const canAccess = hasPermission && (category === 'essential' || hasConsent);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${info.name}</strong><br>
                <small style="color: #666;">${info.description}</small>
            </td>
            <td>
                <span class="level-indicator"></span>
                Level ${requiredLevel} (${permissionInfo.name})
            </td>
            <td>
                <span class="status ${hasPermission ? 'allowed' : 'denied'}">
                    ${hasPermission ? '✓ Allowed' : '✗ Denied'}
                </span>
            </td>
            <td>
                ${category === 'essential' ? 'Always Required' : (hasConsent ? '✓ Given' : '✗ Not Given')}
            </td>
            <td>
                <span class="status ${canAccess ? 'allowed' : 'denied'}">
                    ${canAccess ? '✓ Full Access' : '✗ No Access'}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    }
}

/**
 * Populate category consent controls
 * @param {Object} cookiePolicy Cookie policy
 * @param {Object} consentState Current consent state
 */
function populateCategoryConsents(cookiePolicy, consentState) {
    const container = document.getElementById('categoryConsents');
    container.innerHTML = '';

    for (const [category, info] of Object.entries(cookiePolicy)) {
        const isChecked = consentState[category] === true;
        const isEssential = category === 'essential';
        const permissionLevel = info.permissionLevel.level;

        const item = document.createElement('div');
        item.className = 'access-control-item';

        item.innerHTML = `
            <div style="flex: 1;">
                <strong>${info.name}</strong><br>
                <small style="color: #666;">
                    ${info.description}<br>
                    Requires Permission Level: ${permissionLevel} (${info.permissionLevel.name})
                </small>
            </div>
            <label style="display: flex; align-items: center; margin-left: 20px;">
                <input type="checkbox" id="consent-${category}" ${isChecked ? 'checked' : ''} ${isEssential ? 'disabled' : ''}>
                <span style="margin-left: 8px;">${isChecked ? 'Consented' : 'Not Consented'}</span>
            </label>
        `;

        if (!isEssential) {
            const checkbox = item.querySelector(`#consent-${category}`);
            checkbox.addEventListener('change', (e) => {
                updateConsentPreference(category, e.target.checked);
            });
        }

        container.appendChild(item);
    }
}

/**
 * Populate permission level explanation
 * @param {Object} permissionLevels Permission level definitions
 */
function populatePermissionExplanation(permissionLevels) {
    const container = document.getElementById('permissionExplanation');
    container.innerHTML = '';

    for (const [levelKey, levelInfo] of Object.entries(permissionLevels)) {
        const level = levelInfo.level;
        const div = document.createElement('div');
        div.style.marginBottom = '20px';

        const categories = Object.entries(COOKIE_CATEGORY_PERMISSIONS)
            .filter(([_, info]) => info.level === level)
            .map(([_, info]) => info.name)
            .join(', ');

        div.innerHTML = `
            <h4>Level ${level} - ${levelInfo.name}</h4>
            <p>${levelInfo.description}</p>
            <p><strong>Access to:</strong> ${categories || 'No additional categories'}</p>
        `;

        container.appendChild(div);
    }
}

/**
 * Update current permission level info
 */
function updateCurrentLevelInfo() {
    const userLevel = 1; // Default to basic user, can be enhanced to fetch from backend

    const levelName = PERMISSION_LEVELS[userLevel]?.name || 'Unknown';
    const levelDesc = PERMISSION_LEVELS[userLevel]?.description || '';

    document.getElementById('currentLevelValue').textContent = `${userLevel} - ${levelName}`;
    document.getElementById('currentLevelDescription').textContent = levelDesc;
}

/**
 * Get user's permission level (simulated - can be enhanced to fetch from backend)
 * @returns {Promise<number>} User's permission level
 */
async function getUserPermissionLevel() {
    // For now, return a default level
    // In production, this should fetch from the backend session/user profile
    return 1; // Basic User level
}

/**
 * Get current consent level from localStorage
 * @returns {Object} User's consent preferences
 */
function getConsentLevel() {
    const saved = localStorage.getItem(CONFIG.COOKIE_PREFS_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing cookie preferences:', e);
        }
    }
    return {
        essential: true,
        performance: false,
        preferences: false
    };
}

/**
 * Update a single consent preference
 * @param {string} category Cookie category
 * @param {boolean} consented Whether user consents
 */
async function updateConsentPreference(category, consented) {
    try {
        // Get current preferences
        const prefs = getConsentLevel();
        prefs[category] = consented;

        // Save to backend
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

        if (response.ok) {
            // Save to localStorage
            localStorage.setItem(CONFIG.COOKIE_PREFS_KEY, JSON.stringify(prefs));

            // Show success message
            showAlert('success', 'Preference Updated', `${category} cookie preference has been updated and saved.`);

            // Reload to update the table
            await loadPermissionLevels();
        } else {
            throw new Error(`Failed to update preference: ${response.status}`);
        }
    } catch (error) {
        console.error('Error updating consent preference:', error);
        showAlert('error', 'Update Failed', 'Failed to update your cookie preference. Please try again.');
    }
}

/**
 * Display alert using SweetAlert2
 * @param {string} icon Alert icon type
 * @param {string} title Alert title
 * @param {string} text Alert message
 */
function showAlert(icon, title, text) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: icon,
            title: title,
            text: text,
            confirmButtonColor: '#667eea',
            timer: 3000,
            timerProgressBar: true
        });
    } else {
        console.log(`${icon.toUpperCase()}: ${title} - ${text}`);
    }
}
