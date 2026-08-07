/**
 * Health Status Dashboard
 *
 * Fetches and displays backend health status
 * with auto-refresh and history tracking
 */

class HealthStatusDashboard {
    constructor() {
        this.backendUrl = 'http://localhost/sample-backend-projects/7-health/health.php';
        this.autoRefreshEnabled = true;
        this.refreshInterval = 5000; // 5 seconds default
        this.refreshTimerId = null;
        this.checkHistory = [];
        this.maxHistoryItems = 20;

        this.initializeElements();
        this.attachEventListeners();
        this.loadHistoryFromStorage();
        this.performHealthCheck();
        this.startAutoRefresh();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        this.statusBadge = document.getElementById('statusBadge');
        this.statusText = document.getElementById('statusText');
        this.messageText = document.getElementById('messageText');
        this.timestampText = document.getElementById('timestampText');
        this.responseTimeText = document.getElementById('responseTimeText');
        this.phpVersionText = document.getElementById('phpVersionText');
        this.statusIcon = document.getElementById('statusIcon');
        this.statusDetails = document.querySelector('.status-details');
        this.historyContainer = document.getElementById('historyContainer');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.refreshIntervalInput = document.getElementById('refreshInterval');
        this.autoRefreshToggle = document.getElementById('autoRefreshToggle');
        this.endpointUrl = document.getElementById('endpointUrl');
    }

    /**
     * Attach event listeners to UI elements
     */
    attachEventListeners() {
        this.refreshBtn.addEventListener('click', () => this.performHealthCheck());
        this.clearBtn.addEventListener('click', () => this.clearHistory());
        this.refreshIntervalInput.addEventListener('change', (e) => this.updateRefreshInterval(e));
        this.autoRefreshToggle.addEventListener('change', (e) => this.toggleAutoRefresh(e));
    }

