/**
 * Privacy Policy Page Script (DL-60, DL-64)
 *
 * Handles privacy policy consent management with accept/reject functionality.
 * Stores user consent in localStorage for future reference.
 * Also manages user feature preferences (DL-64).
 *
 * Features:
 * - Accept Privacy Policy button stores consent
 * - Reject Privacy Policy button redirects to home
 * - Consent status tracked in localStorage
 * - User-friendly notifications via SweetAlert2
 * - Feature preference selection with toggles (DL-64)
 * - Feature preferences persisted in localStorage (DL-64)
 * - Responsive design
 */

// Configuration
const CONFIG = {
    PRIVACY_CONSENT_KEY: 'privacyPolicyConsent',
    PRIVACY_TIMESTAMP_KEY: 'privacyPolicyTimestamp',
    FEATURE_PREFERENCES_KEY: 'featurePreferences',
    HOME_URL: '/'
};

/**
 * Platform features with descriptions
 * Essential features are marked as required and non-toggleable
 */
const PLATFORM_FEATURES = {
    authentication: {
        name: 'Authentication & Security',
        description: 'Core authentication, login sessions, and security features to protect your account',
        essential: true,
        category: 'Core'
    },
    core_functionality: {
        name: 'Core Platform Functionality',
        description: 'Essential features required for the platform to operate (data storage, profile management)',
        essential: true,
        category: 'Core'
    },
    analytics: {
        name: 'Analytics & Usage Tracking',
        description: 'Track your usage patterns to help us understand feature adoption and improve the platform',
        essential: false,
        category: 'Analytics'
    },
    personalization: {
        name: 'Personalization & Preferences',
        description: 'Customize your experience based on your preferences, language, theme, and saved settings',
        essential: false,
        category: 'User Experience'
    },
    notifications: {
        name: 'Notifications & Alerts',
        description: 'Send you important alerts, updates, and notifications about your activity',
        essential: false,
        category: 'Communications'
    },
    third_party_integrations: {
        name: 'Third-Party Integrations',
        description: 'Connect with external services and integrations to extend platform functionality',
        essential: false,
        category: 'Integrations'
    }
};

/**
 * Get default feature preferences
 * All non-essential features default to true; essential features are always true
 */
function getDefaultFeaturePreferences() {
    const prefs = {};
    for (const [featureId, feature] of Object.entries(PLATFORM_FEATURES)) {
        prefs[featureId] = true; // Default all features to enabled
    }
    return prefs;
}

/**
 * Initialize privacy policy page
 * Sets up event listeners and checks consent status
 */
function initializePrivacyPage() {
    setupEventListeners();
    setupFeaturePreferences();
    checkExistingConsent();
}

/**
 * Setup feature preferences UI and event listeners
 */
function setupFeaturePreferences() {
    try {
        const prefsContainer = document.getElementById('featurePreferencesContainer');
        if (!prefsContainer) {
            console.warn('Feature preferences container not found in HTML');
            return;
        }

        // Get existing preferences or defaults
        const currentPrefs = getFeaturePreferences() || getDefaultFeaturePreferences();

        // Group features by category
        const categories = {};
        for (const [featureId, feature] of Object.entries(PLATFORM_FEATURES)) {
            if (!categories[feature.category]) {
                categories[feature.category] = [];
            }
            categories[feature.category].push({ id: featureId, ...feature });
        }

        // Render feature preference sections
        let prefsHTML = '<div class="feature-preferences-wrapper">';

        for (const [category, features] of Object.entries(categories)) {
            prefsHTML += `
                <div class="feature-category">
                    <h4 class="category-title">${category}</h4>
                    <div class="features-list">
            `;

            for (const feature of features) {
                const isChecked = currentPrefs[feature.id] !== false ? 'checked' : '';
                const isDisabled = feature.essential ? 'disabled' : '';
                const disabledClass = feature.essential ? 'feature-essential' : '';

                prefsHTML += `
                    <div class="feature-item ${disabledClass}">
                        <label class="feature-label">
                            <input
                                type="checkbox"
                                class="feature-checkbox"
                                data-feature-id="${feature.id}"
                                ${isChecked}
                                ${isDisabled}
                            >
                            <div class="feature-info">
                                <span class="feature-name">${feature.name}</span>
                                ${feature.essential ? '<span class="badge-essential">Essential</span>' : ''}
                                <p class="feature-description">${feature.description}</p>
                            </div>
                        </label>
                    </div>
                `;
            }

            prefsHTML += `
                    </div>
                </div>
            `;
        }

        prefsHTML += '</div>';
        prefsContainer.innerHTML = prefsHTML;

        // Setup checkbox event listeners
        const checkboxes = prefsContainer.querySelectorAll('.feature-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleFeatureToggle);
        });

        console.log('Feature preferences UI initialized');
    } catch (error) {
        console.error('Error setting up feature preferences:', error);
    }
}

