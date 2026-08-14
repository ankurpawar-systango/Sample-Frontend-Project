/**
 * Tutor Profile Page Script
 *
 * Handles fetching tutor data from the backend API and displaying
 * tutor information in a responsive grid layout.
 *
 * Features:
 * - Fetch tutors from backend API
 * - Display tutor information (name, email, bio, about)
 * - Responsive grid layout
 * - Loading state
 * - Error handling
 * - Badge for the first tutor on the platform
 */

// Configuration
const CONFIG = {
    // Backend API URL - can be configured as needed
    BACKEND_URL: localStorage.getItem('backendUrl') || 'http://localhost:3000',
    TUTOR_API_ENDPOINT: '/6-tutor/get/',
};

// DOM Elements
const tutorsContainer = document.getElementById('tutorsContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const emptyState = document.getElementById('emptyState');

/**
 * Initialize page - fetch and display tutors
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('Tutor Profile page initialized');
    fetchAndDisplayTutors();
});

/**
 * Fetch tutors from backend API
 */
async function fetchAndDisplayTutors() {
    try {
        // Show loading state
        showLoadingState();

        // Fetch tutors from API
        const tutors = await fetchTutors();

        // Hide loading state
        hideLoadingState();

        // Check if tutors were fetched successfully
        if (!tutors || tutors.length === 0) {
            showEmptyState();
            return;
        }

        // Display tutors
        displayTutors(tutors);
    } catch (error) {
        console.error('Error fetching tutors:', error);
        hideLoadingState();
        showErrorState(error.message);
    }
}

/**
 * Fetch tutors from the backend API
 * @returns {Promise<Array>} Array of tutor objects
 */
async function fetchTutors() {
    // Try multiple possible backend URLs
    const possibleUrls = [
        `${CONFIG.BACKEND_URL}${CONFIG.TUTOR_API_ENDPOINT}`,
        `http://localhost/6-tutor/get/`,
        `http://localhost:8000/6-tutor/get/`,
        `http://localhost:3000/6-tutor/get/`,
        `${CONFIG.TUTOR_API_ENDPOINT}`,
    ];

    let lastError;

    for (const url of possibleUrls) {
        try {
            console.log(`Attempting to fetch from: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
                continue;
            }

            const data = await response.json();

            if (data.success && data.data) {
                console.log('Successfully fetched tutors:', data.data);
                return Array.isArray(data.data) ? data.data : [data.data];
            } else {
                lastError = new Error(data.message || 'API returned unsuccessful response');
                continue;
            }
        } catch (error) {
            lastError = error;
            console.warn(`Failed to fetch from ${url}:`, error.message);
            continue;
        }
    }

    // If all attempts failed, throw the last error or a generic message
    throw lastError || new Error(
        'Unable to connect to the tutors API. Please ensure the backend service is running.'
    );
}

/**
 * Display tutors in the grid
 * @param {Array} tutors - Array of tutor objects
 */
function displayTutors(tutors) {
    // Clear container
    tutorsContainer.innerHTML = '';

    // Create a card for each tutor
    tutors.forEach((tutor) => {
        const tutorCard = createTutorCard(tutor);
        tutorsContainer.appendChild(tutorCard);
    });

    // Show container, hide empty state
    tutorsContainer.style.display = 'grid';
    emptyState.style.display = 'none';
}

/**
 * Create a tutor card element
 * @param {Object} tutor - Tutor object
 * @returns {HTMLElement} Tutor card element
 */
function createTutorCard(tutor) {
    const card = document.createElement('div');
    card.className = 'tutor-card';

    const header = document.createElement('div');
    header.className = 'tutor-card-header';

    const name = document.createElement('h3');
    name.className = 'tutor-name';
    name.textContent = tutor.name || 'Unknown Tutor';

    const email = document.createElement('p');
    email.className = 'tutor-email';
    email.textContent = tutor.email || 'No email provided';

    header.appendChild(name);
    header.appendChild(email);

    // Add first tutor badge if applicable
    if (tutor.is_first_tutor) {
        const badge = document.createElement('span');
        badge.className = 'first-tutor-badge';
        badge.textContent = '⭐ The Very First Tutor on This Site';
        header.appendChild(badge);
    }

    const body = document.createElement('div');
    body.className = 'tutor-card-body';

    // Bio section
    if (tutor.bio) {
        const bioLabel = document.createElement('label');
        bioLabel.className = 'tutor-bio-label';
        bioLabel.textContent = 'Bio';

        const bioText = document.createElement('p');
        bioText.className = 'tutor-bio';
        bioText.textContent = tutor.bio;

        body.appendChild(bioLabel);
        body.appendChild(bioText);
    }

    // About section
    if (tutor.about) {
        const aboutLabel = document.createElement('label');
        aboutLabel.className = 'tutor-about-label';
        aboutLabel.textContent = 'About';

        const aboutText = document.createElement('p');
        aboutText.className = 'tutor-about';
        aboutText.textContent = tutor.about;

        body.appendChild(aboutLabel);
        body.appendChild(aboutText);
    }

    // Footer with action links
    const footer = document.createElement('div');
    footer.className = 'tutor-card-footer';

    const contactLink = document.createElement('a');
    contactLink.href = 'mailto:' + (tutor.email || '#');
    contactLink.textContent = '📧 Contact';

    const profileLink = document.createElement('a');
    profileLink.href = '#profile';
    profileLink.textContent = '👤 Profile';

    footer.appendChild(contactLink);
    footer.appendChild(profileLink);

    // Assemble card
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);

    return card;
}

/**
 * Show loading state
 */
function showLoadingState() {
    loadingSpinner.style.display = 'flex';
    tutorsContainer.style.display = 'none';
    errorMessage.style.display = 'none';
    emptyState.style.display = 'none';
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    loadingSpinner.style.display = 'none';
}

/**
 * Show error state
 * @param {string} message - Error message
 */
function showErrorState(message) {
    errorText.textContent = message || 'Failed to load tutor profiles. Please try again later.';
    errorMessage.style.display = 'flex';
    tutorsContainer.style.display = 'none';
    emptyState.style.display = 'none';
}

/**
 * Show empty state
 */
function showEmptyState() {
    emptyState.style.display = 'block';
    tutorsContainer.style.display = 'none';
    errorMessage.style.display = 'none';
}
