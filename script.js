"use strict";

/* =========================================================
   DOM references
   ========================================================= */

const desktop = document.getElementById("desktop");

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

/* =========================================================
   Window state
   ========================================================= */

let highestWindowZIndex = 20;
let startMessageTimeoutId = null;

const normalWindowStates = new Map();

const TASKBAR_HEIGHT = 64;
const MINIMUM_VISIBLE_WINDOW_WIDTH = 120;
const MINIMUM_VISIBLE_TITLEBAR_HEIGHT = 48;

/* =========================================================
   Clock
   ========================================================= */

/**
 * Updates the taskbar clock.
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

/* =========================================================
   Window state helpers
   ========================================================= */

/**
 * Finds a window by its HTML id.
 *
 * @param {string} windowId
 * @returns {HTMLElement|null}
 */
function getWindowById(windowId) {
    return document.getElementById(windowId);
}

/**
 * Returns true when the window is not closed.
 *
 * @param {HTMLElement} windowElement
 * @returns {boolean}
 */
function isWindowOpen(windowElement) {
    return !windowElement.classList.contains("hidden") ||
        isWindowMinimized(windowElement);
}

/**
 * Returns true when the window is minimized.
 *
 * @param {HTMLElement} windowElement
 * @returns {boolean}
 */
function isWindowMinimized(windowElement) {
    return windowElement.dataset.minimized === "true";
}

/**
 * Returns true when the window is maximized.
 *
 * @param {HTMLElement} windowElement
 * @returns {boolean}
 */
function isWindowMaximized(windowElement) {
    return windowElement.dataset.maximized === "true";
}

/**
 * Returns true when the window is visible on the desktop.
 *
 * @param {HTMLElement} windowElement
 * @returns {boolean}
 */
function isWindowVisible(windowElement) {
    return (
        !windowElement.classList.contains("hidden") &&
        !isWindowMinimized(windowElement)
    );
}

/**
 * Converts a CSS pixel value into a number.
 *
 * @param {string} value
 * @returns {number}
 */
function parsePixelValue(value) {
    const parsedValue = Number.parseFloat(value);

    return Number.isFinite(parsedValue)
        ? parsedValue
        : 0;
}

/* =========================================================
   Safe window positioning
   ========================================================= */

/**
 * Keeps a window reachable inside the desktop.
 *
 * @param {HTMLElement} windowElement
 * @param {number} proposedLeft
 * @param {number} proposedTop
 * @returns {{left: number, top: number}}
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

/* =========================================================
   Window focus
   ========================================================= */

/**
 * Removes the active state from every window.
 */
function clearActiveWindows() {
    applicationWindows.forEach((windowElement) => {
        windowElement.classList.remove("active-window");
    });
}

/**
 * Moves a visible window above the other windows.
 *
 * @param {HTMLElement} windowElement
 */
function focusWindow(windowElement) {
    if (!windowElement || !isWindowVisible(windowElement)) {
        return;
    }

    highestWindowZIndex += 1;

    clearActiveWindows();

    windowElement.classList.add("active-window");
    windowElement.style.zIndex = String(
        highestWindowZIndex
    );

    updateTaskbarState();
}

/**
 * Selects the highest visible window.
 */