/**
 * Handle individual feature toggle
 */
function handleFeatureToggle(event) {
    const featureId = event.target.getAttribute('data-feature-id');
    const isChecked = event.target.checked;

    // Update current preferences in memory (but don't persist yet)
    // Preferences are only saved when user accepts privacy policy
    console.log(`Feature ${featureId} toggled: ${isChecked}`);
}

/**
 * Get current feature preferences from localStorage
 */
function getFeaturePreferences() {
    try {
        const prefsData = localStorage.getItem(CONFIG.FEATURE_PREFERENCES_KEY);
        return prefsData ? JSON.parse(prefsData) : null;
    } catch (error) {
        console.error('Error retrieving feature preferences:', error);
        return null;
    }
}

/**
 * Save feature preferences to localStorage
 */
function saveFeaturePreferences() {
    try {
        const prefsContainer = document.getElementById('featurePreferencesContainer');
        if (!prefsContainer) return null;

        const checkboxes = prefsContainer.querySelectorAll('.feature-checkbox');
        const preferences = getDefaultFeaturePreferences();

        checkboxes.forEach(checkbox => {
            const featureId = checkbox.getAttribute('data-feature-id');
            preferences[featureId] = checkbox.checked;
        });

        // Validate at least one essential feature is selected
        // (This should always be true since essential features are disabled)
        const hasEssentialFeatures = Object.entries(PLATFORM_FEATURES)
            .filter(([id, feature]) => feature.essential)
            .every(([id]) => preferences[id]);

        if (!hasEssentialFeatures) {
            console.warn('Essential features validation failed');
            return null;
        }

        const prefsData = {
            preferences: preferences,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        localStorage.setItem(CONFIG.FEATURE_PREFERENCES_KEY, JSON.stringify(prefsData));
        console.log('Feature preferences saved:', preferences);
        return preferences;
    } catch (error) {
        console.error('Error saving feature preferences:', error);
        return null;
    }
}

/**
 * Setup event listeners for accept and reject buttons
 */
function setupEventListeners() {
    const acceptBtn = document.getElementById('acceptPrivacy');
    const rejectBtn = document.getElementById('rejectPrivacy');

    if (acceptBtn) {
        acceptBtn.addEventListener('click', handleAcceptPrivacy);
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', handleRejectPrivacy);
    }
}

/**
 * Handle accept privacy policy action
 * Stores consent and feature preferences to localStorage and shows confirmation
 */
function handleAcceptPrivacy() {
    try {
        // Save feature preferences first
        const savedPrefs = saveFeaturePreferences();
        if (!savedPrefs) {
            throw new Error('Failed to save feature preferences');
        }

        // Store consent in localStorage
        const consentData = {
            accepted: true,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            featurePreferencesAccepted: true
        };

        localStorage.setItem(CONFIG.PRIVACY_CONSENT_KEY, JSON.stringify(consentData));
        localStorage.setItem(CONFIG.PRIVACY_TIMESTAMP_KEY, new Date().getTime());

        // Show success notification
        Swal.fire({
            title: 'Privacy Policy Accepted',
            html: '<p>Thank you for reviewing and accepting our Privacy Policy.</p><p>Your consent and feature preferences have been recorded and will be used to improve your experience on our platform.</p>',
            icon: 'success',
            confirmButtonText: 'Continue',
            confirmButtonColor: '#667eea',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then((result) => {
            if (result.isConfirmed) {
                // Redirect to home page after 1 second
                setTimeout(() => {
                    window.location.href = CONFIG.HOME_URL;
                }, 500);
            }
        });

        console.log('Privacy policy and feature preferences accepted at:', new Date().toISOString());
    } catch (error) {
        console.error('Error accepting privacy policy:', error);
        Swal.fire({
            title: 'Error',
            text: 'An error occurred while processing your consent. Please try again.',
            icon: 'error',
            confirmButtonColor: '#667eea'
        });
    }
}

/**
 * Handle reject privacy policy action
 * Shows a confirmation and redirects to home page
 */
function handleRejectPrivacy() {
    try {
        Swal.fire({
            title: 'Decline Privacy Policy',
            html: '<p>You are about to decline our Privacy Policy.</p><p>By declining, you may be unable to use certain features of our platform that require consent to data processing.</p><p>Are you sure you want to continue?</p>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Go Home',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#667eea',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                // Store rejection in localStorage
                const rejectionData = {
                    accepted: false,
                    rejected: true,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                };

                localStorage.setItem(CONFIG.PRIVACY_CONSENT_KEY, JSON.stringify(rejectionData));
                localStorage.setItem(CONFIG.PRIVACY_TIMESTAMP_KEY, new Date().getTime());

                // Show rejection notification
                Swal.fire({
                    title: 'Privacy Policy Declined',
                    html: '<p>You have declined our Privacy Policy.</p><p>Redirecting to home page...</p>',
                    icon: 'info',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#667eea',
                    timer: 2000,
                    timerProgressBar: true,
                    allowOutsideClick: false,
                    allowEscapeKey: false
                }).then(() => {
                    window.location.href = CONFIG.HOME_URL;
                });

                console.log('Privacy policy declined at:', new Date().toISOString());
            }
        });
    } catch (error) {
        console.error('Error rejecting privacy policy:', error);
        Swal.fire({
            title: 'Error',
            text: 'An error occurred while processing your request. Please try again.',
            icon: 'error',
            confirmButtonColor: '#667eea'
        });
    }
}

/**
 * Check if user has already provided consent
 * Display a notification if consent already exists
 */
function checkExistingConsent() {
    try {
        const existingConsent = localStorage.getItem(CONFIG.PRIVACY_CONSENT_KEY);

        if (existingConsent) {
            const consentData = JSON.parse(existingConsent);
            const timestamp = localStorage.getItem(CONFIG.PRIVACY_TIMESTAMP_KEY);

            if (consentData.accepted) {
                const consentDate = new Date(parseInt(timestamp)).toLocaleDateString();
                console.log('User has already accepted privacy policy on:', consentDate);

                // Optional: Show banner about existing consent
                showExistingConsentNotification(consentDate);
            } else if (consentData.rejected) {
                console.log('User has rejected privacy policy at:', consentData.timestamp);
            }
        }
    } catch (error) {
        console.error('Error checking existing consent:', error);
    }
}

/**
 * Show notification about existing consent
 * @param {string} consentDate - Date when consent was given
 */
function showExistingConsentNotification(consentDate) {
    // Create a notification banner
    const notificationHTML = `
        <div class="existing-consent-banner">
            <div class="banner-content">
                <span class="banner-icon">✓</span>
                <div class="banner-text">
                    <p><strong>Your Privacy Consent</strong></p>
                    <p style="font-size: 0.9rem; margin-top: 5px;">You previously accepted our Privacy Policy on ${consentDate}</p>
                </div>
                <button class="banner-close" onclick="this.parentElement.parentElement.style.display='none'">✕</button>
            </div>
        </div>
    `;

    // Insert banner at the top of the content
    const privacyContainer = document.querySelector('.privacy-content');
    if (privacyContainer) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = notificationHTML;
        privacyContainer.insertBefore(tempDiv.firstElementChild, privacyContainer.firstChild);

        // Add some styling for the banner
        const style = document.createElement('style');
        style.textContent = `
            .existing-consent-banner {
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                border: 1px solid #b1dfbb;
                border-radius: 8px;
                margin-bottom: 30px;
                padding: 0;
                overflow: hidden;
            }

            .existing-consent-banner .banner-content {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px 20px;
            }

            .banner-icon {
                font-size: 1.5rem;
                color: #28a745;
                font-weight: bold;
            }

            .banner-text {
                flex: 1;
                color: #155724;
            }

            .banner-text p {
                margin: 0;
            }

            .banner-close {
                background: none;
                border: none;
                color: #155724;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                opacity: 0.7;
                transition: opacity 0.3s ease;
            }

            .banner-close:hover {
                opacity: 1;
            }

            @media (max-width: 768px) {
                .existing-consent-banner .banner-content {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }

                .banner-close {
                    align-self: flex-end;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Get consent status
 * @returns {Object|null} Consent data or null if no consent
 */
function getConsentStatus() {
    try {
        const consentData = localStorage.getItem(CONFIG.PRIVACY_CONSENT_KEY);
        return consentData ? JSON.parse(consentData) : null;
    } catch (error) {
        console.error('Error retrieving consent status:', error);
        return null;
    }
}

/**
 * Clear consent data (for testing or user request)
 */
function clearConsent() {
    try {
        localStorage.removeItem(CONFIG.PRIVACY_CONSENT_KEY);
        localStorage.removeItem(CONFIG.PRIVACY_TIMESTAMP_KEY);
        console.log('Consent data cleared');
    } catch (error) {
        console.error('Error clearing consent:', error);
    }
}

// Initialize page when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePrivacyPage);
} else {
    initializePrivacyPage();
}

// Expose functions for testing and external use
window.PrivacyPolicy = {
    getConsentStatus: getConsentStatus,
    clearConsent: clearConsent,
    handleAccept: handleAcceptPrivacy,
    handleReject: handleRejectPrivacy,
    getFeaturePreferences: getFeaturePreferences,
    saveFeaturePreferences: saveFeaturePreferences,
    getDefaultFeaturePreferences: getDefaultFeaturePreferences,
    getPlatformFeatures: () => PLATFORM_FEATURES
};
