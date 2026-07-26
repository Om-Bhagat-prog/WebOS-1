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

const TASKBAR_HEIGHT = 64;
const MINIMUM_VISIBLE_WINDOW_WIDTH = 120;
const MINIMUM_VISIBLE_TITLEBAR_HEIGHT = 48;

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
 * Converts a CSS pixel value into a number.
 *
 * @param {string} value
 * @returns {number}
 */
function parsePixelValue(value) {
    const parsedValue = Number.parseFloat(value);

    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

/**
 * Keeps a window reachable inside the desktop.
 *
 * The entire window does not have to remain visible, but enough of
 * the title bar must remain on screen so the user can recover it.
 *
 * @param {HTMLElement} windowElement
 * @param {number} proposedLeft
 * @param {number} proposedTop
 * @returns {{ left: number, top: number }}
 */
function getSafeWindowPosition(
    windowElement,
    proposedLeft,
    proposedTop
) {
    const desktopWidth = desktop.clientWidth;
    const desktopHeight = desktop.clientHeight;

    const windowWidth = windowElement.offsetWidth;

    const minimumLeft =
        MINIMUM_VISIBLE_WINDOW_WIDTH - windowWidth;

    const maximumLeft =
        desktopWidth - MINIMUM_VISIBLE_WINDOW_WIDTH;

    const minimumTop = 0;

    const maximumTop =
        desktopHeight -
        TASKBAR_HEIGHT -
        MINIMUM_VISIBLE_TITLEBAR_HEIGHT;

    return {
        left: Math.min(
            Math.max(proposedLeft, minimumLeft),
            maximumLeft
        ),

        top: Math.min(
            Math.max(proposedTop, minimumTop),
            maximumTop
        )
    };
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
 * Adds pointer-based dragging to one application window.
 *
 * Pointer Events support mouse, touch, and pen input through
 * the same event model.
 *
 * @param {HTMLElement} windowElement
 */
function makeWindowDraggable(windowElement) {
    const dragHandle = windowElement.querySelector(
        "[data-drag-handle]"
    );

    if(!dragHandle) {
        console.warn(
            `No drag handle found for window: ${windowElement.id}`
        );
        return;
    }

    let isDragging = false;

    let pointerStartX = 0;

    let pointerStartY = 0;

    let windowStartLeft = 0;
    let windowStartTop = 0;

     /**
     * Begins dragging when the title bar is pressed.
     *
     * @param {PointerEvent} event
     */

     function startDragging(event) {
        const clickedWindowControl = event.target.closest(
            ".window-control"
        );

        if (clickedWindowControl) {
            return;
        }

        if (event.button !== undefined && event.button !== 0) {
            return;
        }

        isDragging = true;

        pointerStartX = event.clientX;
        pointerStartY = event.clientY;

        const computedStyle = window.getComputedStyle(
            windowElement
        );

        windowStartLeft = parsePixelValue(
            computedStyle.left
        );

        windowStartTop = parsePixelValue(
            computedStyle.top
        );

        focusWindow(windowElement);
        windowElement.classList.add("dragging");
        
        dragHandle.setPointerCapture(event.pointerId);

        event.preventDefault();
     }

     /**
     * Moves the window while dragging is active.
     *
     * @param {PointerEvent} event
     */
    function moveWindow(event) {
        if (!isDragging) {
            return;
        }

        const horizontalMovement = 
            event.clientX - pointerStartX;
        
        const verticalMovement = 
            event.clientY - pointerStartY;

        const proposedLeft = 
            windowStartLeft + horizontalMovement;

        const proposedTop = 
            windowStartTop + verticalMovement;

        const safePosition = getSafeWindowPosition(
            windowElement,
            proposedLeft,
            proposedTop
        );

        windowElement.style.left = 
            `${safePosition.left}px`;

        windowElement.style.top = 
            `${safePosition.top}px`;
    }

    /**
     * Finishes the current drag operation.
     *
     * @param {PointerEvent} event
     */
    function stopDragging(event) {
        if (!isDragging) {
            return;
        }

        isDragging = false;

        windowElement.classList.remove("dragging");

        if (dragHandle.hasPointerCapture(event.pointerId)) {
            dragHandle.releasePointerCapture(event.pointerId);
        }
    }

    dragHandle.addEventListener(
        "pointerdown",
        startDragging
    );

    dragHandle.addEventListener(
        "pointermove",
        moveWindow
    );

    dragHandle.addEventListener(
        "pointerup",
        stopDragging
    );

    dragHandle.addEventListener(
        "pointercancel",
        stopDragging
    );
}

/**
 * Repositions an open window if a browser resize leaves its
 * title bar outside the usable desktop area.
 *
 * @param {HTMLElement} windowElement
 */
function keepWindowInsideDesktop(windowElement) {
    if (!isWindowOpen(windowElement)) {
        return;
    }

    const computedStyle = window.getComputedStyle(
        windowElement
    );

    const currentLeft = parsePixelValue(
        computedStyle.left
    );

    const currentTop = parsePixelValue(
        computedStyle.top
    );

    const safePosition = getSafeWindowPosition(
        windowElement,
        currentLeft,
        currentTop
    );

    windowElement.style.left = `${safePosition.left}px`;
    windowElement.style.top = `${safePosition.top}px`;
}

/**
 * Keeps all open application windows reachable.
 */
function keepAllWindowsInsideDesktop() {
    applicationWindows.forEach(keepWindowInsideDesktop);
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

        makeWindowDraggable(windowElement);
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

    window.addEventListener(
    "resize",
    keepAllWindowsInsideDesktop
    );

    updateClock();
    window.setInterval(updateClock, 1000);
}

initializeWebOS();