/**
 * Health Monitor JavaScript
 * Handles polling the backend health endpoint and updating the UI
 */

class HealthMonitor {
    constructor() {
        // Configuration
        this.apiEndpoint = 'http://localhost/7-health-check/api.php';
        this.pollInterval = 10000; // 10 seconds
        this.pollTimer = null;
        this.isAutoRefreshing = true;
        this.countdownInterval = null;
        this.countdownValue = 10;

        // DOM elements
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusDot = document.querySelector('.status-dot');
        this.statusText = document.querySelector('.status-text');
        this.statusValue = document.getElementById('statusValue');
        this.timestampValue = document.getElementById('timestampValue');
        this.nextUpdateValue = document.getElementById('nextUpdateValue');
        this.phpEnabledCheck = document.getElementById('phpEnabledCheck');
        this.jsonEnabledCheck = document.getElementById('jsonEnabledCheck');
        this.memoryCurrentCheck = document.getElementById('memoryCurrentCheck');
        this.memoryPeakCheck = document.getElementById('memoryPeakCheck');
        this.phpVersionValue = document.getElementById('phpVersionValue');
        this.apiVersionValue = document.getElementById('apiVersionValue');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.toggleAutoRefreshBtn = document.getElementById('toggleAutoRefresh');
        this.lastCheckTime = document.getElementById('lastCheckTime');

        // Event listeners
        this.refreshBtn.addEventListener('click', () => this.fetchHealthStatus());
        this.toggleAutoRefreshBtn.addEventListener('click', () => this.toggleAutoRefresh());

        // Initial fetch and setup polling
        this.fetchHealthStatus();
        this.setupPolling();
    }

    /**
     * Fetch health status from the API
     */
    async fetchHealthStatus() {
        try {
            this.showLoading();
            this.hideError();

            const response = await fetch(this.apiEndpoint);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.updateUI(data);
            this.resetCountdown();
            this.updateLastCheckTime();
        } catch (error) {
            console.error('Error fetching health status:', error);
            this.showError(`Failed to fetch health status: ${error.message}`);
            this.setErrorState();
        }
    }

    /**
     * Update the UI with health data
     */
    updateUI(data) {
        // Update status
        const status = data.status || 'unknown';
        this.statusValue.textContent = status;
        this.updateStatusIndicator(status);

        // Update timestamp
        if (data.timestamp) {
            this.timestampValue.textContent = this.formatTimestamp(data.timestamp);
        }

        // Update checks
        if (data.checks) {
            this.updateCheckStatus('phpEnabledCheck', data.checks.php_enabled);
            this.updateCheckStatus('jsonEnabledCheck', data.checks.json_enabled);

            if (data.checks.memory_usage) {
                this.memoryCurrentCheck.textContent = data.checks.memory_usage.current || '--';
                this.memoryPeakCheck.textContent = data.checks.memory_usage.peak || '--';
            }
        }

        // Update version information
        if (data.version) {
            this.phpVersionValue.textContent = data.version.php || '--';
            this.apiVersionValue.textContent = data.version.api || '--';
        }
    }

    /**
     * Update the status indicator (color and text)
     */
    updateStatusIndicator(status) {
        // Remove all status classes
        this.statusDot.classList.remove('ok', 'error', 'loading');

        if (status === 'ok' || status === 'healthy') {
            this.statusDot.classList.add('ok');
            this.statusText.textContent = '✓ Healthy';
            this.statusText.style.color = '#4caf50';
        } else if (status === 'error') {
            this.statusDot.classList.add('error');
            this.statusText.textContent = '✗ Error';
            this.statusText.style.color = '#f44336';
        } else {
            this.statusDot.classList.add('loading');
            this.statusText.textContent = '⚠ Unknown';
            this.statusText.style.color = '#ff9800';
        }
    }

    /**
     * Update individual check status display
     */
    updateCheckStatus(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('enabled', 'disabled');

            if (value === true || value === 1) {
                element.textContent = '✓ Yes';
                element.classList.add('enabled');
            } else if (value === false || value === 0) {
                element.textContent = '✗ No';
                element.classList.add('disabled');
            } else {
                element.textContent = '--';
            }
        }
    }

    /**
     * Format timestamp to readable format
     */
    formatTimestamp(timestamp) {
        try {
            const date = new Date(timestamp);
            return date.toLocaleString();
        } catch (e) {
            return timestamp;
        }
    }

    /**
     * Update the last check time
     */
    updateLastCheckTime() {
        const now = new Date();
        this.lastCheckTime.textContent = now.toLocaleTimeString();
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.statusDot.classList.add('loading');
        this.statusDot.classList.remove('ok', 'error');
        this.statusText.textContent = 'Loading...';
    }

    /**
     * Show error state
     */
    setErrorState() {
        this.statusDot.classList.add('error');
        this.statusDot.classList.remove('ok', 'loading');
        this.statusText.textContent = '✗ Error';
        this.statusText.style.color = '#f44336';
        this.statusValue.textContent = 'error';
    }

    /**
     * Show error message
     */
    showError(message) {
        this.errorMessage.style.display = 'block';
        this.errorText.textContent = message;
    }

    /**
     * Hide error message
     */
    hideError() {
        this.errorMessage.style.display = 'none';
    }

    /**
     * Setup automatic polling
     */
    setupPolling() {
        if (this.isAutoRefreshing) {
            this.pollTimer = setInterval(() => {
                this.fetchHealthStatus();
            }, this.pollInterval);

            this.startCountdown();
        }
    }

    /**
     * Clear polling
     */
    clearPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }

        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    /**
     * Start countdown to next update
     */
    startCountdown() {
        this.countdownValue = this.pollInterval / 1000;

        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        this.updateCountdownDisplay();

        this.countdownInterval = setInterval(() => {
            this.countdownValue--;
            this.updateCountdownDisplay();

            if (this.countdownValue <= 0) {
                this.countdownValue = this.pollInterval / 1000;
            }
        }, 1000);
    }

    /**
     * Reset countdown
     */
    resetCountdown() {
        this.countdownValue = this.pollInterval / 1000;
        this.updateCountdownDisplay();

        if (this.isAutoRefreshing) {
            this.startCountdown();
        }
    }

    /**
     * Update countdown display
     */
    updateCountdownDisplay() {
        this.nextUpdateValue.textContent = this.countdownValue + 's';
    }

    /**
     * Toggle auto-refresh
     */
    toggleAutoRefresh() {
        this.isAutoRefreshing = !this.isAutoRefreshing;
        const btn = this.toggleAutoRefreshBtn;

        if (this.isAutoRefreshing) {
            btn.textContent = 'Pause Auto-Refresh';
            btn.classList.remove('paused');
            this.setupPolling();
        } else {
            btn.textContent = 'Resume Auto-Refresh';
            btn.classList.add('paused');
            this.clearPolling();
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.healthMonitor = new HealthMonitor();
});