    /**
     * Perform a health check by fetching from backend
     */
    performHealthCheck() {
        this.updateStatus('loading', 'Checking health status...');

        fetch(this.backendUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-cache'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => this.handleHealthResponse(data))
            .catch(error => this.handleHealthError(error));
    }

    /**
     * Handle successful health check response
     *
     * @param {Object} data - Response data from backend
     */
    handleHealthResponse(data) {
        const isHealthy = data.status === 'healthy';

        // Update UI with response data
        this.statusText.textContent = data.status || 'Unknown';
        this.messageText.textContent = data.message || 'No message';
        this.timestampText.textContent = data.timestamp || '--:--:--';
        this.responseTimeText.textContent = data.responseTime || '-- ms';
        this.phpVersionText.textContent = data.php_version || 'Unknown';

        // Update visual indicators
        this.updateStatus(
            isHealthy ? 'healthy' : 'unhealthy',
            data.message
        );

        // Add to history
        this.addToHistory({
            status: data.status,
            message: data.message,
            timestamp: data.timestamp,
            responseTime: data.responseTime
        });

        // Show success notification
        this.showNotification(
            'Health Check Complete',
            `Backend is ${isHealthy ? 'healthy' : 'unhealthy'}`,
            isHealthy ? 'success' : 'error'
        );
    }

    /**
     * Handle health check error
     *
     * @param {Error} error - Error object
     */
    handleHealthError(error) {
        console.error('Health check error:', error);

        this.statusText.textContent = 'Error';
        this.messageText.textContent = error.message;
        this.timestampText.textContent = new Date().toLocaleString();
        this.responseTimeText.textContent = '-- ms';

        this.updateStatus('error', `Error: ${error.message}`);

        // Add to history
        this.addToHistory({
            status: 'error',
            message: error.message,
            timestamp: new Date().toLocaleString(),
            responseTime: '-- ms'
        });

        // Show error notification
        this.showNotification(
            'Health Check Failed',
            error.message,
            'error'
        );
    }

    /**
     * Update status display elements
     *
     * @param {String} status - Status type: 'healthy', 'unhealthy', 'error', 'loading'
     * @param {String} message - Status message
     */
    updateStatus(status, message) {
        // Update badge
        this.statusBadge.className = 'badge';

        switch (status) {
            case 'healthy':
                this.statusBadge.classList.add('bg-success');
                this.statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> Healthy';
                this.statusIcon.classList.remove('unhealthy');
                this.statusIcon.classList.add('healthy');
                this.statusIcon.innerHTML = '<i class="fas fa-check-circle fa-3x"></i>';
                this.statusDetails.classList.add('healthy');
                this.statusDetails.classList.remove('unhealthy');
                break;

            case 'unhealthy':
                this.statusBadge.classList.add('bg-danger');
                this.statusBadge.innerHTML = '<i class="fas fa-exclamation-circle"></i> Unhealthy';
                this.statusIcon.classList.remove('healthy');
                this.statusIcon.classList.add('unhealthy');
                this.statusIcon.innerHTML = '<i class="fas fa-times-circle fa-3x"></i>';
                this.statusDetails.classList.add('unhealthy');
                this.statusDetails.classList.remove('healthy');
                break;

            case 'error':
                this.statusBadge.classList.add('bg-danger');
                this.statusBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
                this.statusIcon.classList.remove('healthy', 'unhealthy');
                this.statusIcon.innerHTML = '<i class="fas fa-exclamation-triangle fa-3x text-danger"></i>';
                this.statusDetails.classList.remove('healthy', 'unhealthy');
                break;

            case 'loading':
                this.statusBadge.classList.add('bg-secondary');
                this.statusBadge.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                break;
        }
    }

    /**
     * Show notification using SweetAlert2
     *
     * @param {String} title - Notification title
     * @param {String} message - Notification message
     * @param {String} type - Notification type: 'success', 'error', 'info'
     */
    showNotification(title, message, type = 'info') {
        Swal.fire({
            title: title,
            text: message,
            icon: type,
            position: 'top-end',
            timer: 5000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true
        });
    }

    /**
     * Add a health check result to history
     *
     * @param {Object} result - Health check result
     */
    addToHistory(result) {
        // Create history entry with timestamp
        const entry = {
            ...result,
            checkTime: new Date(),
            id: Date.now()
        };

        // Add to beginning of array
        this.checkHistory.unshift(entry);

        // Keep only the latest items
        if (this.checkHistory.length > this.maxHistoryItems) {
            this.checkHistory.pop();
        }

        // Save to localStorage
        this.saveHistoryToStorage();

        // Update display
        this.renderHistory();
    }

    /**
     * Render history items to the DOM
     */
    renderHistory() {
        if (this.checkHistory.length === 0) {
            this.historyContainer.innerHTML = '<p class="text-muted">No checks performed yet</p>';
            return;
        }

        this.historyContainer.innerHTML = this.checkHistory.map(item => `
            <div class="history-item ${item.status}">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <span class="history-badge badge ${item.status === 'healthy' ? 'bg-success' : 'bg-danger'}">
                            ${item.status.toUpperCase()}
                        </span>
                        <p class="mb-0 mt-2"><strong>${item.message}</strong></p>
                        <small class="text-muted">
                            ${this.formatTime(item.checkTime)} | Response: ${item.responseTime}
                        </small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Format a date/time for display
     *
     * @param {Date} date - Date to format
     * @returns {String} Formatted time string
     */
    formatTime(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleTimeString();
    }

    /**
     * Clear history and update display
     */
    clearHistory() {
        if (this.checkHistory.length === 0) {
            this.showNotification('No History', 'There is no history to clear', 'info');
            return;
        }

        Swal.fire({
            title: 'Clear History?',
            text: 'This will delete all check history.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, clear it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                this.checkHistory = [];
                this.saveHistoryToStorage();
                this.renderHistory();
                this.showNotification('Cleared', 'History has been cleared', 'success');
            }
        });
    }

    /**
     * Save history to localStorage
     */
    saveHistoryToStorage() {
        try {
            localStorage.setItem('healthCheckHistory', JSON.stringify(this.checkHistory));
        } catch (error) {
            console.error('Error saving history to localStorage:', error);
        }
    }

    /**
     * Load history from localStorage
     */
    loadHistoryFromStorage() {
        try {
            const stored = localStorage.getItem('healthCheckHistory');
            if (stored) {
                this.checkHistory = JSON.parse(stored);
                // Convert checkTime strings back to Date objects
                this.checkHistory = this.checkHistory.map(item => ({
                    ...item,
                    checkTime: new Date(item.checkTime)
                }));
                this.renderHistory();
            }
        } catch (error) {
            console.error('Error loading history from localStorage:', error);
        }
    }

    /**
     * Update the refresh interval
     *
     * @param {Event} event - Change event from input
     */
    updateRefreshInterval(event) {
        const newInterval = parseInt(event.target.value) * 1000;

        if (newInterval > 0) {
            this.refreshInterval = newInterval;
            if (this.autoRefreshEnabled) {
                this.restartAutoRefresh();
            }
        } else {
            this.stopAutoRefresh();
            this.autoRefreshToggle.checked = false;
        }
    }

    /**
     * Toggle auto-refresh on/off
     *
     * @param {Event} event - Change event from toggle
     */
    toggleAutoRefresh(event) {
        this.autoRefreshEnabled = event.target.checked;

        if (this.autoRefreshEnabled) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }
    }

    /**
     * Start auto-refresh timer
     */
    startAutoRefresh() {
        if (this.refreshTimerId) {
            clearInterval(this.refreshTimerId);
        }

        if (this.autoRefreshEnabled && this.refreshInterval > 0) {
            this.refreshTimerId = setInterval(() => {
                this.performHealthCheck();
            }, this.refreshInterval);
        }
    }

    /**
     * Stop auto-refresh timer
     */
    stopAutoRefresh() {
        if (this.refreshTimerId) {
            clearInterval(this.refreshTimerId);
            this.refreshTimerId = null;
        }
    }

    /**
     * Restart auto-refresh with new interval
     */
    restartAutoRefresh() {
        this.stopAutoRefresh();
        this.startAutoRefresh();
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HealthStatusDashboard();
});
