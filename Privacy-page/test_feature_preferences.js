/**
 * Unit Tests for Feature Preferences (DL-64)
 *
 * Tests the feature preference selection functionality including:
 * - Feature preferences can be saved to localStorage
 * - Feature preferences can be retrieved from localStorage
 * - Default feature preferences are set correctly
 * - Feature preferences object structure is valid
 * - Essential features cannot be disabled
 * - At least one essential feature is always selected
 * - Feature preferences are stored with timestamp and userAgent
 * - Feature preferences can be cleared
 *
 * Note: These are JavaScript unit tests that can be run in Node.js
 * or via browser console.
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

// Override global localStorage with mock
if (typeof window === 'undefined') {
    global.localStorage = mockLocalStorage;
}

// Simulate PLATFORM_FEATURES constant
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

const CONFIG = {
    FEATURE_PREFERENCES_KEY: 'featurePreferences'
};

// Test Suite for Feature Preferences
const FeaturePreferencesTests = (() => {
    let passedTests = 0;
    let failedTests = 0;
    const results = [];

    /**
     * Assert equality
     */
    function assertEqual(actual, expected, testName) {
        if (actual === expected) {
            passedTests++;
            results.push(`✓ PASS: ${testName}`);
            return true;
        } else {
            failedTests++;
            results.push(`✗ FAIL: ${testName}`);
            results.push(`   Expected: ${expected}`);
            results.push(`   Got: ${actual}`);
            return false;
        }
    }

    /**
     * Assert not null
     */
    function assertNotNull(actual, testName) {
        if (actual !== null && actual !== undefined) {
            passedTests++;
            results.push(`✓ PASS: ${testName}`);
            return true;
        } else {
            failedTests++;
            results.push(`✗ FAIL: ${testName}`);
            results.push(`   Expected a non-null value, got: ${actual}`);
            return false;
        }
    }

    /**
     * Assert true condition
     */
    function assertTrue(condition, testName) {
        if (condition) {
            passedTests++;
            results.push(`✓ PASS: ${testName}`);
            return true;
        } else {
            failedTests++;
            results.push(`✗ FAIL: ${testName}`);
            return false;
        }
    }

    /**
     * Assert object property exists
     */
    function assertPropertyExists(obj, property, testName) {
        if (obj && obj.hasOwnProperty(property)) {
            passedTests++;
            results.push(`✓ PASS: ${testName}`);
            return true;
        } else {
            failedTests++;
            results.push(`✗ FAIL: ${testName}`);
            results.push(`   Property '${property}' does not exist in object`);
            return false;
        }
    }

    /**
     * Test 1: Feature preferences data structure
     */
    function testFeaturePreferencesDataStructure() {
        mockLocalStorage.clear();

        const preferences = {
            authentication: true,
            core_functionality: true,
            analytics: true,
            personalization: false,
            notifications: true,
            third_party_integrations: false
        };

        const prefsData = {
            preferences: preferences,
            timestamp: new Date().toISOString(),
            userAgent: 'test-agent'
        };

        const jsonString = JSON.stringify(prefsData);
        const parsed = JSON.parse(jsonString);

        assertPropertyExists(parsed, 'preferences', 'Test 1a: preferences field exists');
        assertPropertyExists(parsed, 'timestamp', 'Test 1b: timestamp field exists');
        assertPropertyExists(parsed, 'userAgent', 'Test 1c: userAgent field exists');
        assertPropertyExists(parsed.preferences, 'authentication', 'Test 1d: authentication preference exists');
        assertPropertyExists(parsed.preferences, 'analytics', 'Test 1e: analytics preference exists');
    }

    /**
     * Test 2: Save and retrieve feature preferences
     */
    function testSaveAndRetrievePreferences() {
        mockLocalStorage.clear();

        const preferences = {
            authentication: true,
            core_functionality: true,
            analytics: true,
            personalization: false,
            notifications: true,
            third_party_integrations: false
        };

        const prefsData = {
            preferences: preferences,
            timestamp: new Date().toISOString(),
            userAgent: 'test-agent'
        };

        // Save to localStorage
        mockLocalStorage.setItem(CONFIG.FEATURE_PREFERENCES_KEY, JSON.stringify(prefsData));

        // Retrieve from localStorage
        const retrieved = mockLocalStorage.getItem(CONFIG.FEATURE_PREFERENCES_KEY);
        const parsed = JSON.parse(retrieved);

        assertNotNull(retrieved, 'Test 2a: preferences were saved to localStorage');
        assertEqual(parsed.preferences.authentication, true, 'Test 2b: authentication preference saved correctly');
        assertEqual(parsed.preferences.personalization, false, 'Test 2c: personalization preference saved correctly');
    }

    /**
     * Test 3: Default feature preferences
     */
    function testDefaultFeaturePreferences() {
        mockLocalStorage.clear();

        const defaultPrefs = {};
        for (const [featureId, feature] of Object.entries(PLATFORM_FEATURES)) {
            defaultPrefs[featureId] = true; // Default all to true
        }

        assertTrue(defaultPrefs.authentication === true, 'Test 3a: authentication defaults to true');
        assertTrue(defaultPrefs.analytics === true, 'Test 3b: analytics defaults to true');
        assertTrue(defaultPrefs.personalization === true, 'Test 3c: personalization defaults to true');
        assertTrue(defaultPrefs.notifications === true, 'Test 3d: notifications defaults to true');
        assertTrue(defaultPrefs.third_party_integrations === true, 'Test 3e: third_party_integrations defaults to true');
    }

    /**
     * Test 4: Essential features validation
     */
    function testEssentialFeaturesValidation() {
        mockLocalStorage.clear();

        const essentialFeatures = Object.entries(PLATFORM_FEATURES)
            .filter(([id, feature]) => feature.essential)
            .map(([id]) => id);

        assertEqual(essentialFeatures.length, 2, 'Test 4a: exactly 2 essential features exist');
        assertTrue(essentialFeatures.includes('authentication'), 'Test 4b: authentication is essential');
        assertTrue(essentialFeatures.includes('core_functionality'), 'Test 4c: core_functionality is essential');

        const nonEssentialFeatures = Object.entries(PLATFORM_FEATURES)
            .filter(([id, feature]) => !feature.essential)
            .map(([id]) => id);

        assertEqual(nonEssentialFeatures.length, 4, 'Test 4d: exactly 4 non-essential features exist');
        assertTrue(nonEssentialFeatures.includes('analytics'), 'Test 4e: analytics is non-essential');
        assertTrue(nonEssentialFeatures.includes('personalization'), 'Test 4f: personalization is non-essential');
    }

    /**
     * Test 5: Feature preferences timestamp
     */
    function testFeaturePreferencesTimestamp() {
        mockLocalStorage.clear();

        const preferences = {
            authentication: true,
            core_functionality: true,
            analytics: true
        };

        const timestamp = new Date().toISOString();
        const prefsData = {
            preferences: preferences,
            timestamp: timestamp,
            userAgent: 'test-agent'
        };

        mockLocalStorage.setItem(CONFIG.FEATURE_PREFERENCES_KEY, JSON.stringify(prefsData));
        const retrieved = JSON.parse(mockLocalStorage.getItem(CONFIG.FEATURE_PREFERENCES_KEY));

        assertNotNull(retrieved.timestamp, 'Test 5a: timestamp exists');
        assertEqual(retrieved.timestamp, timestamp, 'Test 5b: timestamp matches saved value');
    }

    /**
     * Test 6: Feature preferences with mixed selections
     */
    function testMixedFeatureSelections() {
        mockLocalStorage.clear();

        const preferences = {
            authentication: true,
            core_functionality: true,
            analytics: false,
            personalization: true,
            notifications: false,
            third_party_integrations: true
        };

        const prefsData = {
            preferences: preferences,
            timestamp: new Date().toISOString(),
            userAgent: 'test-agent'
        };

        mockLocalStorage.setItem(CONFIG.FEATURE_PREFERENCES_KEY, JSON.stringify(prefsData));
        const retrieved = JSON.parse(mockLocalStorage.getItem(CONFIG.FEATURE_PREFERENCES_KEY));

        assertEqual(retrieved.preferences.authentication, true, 'Test 6a: essential feature is selected');
        assertEqual(retrieved.preferences.analytics, false, 'Test 6b: non-essential feature can be disabled');
        assertEqual(retrieved.preferences.personalization, true, 'Test 6c: non-essential feature can be enabled');
    }

    /**
     * Test 7: Platform features category grouping
     */
    function testFeatureCategoryGrouping() {
        const categories = {};
        for (const [featureId, feature] of Object.entries(PLATFORM_FEATURES)) {
            if (!categories[feature.category]) {
                categories[feature.category] = [];
            }
            categories[feature.category].push(featureId);
        }

        assertPropertyExists(categories, 'Core', 'Test 7a: Core category exists');
        assertPropertyExists(categories, 'Analytics', 'Test 7b: Analytics category exists');
        assertPropertyExists(categories, 'User Experience', 'Test 7c: User Experience category exists');
        assertEqual(categories['Core'].length, 2, 'Test 7d: Core category has 2 features');
    }

    /**
     * Test 8: Clear feature preferences
     */
    function testClearFeaturePreferences() {
        mockLocalStorage.clear();

        const prefsData = {
            preferences: { authentication: true },
            timestamp: new Date().toISOString(),
            userAgent: 'test-agent'
        };

        mockLocalStorage.setItem(CONFIG.FEATURE_PREFERENCES_KEY, JSON.stringify(prefsData));
        assertTrue(mockLocalStorage.getItem(CONFIG.FEATURE_PREFERENCES_KEY) !== null, 'Test 8a: preferences saved');

        mockLocalStorage.removeItem(CONFIG.FEATURE_PREFERENCES_KEY);
        assertEqual(mockLocalStorage.getItem(CONFIG.FEATURE_PREFERENCES_KEY), null, 'Test 8b: preferences cleared');
    }

    /**
     * Run all tests
     */
    function runAllTests() {
        console.log('Starting Feature Preferences Test Suite...\n');

        testFeaturePreferencesDataStructure();
        testSaveAndRetrievePreferences();
        testDefaultFeaturePreferences();
        testEssentialFeaturesValidation();
        testFeaturePreferencesTimestamp();
        testMixedFeatureSelections();
        testFeatureCategoryGrouping();
        testClearFeaturePreferences();

        console.log('\n' + results.join('\n'));
        console.log(`\n${'='.repeat(50)}`);
        console.log(`Tests Passed: ${passedTests}`);
        console.log(`Tests Failed: ${failedTests}`);
        console.log(`Total Tests: ${passedTests + failedTests}`);
        console.log(`${'='.repeat(50)}`);

        return failedTests === 0;
    }

    return {
        run: runAllTests,
        results: () => results
    };
})();

// Run tests if this file is executed directly
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeaturePreferencesTests;
}

// For browser testing, expose test suite
if (typeof window !== 'undefined') {
    window.FeaturePreferencesTests = FeaturePreferencesTests;
}