function focusHighestVisibleWindow() {
    const visibleWindows = applicationWindows.filter(
        isWindowVisible
    );

    if (visibleWindows.length === 0) {
        clearActiveWindows();
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

/* =========================================================
   Open and close behavior
   ========================================================= */

/**
 * Opens, restores, or focuses an application.
 *
 * @param {string} windowId
 */
function openWindow(windowId) {
    const windowElement = getWindowById(windowId);

    if (!windowElement) {
        console.error(
            `No application window found for id: ${windowId}`
        );
        return;
    }

    const taskbarButtonExists =
        taskbarApplications.querySelector(
            `[data-taskbar-window="${windowId}"]`
        );

    if (!taskbarButtonExists) {
        createTaskbarButton(windowElement);
    }

    if (isWindowMinimized(windowElement)) {
        restoreMinimizedWindow(windowElement);
        return;
    }

    windowElement.classList.remove("hidden");
    windowElement.dataset.minimized = "false";

    focusWindow(windowElement);
}

/**
 * Closes an application completely.
 *
 * @param {HTMLElement} windowElement
 */
function closeWindow(windowElement) {
    if (!windowElement) {
        return;
    }

    windowElement.classList.add("hidden");

    windowElement.classList.remove(
        "active-window",
        "dragging",
        "maximized"
    );

    windowElement.dataset.minimized = "false";
    windowElement.dataset.maximized = "false";

    normalWindowStates.delete(windowElement.id);

    updateMaximizeButton(windowElement, false);
    removeTaskbarButton(windowElement.id);

    focusHighestVisibleWindow();
}

/* =========================================================
   Minimize and restore
   ========================================================= */

/**
 * Minimizes an application.
 *
 * @param {HTMLElement} windowElement
 */
function minimizeWindow(windowElement) {
    if (!windowElement || !isWindowVisible(windowElement)) {
        return;
    }

    windowElement.classList.add("hidden");

    windowElement.classList.remove(
        "active-window",
        "dragging"
    );

    windowElement.dataset.minimized = "true";

    updateTaskbarState();
    focusHighestVisibleWindow();
}

/**
 * Restores a minimized application.
 *
 * @param {HTMLElement} windowElement
 */
function restoreMinimizedWindow(windowElement) {
    if (!windowElement || !isWindowMinimized(windowElement)) {
        return;
    }

    windowElement.dataset.minimized = "false";
    windowElement.classList.remove("hidden");

    focusWindow(windowElement);
}

/* =========================================================
   Maximize and restore
   ========================================================= */

/**
 * Saves a window's normal position and dimensions.
 *
 * @param {HTMLElement} windowElement
 */
function saveNormalWindowState(windowElement) {
    const computedStyle = window.getComputedStyle(
        windowElement
    );

    normalWindowStates.set(windowElement.id, {
        left: parsePixelValue(computedStyle.left),
        top: parsePixelValue(computedStyle.top),
        width: windowElement.offsetWidth,
        height: windowElement.offsetHeight
    });
}

/**
 * Updates the maximize button.
 *
 * @param {HTMLElement} windowElement
 * @param {boolean} maximized
 */
function updateMaximizeButton(
    windowElement,
    maximized
) {
    const maximizeButton = windowElement.querySelector(
        "[data-maximize-window]"
    );

    if (!maximizeButton) {
        return;
    }

    const applicationTitle =
        windowElement.dataset.appTitle || "Application";

    if (maximized) {
        maximizeButton.textContent = "❐";

        maximizeButton.setAttribute(
            "aria-label",
            `Restore ${applicationTitle}`
        );

        maximizeButton.title =
            `Restore ${applicationTitle}`;

        return;
    }

    maximizeButton.textContent = "□";

    maximizeButton.setAttribute(
        "aria-label",
        `Maximize ${applicationTitle}`
    );

    maximizeButton.title =
        `Maximize ${applicationTitle}`;
}

/**
 * Maximizes a visible window.
 *
 * @param {HTMLElement} windowElement
 */
function maximizeWindow(windowElement) {
    if (
        !windowElement ||
        !isWindowVisible(windowElement) ||
        isWindowMaximized(windowElement)
    ) {
        return;
    }

    saveNormalWindowState(windowElement);

    windowElement.dataset.maximized = "true";
    windowElement.classList.add("maximized");

    updateMaximizeButton(windowElement, true);
    focusWindow(windowElement);
}

/**
 * Restores a maximized window.
 *
 * @param {HTMLElement} windowElement
 */
function restoreMaximizedWindow(windowElement) {
    if (!windowElement || !isWindowMaximized(windowElement)) {
        return;
    }

    const normalState = normalWindowStates.get(
        windowElement.id
    );

    windowElement.classList.remove("maximized");
    windowElement.dataset.maximized = "false";

    if (normalState) {
        windowElement.style.left =
            `${normalState.left}px`;

        windowElement.style.top =
            `${normalState.top}px`;

        windowElement.style.width =
            `${normalState.width}px`;

        windowElement.style.height =
            `${normalState.height}px`;

        keepWindowInsideDesktop(windowElement);
    }

    normalWindowStates.delete(windowElement.id);

    updateMaximizeButton(windowElement, false);
    focusWindow(windowElement);
}

/**
 * Switches between maximized and normal states.
 *
 * @param {HTMLElement} windowElement
 */
function toggleMaximizeWindow(windowElement) {
    if (isWindowMaximized(windowElement)) {
        restoreMaximizedWindow(windowElement);
        return;
    }

    maximizeWindow(windowElement);
}

/* =========================================================
   Dragging
   ========================================================= */

/**
 * Makes one application window draggable.
 *
 * @param {HTMLElement} windowElement
 */
function makeWindowDraggable(windowElement) {
    const dragHandle = windowElement.querySelector(
        "[data-drag-handle]"
    );

    if (!dragHandle) {
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

    function startDragging(event) {
        const clickedWindowControl = event.target.closest(
            ".window-control"
        );

        if (clickedWindowControl) {
            return;
        }

        if (isWindowMaximized(windowElement)) {
            return;
        }

        if (
            event.button !== undefined &&
            event.button !== 0
        ) {
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

        dragHandle.setPointerCapture(
            event.pointerId
        );

        event.preventDefault();
    }

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

    function stopDragging(event) {
        if (!isDragging) {
            return;
        }

        isDragging = false;

        windowElement.classList.remove("dragging");

        if (
            dragHandle.hasPointerCapture(
                event.pointerId
            )
        ) {
            dragHandle.releasePointerCapture(
                event.pointerId
            );
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

/* =========================================================
   Browser resize protection
   ========================================================= */

/**
 * Keeps one window reachable after browser resizing.
 *
 * @param {HTMLElement} windowElement
 */
function keepWindowInsideDesktop(windowElement) {
    if (
        !isWindowVisible(windowElement) ||
        isWindowMaximized(windowElement)
    ) {
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

    windowElement.style.left =
        `${safePosition.left}px`;

    windowElement.style.top =
        `${safePosition.top}px`;
}

/**
 * Keeps all windows reachable.
 */
function keepAllWindowsInsideDesktop() {
    applicationWindows.forEach(
        keepWindowInsideDesktop
    );
}

/* =========================================================
   Taskbar
   ========================================================= */

/**
 * Creates a taskbar button for an application.
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

    const taskbarButton = document.createElement(
        "button"
    );

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
        const currentWindow = getWindowById(
            windowId
        );

        if (!currentWindow) {
            return;
        }

        if (isWindowMinimized(currentWindow)) {
            restoreMinimizedWindow(currentWindow);
            return;
        }

        if (
            currentWindow.classList.contains(
                "active-window"
            )
        ) {
            minimizeWindow(currentWindow);
            return;
        }

        currentWindow.classList.remove("hidden");
        currentWindow.dataset.minimized = "false";

        focusWindow(currentWindow);
    });

    taskbarApplications.appendChild(
        taskbarButton
    );
}

/**
 * Removes a taskbar button.
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
 * Updates active and minimized taskbar styles.
 */
function updateTaskbarState() {
    const taskbarButtons =
        taskbarApplications.querySelectorAll(
            "[data-taskbar-window]"
        );

    taskbarButtons.forEach((taskbarButton) => {
        const windowId =
            taskbarButton.dataset.taskbarWindow;

        const windowElement = getWindowById(
            windowId
        );

        const active =
            windowElement &&
            isWindowVisible(windowElement) &&
            windowElement.classList.contains(
                "active-window"
            );

        const minimized =
            windowElement &&
            isWindowMinimized(windowElement);

        taskbarButton.classList.toggle(
            "active",
            Boolean(active)
        );

        taskbarButton.classList.toggle(
            "minimized",
            Boolean(minimized)
        );
    });
}

/* =========================================================
   Start placeholder
   ========================================================= */

/**
 * Shows the temporary Start-menu message.
 */
function showStartMessage() {
    startMessage.classList.remove("hidden");

    if (startMessageTimeoutId !== null) {
        window.clearTimeout(
            startMessageTimeoutId
        );
    }

    startMessageTimeoutId = window.setTimeout(
        () => {
            startMessage.classList.add("hidden");
            startMessageTimeoutId = null;
        },
        3500
    );
}

/* =========================================================
   Event registration
   ========================================================= */

/**
 * Registers desktop icon events.
 */
function registerDesktopIconEvents() {
    openWindowButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const windowId =
                button.dataset.openWindow;

            openWindow(windowId);
        });
    });
}

/**
 * Registers window-control and dragging events.
 */
function registerWindowEvents() {
    applicationWindows.forEach((windowElement) => {
        const dragHandle = windowElement.querySelector(
            "[data-drag-handle]"
        );

        const minimizeButton =
            windowElement.querySelector(
                "[data-minimize-window]"
            );

        const maximizeButton =
            windowElement.querySelector(
                "[data-maximize-window]"
            );

        const closeButton =
            windowElement.querySelector(
                "[data-close-window]"
            );

        windowElement.addEventListener(
            "pointerdown",
            () => {
                if (isWindowVisible(windowElement)) {
                    focusWindow(windowElement);
                }
            }
        );

        if (minimizeButton) {
            minimizeButton.addEventListener(
                "click",
                (event) => {
                    event.stopPropagation();
                    minimizeWindow(windowElement);
                }
            );
        }

        if (maximizeButton) {
            maximizeButton.addEventListener(
                "click",
                (event) => {
                    event.stopPropagation();

                    toggleMaximizeWindow(
                        windowElement
                    );
                }
            );
        }

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                (event) => {
                    event.stopPropagation();
                    closeWindow(windowElement);
                }
            );
        }

        if (dragHandle) {
            dragHandle.addEventListener(
                "dblclick",
                (event) => {
                    if (
                        event.target.closest(
                            ".window-control"
                        )
                    ) {
                        return;
                    }

                    toggleMaximizeWindow(
                        windowElement
                    );
                }
            );
        }

        makeWindowDraggable(windowElement);
    });
}

/* =========================================================
   Initialization
   ========================================================= */

/**
 * Initializes application states and taskbar buttons.
 */
function initializeOpenWindows() {
    applicationWindows.forEach((windowElement) => {
        if (!windowElement.dataset.minimized) {
            windowElement.dataset.minimized =
                "false";
        }

        if (!windowElement.dataset.maximized) {
            windowElement.dataset.maximized =
                "false";
        }

        updateMaximizeButton(
            windowElement,
            isWindowMaximized(windowElement)
        );

        if (!windowElement.classList.contains("hidden")) {
            createTaskbarButton(windowElement);
        }
    });

    const initiallyActiveWindow =
        document.querySelector(
            ".app-window.active-window"
        );

    if (
        initiallyActiveWindow &&
        isWindowVisible(initiallyActiveWindow)
    ) {
        focusWindow(initiallyActiveWindow);
    }
}

/**
 * Starts GreenSpace WebOS.
 */
function initializeWebOS() {
    registerDesktopIconEvents();
    registerWindowEvents();
    initializeOpenWindows();

    startButton.addEventListener(
        "click",
        showStartMessage
    );

    window.addEventListener(
        "resize",
        keepAllWindowsInsideDesktop
    );

    updateClock();

    window.setInterval(
        updateClock,
        1000
    );
}

initializeWebOS();