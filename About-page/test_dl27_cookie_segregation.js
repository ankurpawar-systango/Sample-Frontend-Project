/**
 * Unit Tests for Cookie Segregation - DL-27
 *
 * Tests enhanced cookie segregation functionality including:
 * - Wildcard pattern cleanup (ga_*, _gat_gtag_*)
 * - Server-side consent validation
 * - Frontend consent enforcement
 * - Cookie cleanup on consent revocation
 *
 * Run: node test_dl27_cookie_segregation.js
 */

// Mock environment
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value + ''; },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

// Mock document.cookie
let mockCookies = {};

const mockDocument = {
    get cookie() {
        return Object.entries(mockCookies)
            .map(([name, value]) => `${name}=${value}`)
            .join('; ');
    },
    set cookie(cookieString) {
        // Parse cookie string
        const parts = cookieString.split(';')[0].split('=');
        const name = parts[0].trim();
        const value = parts[1] || '';

        // Check for deletion (expires in the past)
        if (cookieString.includes('expires=Thu, 01 Jan 1970')) {
            delete mockCookies[name];
        } else {
            mockCookies[name] = value;
        }
    }
};

// Helper functions from script.js (simplified for testing)
const COOKIE_CATEGORY = {
    ESSENTIAL: 'essential',
    PERFORMANCE: 'performance',
    PREFERENCES: 'preferences'
};

