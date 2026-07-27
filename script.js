"use strict";

/* =========================================================
   DOM references
   ========================================================= */

const desktop = document.getElementById("desktop");

const clockTime = document.getElementById("clock-time");
const clockDate = document.getElementById("clock-date");

const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const startSearch = document.getElementById("start-search");
const startAppList = document.getElementById("start-app-list");
const startAppCount = document.getElementById("start-app-count");

const startNoResults = document.getElementById(
    "start-no-results"
);

const powerButton = document.getElementById("power-button");

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

const normalWindowStates = new Map();

const TASKBAR_HEIGHT = 64;
const MINIMUM_VISIBLE_WINDOW_WIDTH = 120;
const MINIMUM_VISIBLE_TITLEBAR_HEIGHT = 48;

/* =========================================================
   Clock
   ========================================================= */

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

function getWindowById(windowId) {
    return document.getElementById(windowId);
}

function isWindowOpen(windowElement) {
    return (
        !windowElement.classList.contains("hidden") ||
        isWindowMinimized(windowElement)
    );
}

function isWindowMinimized(windowElement) {
    return windowElement.dataset.minimized === "true";
}

function isWindowMaximized(windowElement) {
    return windowElement.dataset.maximized === "true";
}

function isWindowVisible(windowElement) {
    return (
        !windowElement.classList.contains("hidden") &&
        !isWindowMinimized(windowElement)
    );
}

function parsePixelValue(value) {
    const parsedValue = Number.parseFloat(value);

    return Number.isFinite(parsedValue)
        ? parsedValue
        : 0;
}

/* =========================================================
   Safe positioning
   ========================================================= */

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

function clearActiveWindows() {
    applicationWindows.forEach((windowElement) => {
        windowElement.classList.remove("active-window");
    });
}

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
   Open and close
   ========================================================= */

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
        closeStartMenu();
        return;
    }

    windowElement.classList.remove("hidden");
    windowElement.dataset.minimized = "false";

    focusWindow(windowElement);
    closeStartMenu();
}

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

    let dragging = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let windowStartLeft = 0;
    let windowStartTop = 0;

    function startDragging(event) {
        if (event.target.closest(".window-control")) {
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

        dragging = true;

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

    function moveWindow(event) {
        if (!dragging) {
            return;
        }

        const safePosition = getSafeWindowPosition(
            windowElement,
            windowStartLeft +
                event.clientX -
                pointerStartX,
            windowStartTop +
                event.clientY -
                pointerStartY
        );

        windowElement.style.left =
            `${safePosition.left}px`;

        windowElement.style.top =
            `${safePosition.top}px`;
    }

    function stopDragging(event) {
        if (!dragging) {
            return;
        }

        dragging = false;
        windowElement.classList.remove("dragging");

        if (
            dragHandle.hasPointerCapture(event.pointerId)
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
   Resize protection
   ========================================================= */

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

    const safePosition = getSafeWindowPosition(
        windowElement,
        parsePixelValue(computedStyle.left),
        parsePixelValue(computedStyle.top)
    );

    windowElement.style.left =
        `${safePosition.left}px`;

    windowElement.style.top =
        `${safePosition.top}px`;
}

function keepAllWindowsInsideDesktop() {
    applicationWindows.forEach(
        keepWindowInsideDesktop
    );
}

/* =========================================================
   Taskbar
   ========================================================= */

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
        const currentWindow = getWindowById(windowId);

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

    taskbarApplications.appendChild(taskbarButton);
}

function removeTaskbarButton(windowId) {
    const taskbarButton = taskbarApplications.querySelector(
        `[data-taskbar-window="${windowId}"]`
    );

    if (taskbarButton) {
        taskbarButton.remove();
    }
}

function updateTaskbarState() {
    const taskbarButtons =
        taskbarApplications.querySelectorAll(
            "[data-taskbar-window]"
        );

    taskbarButtons.forEach((taskbarButton) => {
        const windowElement = getWindowById(
            taskbarButton.dataset.taskbarWindow
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
   Start menu
   ========================================================= */

function isStartMenuOpen() {
    return !startMenu.classList.contains("hidden");
}

function openStartMenu() {
    startMenu.classList.remove("hidden");
    startButton.classList.add("active");

    startButton.setAttribute(
        "aria-expanded",
        "true"
    );

    startSearch.value = "";
    filterStartApplications();

    window.requestAnimationFrame(() => {
        startSearch.focus();
    });
}

function closeStartMenu() {
    startMenu.classList.add("hidden");
    startButton.classList.remove("active");

    startButton.setAttribute(
        "aria-expanded",
        "false"
    );
}

function toggleStartMenu() {
    if (isStartMenuOpen()) {
        closeStartMenu();
        return;
    }

    openStartMenu();
}

function filterStartApplications() {
    const searchText =
        startSearch.value.trim().toLowerCase();

    const startApps = Array.from(
        startAppList.querySelectorAll(".start-app")
    );

    let visibleCount = 0;

    startApps.forEach((startApp) => {
        const searchableName = (
            startApp.dataset.searchName || ""
        ).toLowerCase();

        const matchesSearch =
            searchableName.includes(searchText);

        startApp.classList.toggle(
            "hidden",
            !matchesSearch
        );

        if (matchesSearch) {
            visibleCount += 1;
        }
    });

    startAppCount.textContent =
        `${visibleCount} ${visibleCount === 1 ? "app" : "apps"}`;

    startNoResults.classList.toggle(
        "hidden",
        visibleCount !== 0
    );
}

function handlePowerButtonClick() {
    const powerButtonLabel = powerButton.querySelector(
        "span:last-child"
    );

    powerButtonLabel.textContent = "Unavailable";

    window.setTimeout(() => {
        powerButtonLabel.textContent = "Power";
    }, 1800);
}

/* =========================================================
   Event registration
   ========================================================= */

function registerApplicationLaunchEvents() {
    openWindowButtons.forEach((button) => {
        button.addEventListener("click", () => {
            openWindow(button.dataset.openWindow);
        });
    });
}

function registerStartMenuEvents() {
    startButton.addEventListener(
        "click",
        (event) => {
            event.stopPropagation();
            toggleStartMenu();
        }
    );

    startMenu.addEventListener(
        "click",
        (event) => {
            event.stopPropagation();
        }
    );

    startSearch.addEventListener(
        "input",
        filterStartApplications
    );

    powerButton.addEventListener(
        "click",
        handlePowerButtonClick
    );

    document.addEventListener(
        "click",
        closeStartMenu
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Escape" &&
                isStartMenuOpen()
            ) {
                closeStartMenu();
                startButton.focus();
            }
        }
    );
}

function registerWindowEvents() {
    applicationWindows.forEach((windowElement) => {
        const dragHandle = windowElement.querySelector(
            "[data-drag-handle]"
        );

        const minimizeButton = windowElement.querySelector(
            "[data-minimize-window]"
        );

        const maximizeButton = windowElement.querySelector(
            "[data-maximize-window]"
        );

        const closeButton = windowElement.querySelector(
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

function initializeOpenWindows() {
    applicationWindows.forEach((windowElement) => {
        windowElement.dataset.minimized =
            windowElement.dataset.minimized || "false";

        windowElement.dataset.maximized =
            windowElement.dataset.maximized || "false";

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

function initializeWebOS() {
    registerApplicationLaunchEvents();
    registerStartMenuEvents();
    registerWindowEvents();
    initializeOpenWindows();

    window.addEventListener(
        "resize",
        keepAllWindowsInsideDesktop
    );

    updateClock();
    window.setInterval(updateClock, 1000);
}

initializeWebOS();