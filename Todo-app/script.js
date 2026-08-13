/**
 * Todo App Script
 *
 * Manages todo items and theme preferences stored in localStorage with consent validation.
 * DL-14: Implements cookie segregation - preferences category for todos and theme
 *
 * Features:
 * - Add, delete, and toggle todo items
 * - Theme switching (dark/light mode)
 * - Persistent storage with localStorage
 * - Consent validation before storing preferences
 */

// Configuration
const CONFIG = {
    TODO_STORAGE_KEY: 'demoarray',
    THEME_STORAGE_KEY: 'theme',
    CONSENT_PREFS_KEY: 'cookiePreferences',
    STORAGE_CATEGORY: {
        ESSENTIAL: 'essential',
        PREFERENCES: 'preferences'
    }
};

// creating a empty array
let demoarray = [];

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

    if (category === CONFIG.STORAGE_CATEGORY.ESSENTIAL) {
        return true;
    }

    if (category === CONFIG.STORAGE_CATEGORY.PREFERENCES) {
        return consent.preferences === true;
    }

    return false;
}

/**
 * DL-14: Show notification when consent is required
 */
function showConsentRequiredNotification(storageType) {
    const message = `${storageType} requires your preference consent. Your data cannot be saved.`;
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
 * DL-14: Safely save todos with consent validation
 * @returns {boolean} True if saved successfully
 */
function saveTodosWithConsent() {
    if (!canUseStorage(CONFIG.STORAGE_CATEGORY.PREFERENCES)) {
        console.log('DL-14: Todo saving blocked - preference consent not given');
        if (demoarray.length > 0) {
            showConsentRequiredNotification('Todo storage');
        }
        return false;
    }

    try {
        localStorage.setItem(CONFIG.TODO_STORAGE_KEY, JSON.stringify(demoarray));
        return true;
    } catch (e) {
        console.error('DL-14: Error saving todos:', e);
        return false;
    }
}

/**
 * DL-14: Safely load todos with consent validation
 * @returns {Array} Array of todos or empty array if consent not given
 */
function loadTodosWithConsent() {
    if (!canUseStorage(CONFIG.STORAGE_CATEGORY.PREFERENCES)) {
        console.log('DL-14: Todo loading blocked - preference consent not given');
        return [];
    }

    try {
        const ref = localStorage.getItem(CONFIG.TODO_STORAGE_KEY);
        if (ref) {
            return JSON.parse(ref);
        }
    } catch (e) {
        console.error('DL-14: Error loading todos:', e);
    }

    return [];
}

/**
 * DL-14: Safely get theme preference with consent validation
 * @returns {string|null} Theme preference or null if consent not given
 */
function getThemeWithConsent() {
    if (!canUseStorage(CONFIG.STORAGE_CATEGORY.PREFERENCES)) {
        return null;
    }

    return localStorage.getItem(CONFIG.THEME_STORAGE_KEY);
}

/**
 * DL-14: Safely set theme preference with consent validation
 * @param {string} theme - Theme to set (dark or light)
 * @returns {boolean} True if saved successfully
 */
function setThemeWithConsent(theme) {
    if (!canUseStorage(CONFIG.STORAGE_CATEGORY.PREFERENCES)) {
        console.log('DL-14: Theme preference blocked - preference consent not given');
        showConsentRequiredNotification('Theme preference');
        return false;
    }

    try {
        localStorage.setItem(CONFIG.THEME_STORAGE_KEY, theme);
        return true;
    } catch (e) {
        console.error('DL-14: Error setting theme:', e);
        return false;
    }
}

// function for rendering the todo items
function renderTodo(todo) {
    // DL-14: Save todos with consent validation
    saveTodosWithConsent();

    // select unorder list using class
    const list = document.querySelector(".todo-list");
    const item = document.querySelector(`[data-key='${todo.id}']`);

    if (todo.deleted) {
        item.remove();
        return;
    }

    // check if checked is true add done class effect otherwise as it is
    const isChecked = todo.checked ? "done" : "";
    // create a new list
    const newlist = document.createElement("li");
    // set attribute to new list
    newlist.setAttribute("class", `todo-item ${isChecked}`);
    newlist.setAttribute("data-key", todo.id);
    newlist.innerHTML = `
<input id="${todo.id}"  type="checkbox"/>
<label for="${todo.id}"  class="tick js-tick"></label>
<span>${todo.x}</span>
<button class="delete-todo js-delete-todo">
    <button class="delete-todo js-delete-todo">
        <svg fill="var(--svgcolor)" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
    </button>
`;

    if (item) {
        list.replaceChild(newlist, item);
    } else {
        list.append(newlist);
    }
}

// function for adding a todo
function myFunction(x) {
    // DL-14: Check consent before adding
    if (!canUseStorage(CONFIG.STORAGE_CATEGORY.PREFERENCES)) {
        console.warn('DL-14: Add todo operation blocked - preference consent not given');
        showConsentRequiredNotification('Todo storage');
        return;
    }

    // creating a object
    const todoobject = {
        x,
        checked: false,
        id: Date.now(),
    };

    // push new todo into a demoarray object
    demoarray.push(todoobject);

    renderTodo(todoobject);
    console.log(demoarray);
}

function toggleDone(b) {
    // DL-14: Check consent before toggling
    if (!canUseStorage(CONFIG.STORAGE_CATEGORY.PREFERENCES)) {
        console.warn('DL-14: Toggle todo operation blocked - preference consent not given');
        return;
    }

    const index = demoarray.findIndex((myitem) => myitem.id === Number(b));
    demoarray[index].checked = !demoarray[index].checked;
    renderTodo(demoarray[index]);
}

function deleteTodo(c) {
    // DL-14: Check consent before deleting
    if (!canUseStorage(CONFIG.STORAGE_CATEGORY.PREFERENCES)) {
        console.warn('DL-14: Delete todo operation blocked - preference consent not given');
        showConsentRequiredNotification('Todo deletion');
        return;
    }

    const index = demoarray.findIndex((myitem) => myitem.id === Number(c));
    const emptytodo = {
        deleted: true,
        ...demoarray[index],
    };
    demoarray = demoarray.filter((myitem) => myitem.id !== Number(c));
    renderTodo(emptytodo);
}

// select form
const form = document.querySelector(".formselect");

// add a event listner submit on form
form.addEventListener("submit", (event) => {
    event.preventDefault();

    // select input
    const input = document.querySelector(".inputselect");

    // remove whitespace of input vlaue using trim method
    const text = input.value.trim();

    // statement condition for printing a input value
    if (text !== "") {
        // call a function for adding a new todo value
        myFunction(text);
        // after submit input value will be become blank ""
        input.value = "";
    }
});

// select entire list
const list = document.querySelector(".js-todo-list");
list.addEventListener("click", (event) => {
    if (event.target.classList.contains("js-tick")) {
        const itemKey = event.target.parentElement.dataset.key;
        toggleDone(itemKey);
    }

    if (event.target.classList.contains("js-delete-todo")) {
        const itemKey = event.target.parentElement.dataset.key;
        deleteTodo(itemKey);
    }
});

// DL-14: DOMContentLoaded - Load todos and initialize theme with consent validation
document.addEventListener("DOMContentLoaded", () => {
    // Load todos with consent validation
    const loadedTodos = loadTodosWithConsent();
    if (loadedTodos.length > 0) {
        demoarray = loadedTodos;
        demoarray.forEach((t) => {
            renderTodo(t);
        });
    }

    // DL-14: Initialize theme with consent validation
    const toggleSwitch = document.querySelector(
        '.theme-switch input[type="checkbox"]'
    );

    const currentTheme = getThemeWithConsent();

    if (currentTheme) {
        document.documentElement.setAttribute("data-theme", currentTheme);

        if (currentTheme === "dark") {
            toggleSwitch.checked = true;
        }
    }
});

/**
 * DL-14: Switch theme with consent validation
 */
function switchTheme(e) {
    const newTheme = e.target.checked ? "dark" : "light";

    if (!setThemeWithConsent(newTheme)) {
        // Revert checkbox if save failed
        e.target.checked = !e.target.checked;
        return;
    }

    document.documentElement.setAttribute("data-theme", newTheme);
}

const toggleSwitch = document.querySelector(
    '.theme-switch input[type="checkbox"]'
);

toggleSwitch.addEventListener("change", switchTheme, false);
