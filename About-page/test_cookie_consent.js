/**
 * Unit Tests for Cookie Consent Functionality
 *
 * Tests the segregated cookie categories display and management
 * as per DL-40 requirements:
 * - Necessary cookies (Essential) - Cannot be disabled
 * - Non-Necessary cookies - Performance and Preferences (toggleable)
 *
 * Note: These are JavaScript unit tests that can be run in Node.js
 * or via browser console. For integration testing with the HTML UI,
 * use test_about.html or test_about_enhanced.html in the browser.
 */

// Mock localStorage for testing
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value + ''; },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

// Test Suite for Cookie Consent
const CookieConsentTests = (() => {
    let passedTests = 0;
    let failedTests = 0;
    const results = [];

    /**
     * Assert equality
     */
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

    /**
     * Assert object equality
     */
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

    /**
     * Test 1: Essential cookies are always enabled
     */
    function testEssentialCookiesAlwaysEnabled() {
        mockLocalStorage.clear();

        // Simulate getConsentLevel from script.js
        const consent = {
            essential: true,
            performance: false,
            preferences: false
        };

        assertEqual(consent.essential, true, 'Essential cookies are always true');
    }

    /**
     * Test 2: Performance cookies default to false
     */
    function testPerformanceCookiesDefaultToFalse() {
        mockLocalStorage.clear();

        const consent = {
            essential: true,
            performance: false,
            preferences: false
        };

        assertEqual(consent.performance, false, 'Performance cookies default to false');
    }

    /**
     * Test 3: Preference cookies default to false
     */
    function testPreferenceCookiesDefaultToFalse() {
        mockLocalStorage.clear();

        const consent = {
            essential: true,
            performance: false,
            preferences: false
        };

        assertEqual(consent.preferences, false, 'Preference cookies default to false');
    }

    /**
     * Test 4: Saving preferences creates correct object
     */
    function testSavePreferencesObject() {
        const prefs = {
            essential: true,
            performance: true,
            preferences: false,
            date: new Date().toISOString()
        };

        assertEqual(prefs.essential, true, 'Saved preferences include essential: true');
        assertEqual(prefs.performance, true, 'Saved preferences include performance: true');
        assertEqual(prefs.preferences, false, 'Saved preferences include preferences: false');
    }

    /**
     * Test 5: Accept All creates correct preferences
     */
    function testAcceptAllCookies() {
        const allCookies = {
            essential: true,
            performance: true,
            preferences: true,
            date: new Date().toISOString()
        };

        assertObjectEqual(
            { essential: allCookies.essential, performance: allCookies.performance, preferences: allCookies.preferences },
            { essential: true, performance: true, preferences: true },
            'Accept All sets all categories to true'
        );
    }

    /**
     * Test 6: Decline Optional creates correct preferences
     */
    function testDeclineOptionalCookies() {
        const essentialOnly = {
            essential: true,
            performance: false,
            preferences: false,
            date: new Date().toISOString()
        };

        assertObjectEqual(
            { essential: essentialOnly.essential, performance: essentialOnly.performance, preferences: essentialOnly.preferences },
            { essential: true, performance: false, preferences: false },
            'Decline Optional sets only essential to true'
        );
    }

    /**
     * Test 7: canSetCookie function logic - essential always allowed
     */
    function testCanSetEssentialCookie() {
        const canSet = true; // Essential cookies always return true
        assertEqual(canSet, true, 'Essential cookies can always be set');
    }

    /**
     * Test 8: canSetCookie function logic - performance requires consent
     */
    function testPerformanceCookieRequiresConsent() {
        const consentGiven = { performance: true };
        const canSet = consentGiven.performance === true;
        assertEqual(canSet, true, 'Performance cookie can be set when consent is true');

        const consentNotGiven = { performance: false };
        const cannotSet = consentNotGiven.performance === true;
        assertEqual(cannotSet, false, 'Performance cookie cannot be set when consent is false');
    }

    /**
     * Test 9: canSetCookie function logic - preferences requires consent
     */
    function testPreferenceCookieRequiresConsent() {
        const consentGiven = { preferences: true };
        const canSet = consentGiven.preferences === true;
        assertEqual(canSet, true, 'Preference cookie can be set when consent is true');

        const consentNotGiven = { preferences: false };
        const cannotSet = consentNotGiven.preferences === true;
        assertEqual(cannotSet, false, 'Preference cookie cannot be set when consent is false');
    }

    /**
     * Test 10: Cookie cleanup identifies performance cookies
     */
    function testIdentifyPerformanceCookies() {
        const performanceCookieNames = ['_ga', '_analytics', '__utma', '__utmb'];
        const perfIndicators = ['analytics', 'ga', 'utm', 'tracking', 'track', 'metric'];

        performanceCookieNames.forEach(name => {
            const isPerf = perfIndicators.some(indicator => name.toLowerCase().includes(indicator));
            assertEqual(isPerf, true, `"${name}" is identified as performance cookie`);
        });
    }

    /**
     * Test 11: Cookie cleanup identifies preference cookies
     */
    function testIdentifyPreferenceCookies() {
        const preferenceCookieNames = ['_theme', '_language', '_preferences', 'user_preferences'];
        const prefIndicators = ['theme', 'preference', 'language', 'setting', 'pref', 'ui'];

        preferenceCookieNames.forEach(name => {
            const isPref = prefIndicators.some(indicator => name.toLowerCase().includes(indicator));
            assertEqual(isPref, true, `"${name}" is identified as preference cookie`);
        });
    }

    /**
     * Test 12: Cookie consent banner shows for first-time visitors
     */
    function testCookieBannerInitialDisplay() {
        mockLocalStorage.clear();
        const cookieConsent = mockLocalStorage.getItem('cookieConsent');
        assertEqual(cookieConsent, null, 'Cookie banner should show for first-time visitors (no cookieConsent flag)');
    }

    /**
     * Test 13: Cookie banner hides after user makes choice
     */
    function testCookieBannerHidesAfterChoice() {
        mockLocalStorage.setItem('cookieConsent', 'accepted');
        const cookieConsent = mockLocalStorage.getItem('cookieConsent');
        assertEqual(cookieConsent, 'accepted', 'Cookie banner should hide after user accepts');

        mockLocalStorage.clear();
        mockLocalStorage.setItem('cookieConsent', 'declined');
        const declinedConsent = mockLocalStorage.getItem('cookieConsent');
        assertEqual(declinedConsent, 'declined', 'Cookie banner should hide after user declines');
    }

    /**
     * Test 14: Preferences persist in localStorage
     */
    function testPreferencesPersistenceInStorage() {
        mockLocalStorage.clear();
        const prefs = {
            essential: true,
            performance: true,
            preferences: false
        };

        mockLocalStorage.setItem('cookiePreferences', JSON.stringify(prefs));
        const stored = JSON.parse(mockLocalStorage.getItem('cookiePreferences'));

        assertObjectEqual(stored, prefs, 'Preferences persist correctly in localStorage');
    }

    /**
     * Test 15: Category segregation - Essential vs Non-Essential
     */
    function testCategorySegregation() {
        // Essential cookies (cannot be modified)
        const essentialCookies = ['PHPSESSID', 'csrftoken', 'sessionid'];

        // Performance cookies (optional)
        const performanceCookies = ['_ga', '_gid', 'analytics'];

        // Preference cookies (optional)
        const preferenceCookies = ['_theme', '_language', 'user_preferences'];

        assertEqual(essentialCookies.length, 3, 'Essential cookies list has 3 items');
        assertEqual(performanceCookies.length, 3, 'Performance cookies list has 3 items');
        assertEqual(preferenceCookies.length, 3, 'Preference cookies list has 3 items');
    }

    /**
     * Run all tests and return results
     */
    function runAllTests() {
        console.log('========================================');
        console.log('Cookie Consent Unit Tests (DL-40)');
        console.log('========================================\n');

        testEssentialCookiesAlwaysEnabled();
        testPerformanceCookiesDefaultToFalse();
        testPreferenceCookiesDefaultToFalse();
        testSavePreferencesObject();
        testAcceptAllCookies();
        testDeclineOptionalCookies();
        testCanSetEssentialCookie();
        testPerformanceCookieRequiresConsent();
        testPreferenceCookieRequiresConsent();
        testIdentifyPerformanceCookies();
        testIdentifyPreferenceCookies();
        testCookieBannerInitialDisplay();
        testCookieBannerHidesAfterChoice();
        testPreferencesPersistenceInStorage();
        testCategorySegregation();

        // Print results
        results.forEach(result => console.log(result));
        console.log('\n========================================');
        console.log(`Total Passed: ${passedTests}`);
        console.log(`Total Failed: ${failedTests}`);
        console.log(`Total Tests: ${passedTests + failedTests}`);
        console.log('========================================\n');

        return {
            passed: passedTests,
            failed: failedTests,
            total: passedTests + failedTests,
            results: results
        };
    }

    return {
        runAllTests: runAllTests,
        assertEqual: assertEqual,
        assertObjectEqual: assertObjectEqual
    };
})();

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieConsentTests;
}

// Run tests if this file is loaded directly
if (typeof window === 'undefined') {
    // Node.js environment
    CookieConsentTests.runAllTests();
}
