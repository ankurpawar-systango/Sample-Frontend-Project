/**
 * Contact Manager App Script
 *
 * Manages contacts stored in localStorage with cookie/preference consent validation.
 * DL-14: Implements cookie segregation - preferences category
 *
 * Features:
 * - Add, delete, and display contacts
 * - Persistent storage with localStorage
 * - Consent validation before storing preferences
 * - User notification when consent is required
 */

// Configuration
const CONFIG = {
    STORAGE_KEY: 'contacts',
    CONSENT_PREFS_KEY: 'cookiePreferences',
    BACKEND_URL: localStorage.getItem('backendUrl') || 'http://localhost:3000'
};

// Storage Categories
const STORAGE_CATEGORY = {
    ESSENTIAL: 'essential',
    PREFERENCES: 'preferences'
};

// object for storing a contacts in array for localstorage
let contacts = [];

/**
 * DL-14: Get the current consent level
 * @returns {Object} The user's consent preferences
 */
function getConsentLevel() {
    const saved = localStorage.getItem(CONFIG.CONSENT_PREFS_KEY);
    if (saved) {
        try {
            const prefs = JSON.parse(saved);
            return {
                essential: true,
                performance: prefs.performance || false,
                preferences: prefs.preferences || false
            };
        } catch (e) {
            console.error('Error parsing consent preferences:', e);
        }
    }
    return {
        essential: true,
        performance: false,
        preferences: false
    };
}

/**
 * DL-14: Check if storage operation is allowed based on consent
 * @param {string} category - The storage category (essential, preferences)
 * @returns {boolean} True if operation is allowed
 */
function canUseStorage(category) {
    const consent = getConsentLevel();

    if (category === STORAGE_CATEGORY.ESSENTIAL) {
        return true;
    }

    if (category === STORAGE_CATEGORY.PREFERENCES) {
        return consent.preferences === true;
    }

    return false;
}

/**
 * DL-14: Show notification when consent is required
 * @param {string} category - The required storage category
 */
function showConsentRequiredNotification(category) {
    const message = category === STORAGE_CATEGORY.PREFERENCES
        ? 'Contact storage requires your preference consent. Your contacts cannot be saved.'
        : 'Storage operation requires consent.';

    console.warn('DL-14: ' + message);

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'info',
            title: 'Consent Required',
            text: message,
            confirmButtonColor: '#667eea',
            confirmButtonText: 'OK'
        });
    } else {
        alert(message);
    }
}

/**
 * DL-14: Safely load contacts from localStorage with consent validation
 * @returns {Array} Array of contacts or empty array if consent not given
 */
function loadContactsWithConsent() {
    if (!canUseStorage(STORAGE_CATEGORY.PREFERENCES)) {
        console.log('DL-14: Contact loading blocked - preference consent not given');
        return [];
    }

    try {
        const ref = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (ref) {
            return JSON.parse(ref);
        }
    } catch (e) {
        console.error('DL-14: Error loading contacts:', e);
    }

    return [];
}

/**
 * DL-14: Safely save contacts to localStorage with consent validation
 * @param {Array} contactsToSave - Array of contacts to save
 * @returns {boolean} True if saved successfully
 */
function saveContactsWithConsent(contactsToSave) {
    if (!canUseStorage(STORAGE_CATEGORY.PREFERENCES)) {
        console.log('DL-14: Contact saving blocked - preference consent not given');
        showConsentRequiredNotification(STORAGE_CATEGORY.PREFERENCES);
        return false;
    }

    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(contactsToSave));
        return true;
    } catch (e) {
        console.error('DL-14: Error saving contacts:', e);
        return false;
    }
}

function renderContact(contact) {
    /* DL-14: Save with consent validation */
    const saved = saveContactsWithConsent(contacts);

    if (!saved && contacts.length > 0) {
        console.warn('DL-14: Contact was not persisted due to missing consent');
    }

    // selecting the list where we will appending a all node items
    const list = document.querySelector(".Contact_list");

    const item = document.querySelector(`[data-key='${contact.id}']`);

    if (contact.deleted) {
        // remove the item from the DOM
        item.remove();
        return;
    }

    // creating new element article
    const node = document.createElement("article");
    node.setAttribute("class", "person");
    node.setAttribute("data-key", contact.id);
    node.innerHTML = `
<img src="${contact.imageurl}">
<div class="contactdetail">
<h1><i class="fas fa-user-circle contactIcon"></i> ${contact.name}</h1>
<p> <i class="fas fa-envelope contactIcon"></i> ${contact.email}</p>
<p><i class="fas fa-phone-alt contactIcon"></i> ${contact.contactnumber}  </p>
</div>
    <button class="delete-contact js-delete-contact">
        <svg fill="var(--svgcolor)" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
    </button>
`;
    list.append(node);
}

const list = document.querySelector(".Contact_list");
list.addEventListener("click", (event) => {
    if (event.target.classList.contains("js-delete-contact")) {
        const itemKey = event.target.parentElement.dataset.key;
        deleteContact(itemKey);
    }
});

function deleteContact(key) {
    // DL-14: Check consent before deleting
    if (!canUseStorage(STORAGE_CATEGORY.PREFERENCES)) {
        console.warn('DL-14: Delete operation blocked - preference consent not given');
        showConsentRequiredNotification(STORAGE_CATEGORY.PREFERENCES);
        return;
    }

    const index = contacts.findIndex((item) => item.id === Number(key));
    const UpdatedContactObject = {
        deleted: true,
        ...contacts[index],
    };
    contacts = contacts.filter((item) => item.id !== Number(key));
    renderContact(UpdatedContactObject);
}

function addContact(name, email, imageurl, contactnumber, id) {
    // DL-14: Check consent before adding
    if (!canUseStorage(STORAGE_CATEGORY.PREFERENCES)) {
        console.warn('DL-14: Add contact operation blocked - preference consent not given');
        showConsentRequiredNotification(STORAGE_CATEGORY.PREFERENCES);
        return;
    }

    const contactObject = {
        name: document.getElementById("fullName").value,
        email: document.getElementById("myEmail").value,
        imageurl: document.getElementById("imgurl").value,
        contactnumber: document.getElementById("myTel").value,
        id: Date.now(),
    };

    contacts.push(contactObject);
    renderContact(contactObject);
}

const form = document.querySelector(".js-form");
form.addEventListener("submit", (event) => {
    event.preventDefault();
    addContact();
    form.reset();
});

// DL-14: Load contacts with consent validation on page load
document.addEventListener("DOMContentLoaded", () => {
    contacts = loadContactsWithConsent();

    if (contacts.length > 0) {
        contacts.forEach((t) => {
            renderContact(t);
        });
    } else if (!canUseStorage(STORAGE_CATEGORY.PREFERENCES)) {
        console.log('DL-14: Contacts not loaded - preference consent required for storage');
    }
});