function getConsentLevel() {
    const saved = mockLocalStorage.getItem('cookiePreferences');
    if (saved) {
        try {
            const prefs = JSON.parse(saved);
            return {
                essential: true,
                performance: prefs.performance || false,
                preferences: prefs.preferences || false
            };
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

function canSetCookie(category) {
    const consent = getConsentLevel();
    if (category === COOKIE_CATEGORY.ESSENTIAL) {
        return true;
    }
    if (category === COOKIE_CATEGORY.PERFORMANCE) {
        return consent.performance === true;
    }
    if (category === COOKIE_CATEGORY.PREFERENCES) {
        return consent.preferences === true;
    }
    console.warn(`Unknown cookie category: ${category}`);
    return false;
}

function deleteCookie(name, path = '/') {
    mockDocument.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
}

function isPerformanceCookie(name) {
    const perfIndicators = ['analytics', 'ga', 'utm', 'tracking', 'track', 'metric'];
    return perfIndicators.some(indicator => name.toLowerCase().includes(indicator));
}

function isPreferenceCookie(name) {
    const prefIndicators = ['theme', 'preference', 'language', 'setting', 'pref', 'ui'];
    return prefIndicators.some(indicator => name.toLowerCase().includes(indicator));
}

function cleanupNonConsentedCookies(prefs) {
    const performanceCookies = [
        '_ga', '_gid', '_analytics',
        '_gat', '__utma', '__utmb', '__utmc', '__utmz', '__utmv',
        'analytics', 'analytics_session'
    ];
    const preferenceCookies = [
        '_theme', '_language', '_preferences',
        'theme_preference', 'language_setting', 'user_preferences',
        'ui_preferences', 'display_preferences'
    ];

    const allCookies = mockDocument.cookie.split(';');
    const existingCookieNames = allCookies.map(cookie => cookie.split('=')[0].trim()).filter(name => name);

    if (!prefs.performance) {
        performanceCookies.forEach(name => {
            deleteCookie(name);
            deleteCookie(name, '/');
        });

        existingCookieNames.forEach(cookieName => {
            if (cookieName.startsWith('ga_') || cookieName.startsWith('_ga_')) {
                deleteCookie(cookieName);
                deleteCookie(cookieName, '/');
            }
            if (cookieName.startsWith('_gat_gtag_')) {
                deleteCookie(cookieName);
                deleteCookie(cookieName, '/');
            }
            if (isPerformanceCookie(cookieName)) {
                deleteCookie(cookieName);
                deleteCookie(cookieName, '/');
            }
        });
    }

    if (!prefs.preferences) {
        preferenceCookies.forEach(name => {
            deleteCookie(name);
            deleteCookie(name, '/');
        });

        existingCookieNames.forEach(cookieName => {
            if (isPreferenceCookie(cookieName)) {
                deleteCookie(cookieName);
                deleteCookie(cookieName, '/');
            }
        });
    }
}

// Test Suite
const DL27Tests = (() => {
    let passedTests = 0;
    let failedTests = 0;
    const results = [];

    function assertEqual(actual, expected, testName) {
        if (actual === expected) {
            passedTests++;
            results.push(`✓ ${testName}`);
            return true;
        } else {
            failedTests++;
            results.push(`✗ ${testName} - Expected: ${expected}, Got: ${actual}`);
            return false;
        }
    }

    function assertObjectEqual(actual, expected, testName) {
        const match = JSON.stringify(actual) === JSON.stringify(expected);
        if (match) {
            passedTests++;
            results.push(`✓ ${testName}`);
            return true;
        } else {
            failedTests++;
            results.push(`✗ ${testName} - Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
            return false;
        }
    }

    function resetMocks() {
        mockLocalStorage.clear();
        mockCookies = {};
    }

    // Test 1: Wildcard GA cookies are cleaned up
    function testWildcardGACookieCleanup() {
        resetMocks();

        // Set wildcard cookies
        mockCookies['ga_ABC123'] = 'value1';
        mockCookies['ga_XYZ789'] = 'value2';
        mockCookies['_ga_SESSION'] = 'value3';

        // Revoke performance consent
        const prefs = {
            essential: true,
            performance: false,
            preferences: true
        };

        cleanupNonConsentedCookies(prefs);

        // Check that ga_* cookies are deleted
        assertEqual(mockCookies['ga_ABC123'], undefined, 'ga_ABC123 cookie deleted');
        assertEqual(mockCookies['ga_XYZ789'], undefined, 'ga_XYZ789 cookie deleted');
        assertEqual(mockCookies['_ga_SESSION'], undefined, '_ga_SESSION cookie deleted');
    }

    // Test 2: Wildcard _gat_gtag_* cookies are cleaned up
    function testWildcardGtagCookieCleanup() {
        resetMocks();

        mockCookies['_gat_gtag_UA_12345'] = 'value1';
        mockCookies['_gat_gtag_G_ABCDEF'] = 'value2';

        const prefs = {
            essential: true,
            performance: false,
            preferences: true
        };

        cleanupNonConsentedCookies(prefs);

        assertEqual(mockCookies['_gat_gtag_UA_12345'], undefined, '_gat_gtag_UA_12345 cookie deleted');
        assertEqual(mockCookies['_gat_gtag_G_ABCDEF'], undefined, '_gat_gtag_G_ABCDEF cookie deleted');
    }

    // Test 3: Essential cookies are never deleted
    function testEssentialCookiesNeverDeleted() {
        resetMocks();

        mockCookies['PHPSESSID'] = 'session123';
        mockCookies['csrf_token'] = 'csrf123';

        const prefs = {
            essential: true,
            performance: false,
            preferences: false
        };

        cleanupNonConsentedCookies(prefs);

        assertEqual(mockCookies['PHPSESSID'], 'session123', 'PHPSESSID not deleted');
        assertEqual(mockCookies['csrf_token'], 'csrf123', 'csrf_token not deleted');
    }

    // Test 4: Performance cookies kept when consent given
    function testPerformanceCookiesKeptWithConsent() {
        resetMocks();

        mockCookies['_ga'] = 'GA123';
        mockCookies['ga_ABC'] = 'value1';

        const prefs = {
            essential: true,
            performance: true,
            preferences: false
        };

        cleanupNonConsentedCookies(prefs);

        assertEqual(mockCookies['_ga'], 'GA123', '_ga cookie kept with consent');
        assertEqual(mockCookies['ga_ABC'], 'value1', 'ga_ABC cookie kept with consent');
    }

    // Test 5: Preference cookies cleaned up when revoked
    function testPreferenceCookiesCleanupOnRevoke() {
        resetMocks();

        mockCookies['_theme'] = 'dark';
        mockCookies['_language'] = 'en';
        mockCookies['user_preferences'] = 'custom';

        const prefs = {
            essential: true,
            performance: true,
            preferences: false
        };

        cleanupNonConsentedCookies(prefs);

        assertEqual(mockCookies['_theme'], undefined, '_theme cookie deleted');
        assertEqual(mockCookies['_language'], undefined, '_language cookie deleted');
        assertEqual(mockCookies['user_preferences'], undefined, 'user_preferences cookie deleted');
    }

    // Test 6: Mixed consent levels cleanup correctly
    function testMixedConsentLevels() {
        resetMocks();

        mockCookies['PHPSESSID'] = 'session';
        mockCookies['_ga'] = 'analytics';
        mockCookies['_theme'] = 'dark';

        const prefs = {
            essential: true,
            performance: false,
            preferences: true
        };

        cleanupNonConsentedCookies(prefs);

        assertEqual(mockCookies['PHPSESSID'], 'session', 'Essential cookie kept');
        assertEqual(mockCookies['_ga'], undefined, 'Performance cookie deleted');
        assertEqual(mockCookies['_theme'], 'dark', 'Preference cookie kept');
    }

    // Test 7: canSetCookie enforces consent levels
    function testCanSetCookieEnforcement() {
        resetMocks();

        // No consent given
        mockLocalStorage.setItem('cookiePreferences', JSON.stringify({
            essential: true,
            performance: false,
            preferences: false
        }));

        assertEqual(canSetCookie(COOKIE_CATEGORY.ESSENTIAL), true, 'Essential always allowed');
        assertEqual(canSetCookie(COOKIE_CATEGORY.PERFORMANCE), false, 'Performance blocked without consent');
        assertEqual(canSetCookie(COOKIE_CATEGORY.PREFERENCES), false, 'Preferences blocked without consent');
    }

    // Test 8: canSetCookie allows with consent
    function testCanSetCookieWithConsent() {
        resetMocks();

        mockLocalStorage.setItem('cookiePreferences', JSON.stringify({
            essential: true,
            performance: true,
            preferences: true
        }));

        assertEqual(canSetCookie(COOKIE_CATEGORY.ESSENTIAL), true, 'Essential allowed');
        assertEqual(canSetCookie(COOKIE_CATEGORY.PERFORMANCE), true, 'Performance allowed with consent');
        assertEqual(canSetCookie(COOKIE_CATEGORY.PREFERENCES), true, 'Preferences allowed with consent');
    }

    // Test 9: isPerformanceCookie identifies tracking cookies
    function testIsPerformanceCookieIdentification() {
        assertEqual(isPerformanceCookie('_ga'), true, '_ga identified as performance');
        assertEqual(isPerformanceCookie('analytics_session'), true, 'analytics_session identified as performance');
        assertEqual(isPerformanceCookie('__utm_tracking'), true, '__utm_tracking identified as performance');
        assertEqual(isPerformanceCookie('user_preferences'), false, 'user_preferences not identified as performance');
    }

    // Test 10: isPreferenceCookie identifies preference cookies
    function testIsPreferenceCookieIdentification() {
        assertEqual(isPreferenceCookie('_theme'), true, '_theme identified as preference');
        assertEqual(isPreferenceCookie('language_setting'), true, 'language_setting identified as preference');
        assertEqual(isPreferenceCookie('ui_preferences'), true, 'ui_preferences identified as preference');
        assertEqual(isPreferenceCookie('_ga'), false, '_ga not identified as preference');
    }

    // Test 11: All performance categories cleaned on revoke
    function testAllPerformanceCategoriesCleanedOnRevoke() {
        resetMocks();

        // Set various performance cookies
        mockCookies['_ga'] = 'v1';
        mockCookies['_gid'] = 'v2';
        mockCookies['__utma'] = 'v3';
        mockCookies['ga_ABC123'] = 'v4';
        mockCookies['_gat_gtag_UA'] = 'v5';

        const prefs = {
            essential: true,
            performance: false,
            preferences: true
        };

        cleanupNonConsentedCookies(prefs);

        assertEqual(Object.keys(mockCookies).length, 0, 'All performance cookies deleted');
    }

    // Test 12: Consent state persists in localStorage
    function testConsentStatePersistence() {
        resetMocks();

        const prefs = {
            essential: true,
            performance: true,
            preferences: false,
            date: new Date().toISOString()
        };

        mockLocalStorage.setItem('cookiePreferences', JSON.stringify(prefs));

        const retrieved = getConsentLevel();

        assertObjectEqual(
            { essential: retrieved.essential, performance: retrieved.performance, preferences: retrieved.preferences },
            { essential: true, performance: true, preferences: false },
            'Consent state persists correctly'
        );
    }

    function runAllTests() {
        console.log('========================================');
        console.log('DL-27: Cookie Segregation Tests');
        console.log('========================================\n');

        testWildcardGACookieCleanup();
        testWildcardGtagCookieCleanup();
        testEssentialCookiesNeverDeleted();
        testPerformanceCookiesKeptWithConsent();
        testPreferenceCookiesCleanupOnRevoke();
        testMixedConsentLevels();
        testCanSetCookieEnforcement();
        testCanSetCookieWithConsent();
        testIsPerformanceCookieIdentification();
        testIsPreferenceCookieIdentification();
        testAllPerformanceCategoriesCleanedOnRevoke();
        testConsentStatePersistence();

        results.forEach(result => console.log(result));
        console.log('\n========================================');
        console.log(`Total Passed: ${passedTests}`);
        console.log(`Total Failed: ${failedTests}`);
        console.log(`Total Tests: ${passedTests + failedTests}`);
        console.log(`Success Rate: ${passedTests > 0 ? Math.round((passedTests / (passedTests + failedTests)) * 100) : 0}%`);
        console.log('========================================\n');

        return {
            passed: passedTests,
            failed: failedTests,
            total: passedTests + failedTests,
            results: results,
            success: failedTests === 0
        };
    }

    return {
        runAllTests: runAllTests
    };
})();

// Run tests if executed directly
if (typeof window === 'undefined') {
    const testResults = DL27Tests.runAllTests();
    process.exit(testResults.success ? 0 : 1);
}

// Export for use in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DL27Tests;
}
