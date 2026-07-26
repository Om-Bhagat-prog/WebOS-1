"use strict";

const clockTime = document.getElementById("clock-time");
const clockDate = document.getElementById("clock-date");

const startButton = document.getElementById("start-button");
const startMessage = document.getElementById("start-message");

const taskbarApplications = document.getElementById(
    "taskbar-applications"
);

const applicationWindows = Array.from(
    document.querySelectorAll("[data-window]")
);

const openWindowButtons = document.querySelectorAll(
    "[data-open-window]"
);

let highestWindowZIndex = 20;
let startMessageTimeoutId = null;

/**
 * Updates the taskbar clock using the visitor's local time.
 */
function updateClock() {
    const currentDate = new Date();

    clockTime.textContent = currentDate.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });

    clockDate.textContent = currentDate.toLocaleDateString([], {
        month: "short",
        day: "numeric"
    });
}

/**
 * Finds an application window using its HTML id.
 *
 * @param {string} windowId
 * @returns {HTMLElement|null}
 */
function getWindowById(windowId) {
    return document.getElementById(windowId);
}

/**
 * Returns true when an application window is visible.
 *
 * @param {HTMLElement} windowElement
 * @returns {boolean}
 */
function isWindowOpen(windowElement) {
    return !windowElement.classList.contains("hidden");
}

/**
 * Removes the active style from every application window.
 */
function clearActiveWindows() {
    applicationWindows.forEach((windowElement) => {
        windowElement.classList.remove("active-window");
    });
}

/**
 * Moves the selected window above the other application windows.
 *
 * @param {HTMLElement} windowElement
 */
function focusWindow(windowElement) {
    if (!windowElement || !isWindowOpen(windowElement)) {
        return;
    }

    highestWindowZIndex += 1;

    clearActiveWindows();

    windowElement.classList.add("active-window");
    windowElement.style.zIndex = String(highestWindowZIndex);

    updateTaskbarState();
}

/**
 * Opens an application or focuses it if it is already open.
 *
 * @param {string} windowId
 */
function openWindow(windowId) {
    const windowElement = getWindowById(windowId);

    if (!windowElement) {
        console.error(`No application window found for id: ${windowId}`);
        return;
    }

    if (!isWindowOpen(windowElement)) {
        windowElement.classList.remove("hidden");
        createTaskbarButton(windowElement);
    }

    focusWindow(windowElement);
}

/**
 * Closes an application and removes its taskbar button.
 *
 * @param {HTMLElement} windowElement
 */
function closeWindow(windowElement) {
    if (!windowElement) {
        return;
    }

    windowElement.classList.add("hidden");
    windowElement.classList.remove("active-window");

    removeTaskbarButton(windowElement.id);
    focusHighestVisibleWindow();
}

/**
 * Selects the highest visible window after another window closes.
 */
function focusHighestVisibleWindow() {
    const visibleWindows = applicationWindows.filter(isWindowOpen);

    if (visibleWindows.length === 0) {
        updateTaskbarState();
        return;
    }

    const highestVisibleWindow = visibleWindows.reduce(
        (currentHighest, currentWindow) => {
            const highestZIndex = Number(
                currentHighest.style.zIndex || 0
            );

            const currentZIndex = Number(
                currentWindow.style.zIndex || 0
            );

            return currentZIndex > highestZIndex
                ? currentWindow
                : currentHighest;
        }
    );

    focusWindow(highestVisibleWindow);
}

/**
 * Creates a taskbar button for an open application.
 *
 * @param {HTMLElement} windowElement
 */
function createTaskbarButton(windowElement) {
    const windowId = windowElement.id;

    const existingButton = taskbarApplications.querySelector(
        `[data-taskbar-window="${windowId}"]`
    );

    if (existingButton) {
        return;
    }

    const applicationTitle =
        windowElement.dataset.appTitle || "Application";

    const applicationIcon =
        windowElement.dataset.appIcon || "◻";

    const taskbarButton = document.createElement("button");

    taskbarButton.type = "button";
    taskbarButton.className = "taskbar-app";
    taskbarButton.dataset.taskbarWindow = windowId;
    taskbarButton.setAttribute(
        "aria-label",
        `Open ${applicationTitle}`
    );

    const icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = applicationIcon;

    const title = document.createElement("span");
    title.className = "taskbar-app-name";
    title.textContent = applicationTitle;

    taskbarButton.append(icon, title);

    taskbarButton.addEventListener("click", () => {
        openWindow(windowId);
    });

    taskbarApplications.appendChild(taskbarButton);
}

/**
 * Removes the taskbar button for a closed application.
 *
 * @param {string} windowId
 */
function removeTaskbarButton(windowId) {
    const taskbarButton = taskbarApplications.querySelector(
        `[data-taskbar-window="${windowId}"]`
    );

    if (taskbarButton) {
        taskbarButton.remove();
    }
}

/**
 * Highlights the taskbar button belonging to the active window.
 */
function updateTaskbarState() {
    const taskbarButtons = taskbarApplications.querySelectorAll(
        "[data-taskbar-window]"
    );

    taskbarButtons.forEach((taskbarButton) => {
        const windowId = taskbarButton.dataset.taskbarWindow;
        const windowElement = getWindowById(windowId);

        const isActive =
            windowElement &&
            isWindowOpen(windowElement) &&
            windowElement.classList.contains("active-window");

        taskbarButton.classList.toggle("active", isActive);
    });
}

/**
 * Shows a temporary message above the taskbar.
 */
function showStartMessage() {
    startMessage.classList.remove("hidden");

    if (startMessageTimeoutId !== null) {
        window.clearTimeout(startMessageTimeoutId);
    }

    startMessageTimeoutId = window.setTimeout(() => {
        startMessage.classList.add("hidden");
        startMessageTimeoutId = null;
    }, 3500);
}

/**
 * Registers click events for desktop application icons.
 */
function registerDesktopIconEvents() {
    openWindowButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const windowId = button.dataset.openWindow;

            openWindow(windowId);
        });
    });
}

/**
 * Registers focus and close events for each application window.
 */
function registerWindowEvents() {
    applicationWindows.forEach((windowElement) => {
        const closeButton = windowElement.querySelector(
            "[data-close-window]"
        );

        windowElement.addEventListener("pointerdown", () => {
            focusWindow(windowElement);
        });

        if (closeButton) {
            closeButton.addEventListener("click", (event) => {
                event.stopPropagation();
                closeWindow(windowElement);
            });
        }
    });
}

/**
 * Creates taskbar buttons for applications visible on page load.
 */
function initializeOpenWindows() {
    applicationWindows
        .filter(isWindowOpen)
        .forEach(createTaskbarButton);

    const initiallyActiveWindow = document.querySelector(
        ".app-window.active-window"
    );

    if (initiallyActiveWindow) {
        focusWindow(initiallyActiveWindow);
    }
}

/**
 * Starts the WebOS interface.
 */
function initializeWebOS() {
    registerDesktopIconEvents();
    registerWindowEvents();
    initializeOpenWindows();

    startButton.addEventListener("click", showStartMessage);

    updateClock();
    window.setInterval(updateClock, 1000);
}

initializeWebOS();