#!/usr/bin/env python3
"""
Validation script for Health Status Display frontend

Validates:
- HTML structure completeness
- CSS file presence and content
- JavaScript file presence and content
- Required libraries are included
- DOM element IDs match between files
"""

import os
import re
from typing import List, Tuple

class FrontendValidator:
    def __init__(self):
        self.tests_passed = 0
        self.tests_failed = 0
        self.tests = []

    def run_all_validations(self):
        print("=== Health Status Display - Frontend Validation ===\n")

        self.validate_html_file()
        self.validate_css_file()
        self.validate_js_file()
        self.validate_test_file()
        self.validate_dom_id_consistency()
        self.validate_library_includes()
        self.validate_responsive_design()

        self.print_results()

    def validate_html_file(self):
        """Validate index.html structure"""
        test_name = "index.html file exists"
        if not os.path.exists('index.html'):
            self.assert_false(test_name)
            return
        self.assert_true(True, test_name)

        with open('index.html', 'r') as f:
            content = f.read()

        # Check for required HTML elements
        self.assert_true('<!DOCTYPE html>' in content,
                        "index.html has proper DOCTYPE")

        self.assert_true('<title>Health Status Dashboard</title>' in content,
                        "index.html has correct title")

        self.assert_true('<meta' in content and 'viewport' in content,
                        "index.html has viewport meta tag")

        self.assert_true('id="statusBadge"' in content,
                        "index.html contains statusBadge element")

        self.assert_true('id="statusText"' in content,
                        "index.html contains statusText element")

        self.assert_true('id="messageText"' in content,
                        "index.html contains messageText element")

        self.assert_true('id="timestampText"' in content,
                        "index.html contains timestampText element")

        self.assert_true('id="responseTimeText"' in content,
                        "index.html contains responseTimeText element")

        self.assert_true('id="phpVersionText"' in content,
                        "index.html contains phpVersionText element")

        self.assert_true('id="historyContainer"' in content,
                        "index.html contains historyContainer element")

        self.assert_true('id="refreshBtn"' in content,
                        "index.html contains refreshBtn element")

        self.assert_true('id="clearBtn"' in content,
                        "index.html contains clearBtn element")

        self.assert_true('id="refreshInterval"' in content,
                        "index.html contains refreshInterval control")

        self.assert_true('id="autoRefreshToggle"' in content,
                        "index.html contains autoRefreshToggle control")

        self.assert_true('class="container' in content,
                        "index.html uses Bootstrap grid")

        self.assert_true('data-theme' in content or 'theme' in content or 'dark' in content.lower(),
                        "index.html includes theme-related code")

    def validate_css_file(self):
        """Validate style.css structure"""
        test_name = "style.css file exists"
        if not os.path.exists('style.css'):
            self.assert_false(test_name)
            return
        self.assert_true(True, test_name)

        with open('style.css', 'r') as f:
            content = f.read()

        # Check for required CSS
        self.assert_true(':root {' in content,
                        "style.css defines CSS variables")

        self.assert_true('--healthy-color' in content,
                        "style.css defines healthy color variable")

        self.assert_true('--unhealthy-color' in content,
                        "style.css defines unhealthy color variable")

        self.assert_true('.card' in content,
                        "style.css contains card styling")

        self.assert_true('.status-icon' in content,
                        "style.css contains status-icon styling")

        self.assert_true('.history-item' in content,
                        "style.css contains history-item styling")

        self.assert_true('@media' in content,
                        "style.css includes responsive design rules")

        self.assert_true('.form-control' in content or 'input' in content,
                        "style.css styles form controls")

        self.assert_true('.btn' in content,
                        "style.css styles buttons")

        self.assert_true('@keyframes' in content,
                        "style.css includes animations")

    def validate_js_file(self):
        """Validate script.js structure"""
        test_name = "script.js file exists"
        if not os.path.exists('script.js'):
            self.assert_false(test_name)
            return
        self.assert_true(True, test_name)

        with open('script.js', 'r') as f:
            content = f.read()

        # Check for required classes and methods
        self.assert_true('class HealthStatusDashboard' in content,
                        "script.js defines HealthStatusDashboard class")

        self.assert_true('performHealthCheck' in content,
                        "script.js has performHealthCheck method")

        self.assert_true('handleHealthResponse' in content,
                        "script.js has handleHealthResponse method")

        self.assert_true('handleHealthError' in content,
                        "script.js has handleHealthError method")

        self.assert_true('addToHistory' in content,
                        "script.js has addToHistory method")

        self.assert_true('renderHistory' in content,
                        "script.js has renderHistory method")

        self.assert_true('fetch(' in content,
                        "script.js uses fetch API")

        self.assert_true('localStorage' in content,
                        "script.js uses localStorage")

        self.assert_true('Swal.fire' in content or 'SweetAlert' in content,
                        "script.js uses SweetAlert2")

        self.assert_true('DOMContentLoaded' in content,
                        "script.js waits for DOM to load")

        self.assert_true('addEventListener' in content,
                        "script.js attaches event listeners")

        self.assert_true('this.backendUrl' in content,
                        "script.js configures backend URL")

    def validate_test_file(self):
        """Validate test.html structure"""
        test_name = "test.html file exists"
        if not os.path.exists('test.html'):
            self.assert_false(test_name)
            return
        self.assert_true(True, test_name)

        with open('test.html', 'r') as f:
            content = f.read()

        # Check for test structure
        self.assert_true('<!DOCTYPE html>' in content,
                        "test.html has proper DOCTYPE")

        self.assert_true('class TestRunner' in content,
                        "test.html defines TestRunner class")

        self.assert_true('runner.test(' in content,
                        "test.html includes test cases")

        self.assert_true('assertEqual' in content or 'assert' in content,
                        "test.html has assertion methods")

        self.assert_true('test-result' in content,
                        "test.html renders test results")

        self.assert_true('HealthStatusDashboard' in content,
                        "test.html references HealthStatusDashboard class")

    def validate_dom_id_consistency(self):
        """Validate that DOM IDs match between HTML and JavaScript"""
        test_name = "DOM IDs are consistent between files"

        with open('index.html', 'r') as f:
            html_content = f.read()

        with open('script.js', 'r') as f:
            js_content = f.read()

        # Extract ID usage from HTML
        html_ids = set(re.findall(r'id=["\']([^"\']+)["\']', html_content))

        # Check that referenced IDs in JS are in HTML
        js_id_refs = set(re.findall(r'getElementById\(["\']([^"\']+)["\']\)', js_content))

        matching_ids = js_id_refs.intersection(html_ids)
        expected_ids = {'statusBadge', 'statusText', 'messageText', 'timestampText',
                       'responseTimeText', 'phpVersionText', 'historyContainer',
                       'refreshBtn', 'clearBtn', 'refreshInterval', 'autoRefreshToggle',
                       'endpointUrl', 'statusIcon'}

        self.assert_true(expected_ids.issubset(matching_ids),
                        test_name)

    def validate_library_includes(self):
        """Validate that required libraries are included"""
        test_name = "Required libraries are included"

        with open('index.html', 'r') as f:
            html_content = f.read()

        bootstrap_included = 'bootstrap' in html_content.lower()
        fontawesome_included = 'font-awesome' in html_content.lower() or 'fontawesome' in html_content.lower()
        sweetalert_included = 'sweetalert' in html_content.lower() or 'swal' in html_content.lower()
        script_included = '<script src="script.js">' in html_content

        all_included = (bootstrap_included and fontawesome_included and
                       sweetalert_included and script_included)

        self.assert_true(all_included, test_name)

    def validate_responsive_design(self):
        """Validate responsive design features"""
        test_name = "Responsive design is implemented"

        with open('index.html', 'r') as f:
            html_content = f.read()

        with open('style.css', 'r') as f:
            css_content = f.read()

        # Check for responsive features
        has_viewport = 'viewport' in html_content
        has_media_queries = '@media' in css_content
        has_bootstrap_grid = 'col-' in html_content
        has_responsive_classes = ('container-fluid' in html_content or
                                  'row' in html_content)

        responsive_implemented = (has_viewport and has_media_queries and
                                 (has_bootstrap_grid or has_responsive_classes))

        self.assert_true(responsive_implemented, test_name)

    def assert_true(self, condition, test_name):
        if condition:
            self.tests.append({
                'name': test_name,
                'passed': True
            })
            self.tests_passed += 1
        else:
            self.tests.append({
                'name': test_name,
                'passed': False
            })
            self.tests_failed += 1

    def assert_false(self, test_name):
        self.tests.append({
            'name': test_name,
            'passed': False
        })
        self.tests_failed += 1

    def print_results(self):
        print("Validation Results:")
        print("-" * 70)

        for test in self.tests:
            status = "✓ PASS" if test['passed'] else "✗ FAIL"
            print(f"{status} - {test['name']}")

        print("-" * 70)
        total = self.tests_passed + self.tests_failed
        print(f"Total Tests: {total}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_failed}")

        if self.tests_failed == 0:
            print("\n✓ All validations passed!")
            return 0
        else:
            print("\n✗ Some validations failed!")
            return 1

if __name__ == '__main__':
    import sys
    validator = FrontendValidator()
    exit_code = validator.run_all_validations()
    sys.exit(exit_code)
