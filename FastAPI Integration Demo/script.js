// Get API URL from input
function getApiUrl() {
    const apiUrlInput = document.getElementById('apiUrl');
    return apiUrlInput.value.trim() || 'http://localhost:8000';
}

// Update backend URL display in footer
function updateBackendUrl() {
    document.getElementById('backendUrl').textContent = getApiUrl();
}

// Log API response to the log container
function logResponse(endpoint, method, status, data) {
    const logContainer = document.getElementById('responseLog');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${status >= 200 && status < 300 ? 'success' : 'error'}`;

    logEntry.innerHTML = `
        <div class="log-header">
            <span class="log-time">${timestamp}</span>
            <span class="log-method">${method}</span>
            <span class="log-endpoint">${endpoint}</span>
            <span class="log-status status-${Math.floor(status / 100)}xx">${status}</span>
        </div>
        <pre class="log-data">${JSON.stringify(data, null, 2)}</pre>
    `;

    logContainer.insertBefore(logEntry, logContainer.firstChild);
}

// Clear log
function clearLog() {
    document.getElementById('responseLog').innerHTML = '';
}

// Display result in a result box
function displayResult(elementId, data, isError = false) {
    const element = document.getElementById(elementId);
    element.className = `result-box ${isError ? 'error' : 'success'}`;
    element.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

// Display error
function displayError(elementId, error) {
    const element = document.getElementById(elementId);
    element.className = 'result-box error';
    element.innerHTML = `<p><strong>Error:</strong> ${error.message || error}</p>`;
}

// Test API Connection
async function testConnection() {
    const statusElement = document.getElementById('connectionStatus');
    const apiUrl = getApiUrl();
    updateBackendUrl();

    try {
        statusElement.className = 'status-message loading';
        statusElement.textContent = 'Testing connection...';

        const response = await fetch(`${apiUrl}/health`);
        const data = await response.json();

        if (response.ok) {
            statusElement.className = 'status-message success';
            statusElement.textContent = `✓ Connected successfully! Status: ${data.status}`;
            logResponse('/health', 'GET', response.status, data);
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        statusElement.className = 'status-message error';
        statusElement.textContent = `✗ Connection failed: ${error.message}`;
        logResponse('/health', 'GET', 0, { error: error.message });
    }
}

// GET All Items
async function getAllItems() {
    const apiUrl = getApiUrl();
    const resultElement = 'itemsResult';

    try {
        const response = await fetch(`${apiUrl}/items`);
        const data = await response.json();

        if (response.ok) {
            displayResult(resultElement, data);
            logResponse('/items', 'GET', response.status, data);
        } else {
            throw new Error(data.detail || 'Failed to fetch items');
        }
    } catch (error) {
        displayError(resultElement, error);
        logResponse('/items', 'GET', 0, { error: error.message });
    }
}

// GET Item by ID
async function getItemById() {
    const apiUrl = getApiUrl();
    const itemId = document.getElementById('itemId').value;
    const resultElement = 'itemByIdResult';

    if (!itemId) {
        displayError(resultElement, { message: 'Please enter an item ID' });
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/items/${itemId}`);
        const data = await response.json();

        if (response.ok) {
            displayResult(resultElement, data);
            logResponse(`/items/${itemId}`, 'GET', response.status, data);
        } else {
            throw new Error(data.detail || 'Item not found');
        }
    } catch (error) {
        displayError(resultElement, error);
        logResponse(`/items/${itemId}`, 'GET', 0, { error: error.message });
    }
}

// Check Health
async function checkHealth() {
    const apiUrl = getApiUrl();
    const resultElement = 'healthResult';

    try {
        const response = await fetch(`${apiUrl}/health`);
        const data = await response.json();

        if (response.ok) {
            displayResult(resultElement, data);
            logResponse('/health', 'GET', response.status, data);
        } else {
            throw new Error('Health check failed');
        }
    } catch (error) {
        displayError(resultElement, error);
        logResponse('/health', 'GET', 0, { error: error.message });
    }
}

// Create New Item
async function createItem(event) {
    event.preventDefault();
    const apiUrl = getApiUrl();
    const resultElement = 'createItemResult';

    const itemData = {
        name: document.getElementById('itemName').value,
        description: document.getElementById('itemDescription').value,
        price: parseFloat(document.getElementById('itemPrice').value)
    };

    try {
        const response = await fetch(`${apiUrl}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });

        const data = await response.json();

        if (response.ok) {
            displayResult(resultElement, data);
            logResponse('/items', 'POST', response.status, data);
            document.getElementById('createItemForm').reset();
        } else {
            throw new Error(data.detail || 'Failed to create item');
        }
    } catch (error) {
        displayError(resultElement, error);
        logResponse('/items', 'POST', 0, { error: error.message });
    }
}

// Send Greeting
async function sendGreeting(event) {
    event.preventDefault();
    const apiUrl = getApiUrl();
    const resultElement = 'greetResult';

    const greetData = {
        message: document.getElementById('greetMessage').value,
        name: document.getElementById('greetName').value
    };

    try {
        const response = await fetch(`${apiUrl}/greet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(greetData)
        });

        const data = await response.json();

        if (response.ok) {
            displayResult(resultElement, data);
            logResponse('/greet', 'POST', response.status, data);
            document.getElementById('greetForm').reset();
        } else {
            throw new Error(data.detail || 'Failed to send greeting');
        }
    } catch (error) {
        displayError(resultElement, error);
        logResponse('/greet', 'POST', 0, { error: error.message });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateBackendUrl();

    // Update backend URL when input changes
    document.getElementById('apiUrl').addEventListener('change', updateBackendUrl);
});
