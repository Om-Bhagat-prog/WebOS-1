"use strict";

/* =========================================================
   DOM references
   ========================================================= */

const desktop = document.getElementById("desktop");

const webOSAnnouncer = document.getElementById(
    "webos-announcer"
);

function isLocalStorageAvailable() {
    const testKey =
        "greenspace-webos-storage-test";

    try {
        localStorage.setItem(
            testKey,
            "available"
        );

        localStorage.removeItem(
            testKey
        );

        return true;
    } catch (error) {
        return false;
    }
}

const runDiagnosticsButton =
    document.getElementById(
        "run-diagnostics-button"
    );

const diagnosticsPanel =
    document.getElementById(
        "diagnostics-panel"
    );

const diagnosticsResults =
    document.getElementById(
        "diagnostics-results"
    );

const diagnosticsSummary =
    document.getElementById(
        "diagnostics-summary"
    );

const systemStatusCard =
    document.getElementById(
        "system-status-card"
    );

const systemStatusDot =
    document.getElementById(
        "system-status-dot"
    );

const systemStatusText =
    document.getElementById(
        "system-status-text"
    );

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

const notesTitle = document.getElementById("notes-title");
const notesEditor = document.getElementById("notes-editor");

const saveNoteButton = document.getElementById(
    "save-note-button"
);

const clearNoteButton = document.getElementById(
    "clear-note-button"
);

const notesSaveState = document.getElementById(
    "notes-save-state"
);

const notesSaveMessage = document.getElementById(
    "notes-save-message"
);

const notesWordCount = document.getElementById(
    "notes-word-count"
);

const notesCharacterCount = document.getElementById(
    "notes-character-count"
);

const natureChallengeList = document.getElementById(
    "nature-challenge-list"
);

const natureChallengeCards = Array.from(
    document.querySelectorAll(
        "[data-nature-challenge]"
    )
);

const natureProgressBar = document.getElementById(
    "nature-progress-bar"
);

const natureProgressTrack = document.querySelector(
    ".nature-progress-track"
);

const natureProgressCount = document.getElementById(
    "nature-progress-count"
);

const natureProgressMessage = document.getElementById(
    "nature-progress-message"
);

const naturePoints = document.getElementById(
    "nature-points"
);

const natureSaveMessage = document.getElementById(
    "nature-save-message"
);

const resetNatureButton = document.getElementById(
    "reset-nature-button"
);

const wallpaperOptionButtons = Array.from(
    document.querySelectorAll(
        "[data-wallpaper-option]"
    )
);

const themeOptionButtons = Array.from(
    document.querySelectorAll(
        "[data-theme-option]"
    )
);

const desktopGridToggle = document.getElementById(
    "desktop-grid-toggle"
);

const settingsSaveMessage = document.getElementById(
    "settings-save-message"
);

const resetSettingsButton = document.getElementById(
    "reset-settings-button"
);

const resetDesktopButton = document.getElementById(
    "reset-desktop-button"
);

const taskbarApplications = document.getElementById(
    "taskbar-applications"
);

const applicationWindows = Array.from(
    document.querySelectorAll("[data-window]")
);

const openWindowButtons = document.querySelectorAll(
    "[data-open-window]"
);

const calculatorExpression = document.getElementById(
    "calculator-expression"
);

const calculatorResult = document.getElementById(
    "calculator-result"
);

const calculatorKeypad = document.getElementById(
    "calculator-keypad"
);

const calculatorHistoryList = document.getElementById(
    "calculator-history-list"
);

const calculatorHistoryEmpty = document.getElementById(
    "calculator-history-empty"
);

const clearCalculatorHistoryButton = 
    document.getElementById(
        "clear-calculator-history"
    );

/* =========================================================
   Application state
   ========================================================= */

let highestWindowZIndex = 20;
let notesAutoSaveTimeoutId = null;
let desktopStateSaveTimeoutId = null;
let suppressDesktopStateSave = false;

const normalWindowStates = new Map();

const NOTES_STORAGE_KEY = "greenspace-webos-note";

const NATURE_STORAGE_KEY = 
    "greenspace-webos-nature-progress";

const SETTINGS_STORAGE_KEY = 
    "greenspace-webos-settings";

const CALCULATOR_HISTORY_STORAGE_KEY = 
    "greenspace-webos-calculator-history";

const DESKTOP_STATE_STORAGE_KEY = 
    "greenspace-webos-desktop-state";

const APPLICATION_SHORTCUTS = {
    w: "welcome-window",
    n: "notes-window",
    e: "nature-window",
    s: "settings-window",
    c: "calculator-window"
};

const EXPECTED_APPLICATION_IDS = [
    "welcome-window",
    "notes-window",
    "nature-window",
    "settings-window",
    "calculator-window"
];

const REQUIRED_ELEMENT_IDS = [
    "desktop",
    "start-button",
    "start-menu",
    "start-search",
    "start-app-list",
    "taskbar-applications",
    "clock-time",
    "clock-date",
    "notes-title",
    "notes-editor",
    "nature-challenge-list",
    "desktop-grid-toggle",
    "calculator-keypad",
    "webos-announcer"
];

const MAX_CALCULATOR_HISTORY_ITEMS = 10;

let calculatorCurrentInput = "0";
let calculatorStoredValue = null;
let calculatorPendingOperator = null;
let calculatorWaitingForOperand = false;
let calculatorHistory = [];

const DEFAULT_WEBOS_SETTINGS = {
    wallpaper: "forest",
    theme: "light",
    showGrid: true
};

let webOSSettings = {
    ...DEFAULT_WEBOS_SETTINGS
};

let natureCompletedChallenges = new Set();

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
   Accessibility announcements
   ========================================================= */

   let announcementTimeoutId = null;

   function announceWebOS(message) {
    if (!webOSAnnouncer) {
        return;
    }

    if (announcementTimeoutId !== null) {
        window.clearTimeout(
            announcementTimeoutId
        );
    }

    webOSAnnouncer.textContent = "";

    announcementTimeoutId =
        window.setTimeout(
            () => {
                webOSAnnouncer.textContent = 
                    message;

                    announcementTimeoutId = null;
            },
            40
        );
   }

   function getApplicationTitle(windowElement) {
    if (!windowElement) {
        return "Application";
    }

    return (
        windowElement.dataset.appTitle ||
        "Application"
    );
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
   Safe window positioning
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

function getActiveWindow() {
    return applicationWindows.find(
        (windowElement) =>
                isWindowVisible(windowElement) &&
                windowElement.classList.contains(
                    "active-window"
                )
    )|| null;
}

function focusWindowTitleBar(windowElement) {
    if (!windowElement) {
        return;
    }

    const titleBar = windowElement.querySelector(
        ".window-header"
    );

    if (!titleBar) {
        return;
    }

    window.requestAnimationFrame(() => {
        titleBar.focus({
            preventScroll: true
        });
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
    scheduleDesktopStateSave();
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
   Open and close windows
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

        focusWindowTitleBar(windowElement);

        announceWebOS(
            `${getApplicationTitle(
                windowElement
            )} restored`
        );

        scheduleDesktopStateSave();
        return;
    }

    windowElement.classList.remove("hidden");
    windowElement.dataset.minimized = "false";

    focusWindow(windowElement);
    closeStartMenu();
    focusWindowTitleBar(windowElement);

    announceWebOS(
        `${getApplicationTitle(
            windowElement
        )} opened`
    );

    scheduleDesktopStateSave();
}

function closeWindow(windowElement) {
    if (!windowElement) {
        return;
    }

    const applicationTitle = 
        getApplicationTitle(windowElement);

    windowElement.classList.add("hidden");

    windowElement.classList.remove(
        "active-window",
        "dragging",
        "maximized"
    );

    windowElement.dataset.minimized = "false";
    windowElement.dataset.maximized = "false";

    normalWindowStates.delete(
        windowElement.id
    );

    updateMaximizeButton(
        windowElement,
        false
    );

    removeTaskbarButton(
        windowElement.id
    );

    focusHighestVisibleWindow();

    announceWebOS(
        `${applicationTitle} closed`
    );

    scheduleDesktopStateSave();
}

/* =========================================================
   Minimize and restore
   ========================================================= */

function minimizeWindow(windowElement) {
    if (
        !windowElement || 
        !isWindowVisible(windowElement)
    ) {
        return;
    }

    const applicationTitle =
        getApplicationTitle(windowElement);

    windowElement.classList.add("hidden");

    windowElement.classList.remove(
        "active-window",
        "dragging"
    );

    windowElement.dataset.minimized = "true";

    updateTaskbarState();
    focusHighestVisibleWindow();

    announceWebOS(
        `${applicationTitle} minimized`
    );

    scheduleDesktopStateSave();
}

function restoreMinimizedWindow(windowElement) {
    if (
        !windowElement ||
        !isWindowMinimized(windowElement)
    ) {
        return;
    }

    windowElement.dataset.minimized = "false";
    windowElement.classList.remove("hidden");

    focusWindow(windowElement);
    focusWindowTitleBar(windowElement);

    announceWebOS(
        `${getApplicationTitle(
            windowElement
        )} restored`
    );

    scheduleDesktopStateSave();
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
    focusWindowTitleBar(windowElement);

    announceWebOS(
        `${getApplicationTitle(
            windowElement
        )} maximized`
    );

    scheduleDesktopStateSave();
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
    focusWindowTitleBar(windowElement);

    announceWebOS(
        `${getApplicationTitle(
            windowElement
        )} restored`
    );

    scheduleDesktopStateSave();
}

function toggleMaximizeWindow(windowElement) {
    if (isWindowMaximized(windowElement)) {
        restoreMaximizedWindow(windowElement);
        return;
    }

    maximizeWindow(windowElement);
}

/* =========================================================
   Draggable windows
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

        const proposedLeft =
            windowStartLeft +
            event.clientX -
            pointerStartX;

        const proposedTop =
            windowStartTop +
            event.clientY -
            pointerStartY;

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

    scheduleDesktopStateSave();
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

    scheduleDesktopStateSave();
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
        `${applicationTitle} application`
    );

    taskbarButton.setAttribute(
        "aria-pressed",
        "false"
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

            taskbarButton.setAttribute(
                "aria-pressed",
                active ? "true" : "false"
            );

            if (minimized) {
                taskbarButton.setAttribute(
                    "aria-label",
                    `Restore ${
                    windowElement.dataset.appTitle ||
                    "application"
                    }`
                );
            } else if (active) {
                taskbarButton.setAttribute(
                    "aria-label",
                    `Minimize ${
                    windowElement.dataset.appTitle ||
                    "application"
                    }`
                );
            } else {
                taskbarButton.setAttribute(
                    "aria-label",
                    `Open ${
                    windowElement.dataset.appTitle ||
                    "application"
                    }`
                );
            }

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

function updateStartApplicationCount() {
    const totalApplications = 
        startAppList.querySelectorAll(
            ".start-app"
        ).length;

    startAppCount.textContent =
        `${totalApplications} ${
        totalApplications === 1
            ? "app"
            : "apps"
        }`;
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
        `${visibleCount} ${
            visibleCount === 1 ? "app" : "apps"
        }`;

    startNoResults.classList.toggle(
        "hidden",
        visibleCount !== 0
    );
}

function handlePowerButtonClick() {
    const powerButtonLabel = powerButton.querySelector(
        "span:last-child"
    );

    if (!powerButtonLabel) {
        return;
    }

    powerButtonLabel.textContent = "Unavailable";

    window.setTimeout(() => {
        powerButtonLabel.textContent = "Power";
    }, 1800);
}

/* =========================================================
   Notes application
   ========================================================= */

function getCurrentNote() {
    return {
        title: notesTitle.value.trim(),
        content: notesEditor.value,
        savedAt: new Date().toISOString()
    };
}

function updateNoteStatistics() {
    const content = notesEditor.value;
    const trimmedContent = content.trim();

    const wordCount = trimmedContent
        ? trimmedContent.split(/\s+/).length
        : 0;

    notesWordCount.textContent = String(wordCount);

    notesCharacterCount.textContent = String(
        content.length
    );
}

function updateNoteSaveStatus(status) {
    notesSaveState.classList.remove(
        "unsaved",
        "saving"
    );

    if (status === "unsaved") {
        notesSaveState.classList.add("unsaved");
        notesSaveMessage.textContent = "Unsaved";
        return;
    }

    if (status === "saving") {
        notesSaveState.classList.add("saving");
        notesSaveMessage.textContent = "Saving...";
        return;
    }

    if (status === "saved") {
        notesSaveMessage.textContent = "Saved";
        return;
    }

    notesSaveMessage.textContent = "Ready";
}

function saveNote() {
    updateNoteSaveStatus("saving");

    const note = getCurrentNote();

    try {
        localStorage.setItem(
            NOTES_STORAGE_KEY,
            JSON.stringify(note)
        );

        updateNoteSaveStatus("saved");
    } catch (error) {
        console.error("Unable to save note.", error);

        notesSaveState.classList.add("unsaved");
        notesSaveMessage.textContent = "Save failed";
    }
}

function scheduleNoteAutoSave() {
    updateNoteSaveStatus("unsaved");

    if (notesAutoSaveTimeoutId !== null) {
        window.clearTimeout(
            notesAutoSaveTimeoutId
        );
    }

    notesAutoSaveTimeoutId = window.setTimeout(
        () => {
            saveNote();
            notesAutoSaveTimeoutId = null;
        },
        700
    );
}

function loadSavedNote() {
    let savedNoteJson;

    try {
        savedNoteJson = localStorage.getItem(
            NOTES_STORAGE_KEY
        );
    } catch (error) {
        console.error(
            "Unable to access browser storage.",
            error
        );

        updateNoteStatistics();
        updateNoteSaveStatus("ready");
        return;
    }

    if (!savedNoteJson) {
        updateNoteStatistics();
        updateNoteSaveStatus("ready");
        return;
    }

    try {
        const savedNote = JSON.parse(savedNoteJson);

        notesTitle.value =
            typeof savedNote.title === "string"
                ? savedNote.title
                : "";

        notesEditor.value =
            typeof savedNote.content === "string"
                ? savedNote.content
                : "";

        updateNoteStatistics();
        updateNoteSaveStatus("saved");
    } catch (error) {
        console.error(
            "Unable to load the saved note.",
            error
        );

        localStorage.removeItem(NOTES_STORAGE_KEY);

        notesTitle.value = "";
        notesEditor.value = "";

        updateNoteStatistics();
        updateNoteSaveStatus("ready");
    }
}

function clearNote() {
    const noteHasContent =
        notesTitle.value.trim() !== "" ||
        notesEditor.value.trim() !== "";

    if (!noteHasContent) {
        notesTitle.focus();
        return;
    }

    const userConfirmed = window.confirm(
        "Clear this note? This action cannot be undone."
    );

    if (!userConfirmed) {
        return;
    }

    if (notesAutoSaveTimeoutId !== null) {
        window.clearTimeout(
            notesAutoSaveTimeoutId
        );

        notesAutoSaveTimeoutId = null;
    }

    notesTitle.value = "";
    notesEditor.value = "";

    try {
        localStorage.removeItem(NOTES_STORAGE_KEY);
    } catch (error) {
        console.error(
            "Unable to remove the saved note.",
            error
        );
    }

    updateNoteStatistics();
    updateNoteSaveStatus("ready");

    notesTitle.focus();
}

function isEditableElement(element) {
    if (!(element instanceof HTMLElement)) {
        return false;
    }

    return (
        element.matches(
            "input, textarea, select"
        ) ||
        element.isContentEditable
    );
}

function handleNotesKeyboardShortcut(event) {
    const userPressedSave =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "s";

    if (!userPressedSave) {
        return;
    }

    const notesWindow = getWindowById("notes-window");

    if (!notesWindow || !isWindowVisible(notesWindow)) {
        return;
    }

    event.preventDefault();
    saveNote();
}

/* =========================================================
   Nature application
   ========================================================= */

   function getNatureChallengeId(challengeCard) {
       return challengeCard.dataset.natureChallenge;
   }

   function getNatureChallengePoints(challengeCard) {
    const points = Number(
        challengeCard.dataset.points
    );

    return Number.isFinite(points)
        ? points
        : 0;
   }

function isNatureChallengeComplete(challengeCard) {
    const challengeId = 
        getNatureChallengeId(challengeCard);

    return natureCompletedChallenges.has(challengeId);
}

function updateNatureChallengeCard(challengeCard) {
    const complete = 
        isNatureChallengeComplete(challengeCard);

    const toggleButton = challengeCard.querySelector(
        "[data-toggle-nature-challenge]"
    );

    const buttonIcon = toggleButton.querySelector(
        ".nature-button-icon"
    );

    const buttonLabel = toggleButton.querySelector(
        ".nature-button-label"
    );

    challengeCard.classList.toggle(
        "completed",
        complete
    );

    toggleButton.setAttribute(
        "aria-pressed",
        String(complete)
    );

    buttonIcon.textContent = complete
        ? "✓"
        : "○";

    buttonLabel.textContent = complete
        ? "Completed"
        : "Mark done";
}

function calculateNaturePoints() {
    return natureChallengeCards.reduce(
        (totalPoints, challengeCard) => {
            if (
                !isNatureChallengeComplete(
                    challengeCard
                )
            ) {
                return totalPoints;
            }

            return (
                totalPoints + 
                getNatureChallengePoints(
                    challengeCard
                )
            );
        },
        0
    );
}

function getNatureProgressMessage(completedCount) {
    const totalChallenges = 
        natureChallengeCards.length;

    if (completedCount === 0) {
        return "Start your first activity";
    }

    if (completedCount === totalChallenges) {
        return "All challenges completed!";
    }

    if (completedCount >= totalChallenges / 2) {
        return "Great progress-keep going";
    }

    return "You are building a greener day";
}

function updateNatureProgress() {
    const totalChallenges =
        natureChallengeCards.length;

    const completedCount =
        natureCompletedChallenges.size;

    const completionPercentage =
        totalChallenges === 0
            ? 0
            : (
                completedCount /
                totalChallenges
            ) * 100;

    const totalPoints =
        calculateNaturePoints();

    natureChallengeCards.forEach(
        updateNatureChallengeCard
    );

    natureProgressBar.style.width =
        `${completionPercentage}%`;

    natureProgressTrack.setAttribute(
        "aria-valuemax",
        String(totalChallenges)
    );

    natureProgressTrack.setAttribute(
        "aria-valuenow",
        String(completedCount)
    );

    natureProgressCount.textContent =
        `${completedCount} of ${totalChallenges} complete`;

    natureProgressMessage.textContent =
        getNatureProgressMessage(
            completedCount
        );

    naturePoints.textContent =
        String(totalPoints);
}

function saveNatureProgress() {
    const completedChallengeIds = Array.from(
        natureCompletedChallenges
    );

    try {
        localStorage.setItem(
            NATURE_STORAGE_KEY,
            JSON.stringify(
                completedChallengeIds
            )
        );

        natureSaveMessage.textContent = 
            "Progress saved automatically";
    } catch (error) {
        console.error(
            "Unable to save Nature progress.",
            error
        );

        natureSaveMessage.textContent = 
            "Progress could not be saved";
    }
}

function loadNatureProgress() {
    let savedProgressJson;

    try {
        savedProgressJson = localStorage.getItem(
            NATURE_STORAGE_KEY
        );
    } catch (error) {
        console.error(
            "Unable to access Nature progress.",
            error
        );

        updateNatureProgress();
        return;
    }

    if (!savedProgressJson) {
        updateNatureProgress();
        return;
    }

    try {
        const savedChallengeIds = 
            JSON.parse(savedProgressJson);

        const validChallengeIds = new Set(
            natureChallengeCards.map(
                getNatureChallengeId
            )
        );

        natureCompletedChallenges = new Set(
            Array.isArray(savedChallengeIds)
            ? savedChallengeIds.filter(
                (challengeId) =>
                    validChallengeIds.has(
                        challengeId
                    )
            )
            : []
        );
    } catch (error) {
        console.error(
            "Unable to load Nature progress.",
            error
        );

        natureCompletedChallenges = new Set();

        try {
            localStorage.removeItem(
                NATURE_STORAGE_KEY
            );
        } catch (storageError) {
            console.error(
                "Unable to clear invalid Nature progress.",
                storageError
            );
        }
    }

    updateNatureProgress();
}

function toggleNatureChallenge(challengeCard) {
    const challengeId = 
        getNatureChallengeId(challengeCard);

    if (!challengeId) {
        return;
    }

    if (
        natureCompletedChallenges.has(
            challengeId
        )
    ) {
        natureCompletedChallenges.delete(
            challengeId
        );
    } else {
        natureCompletedChallenges.add(
            challengeId
        );
    }

    updateNatureProgress();
    saveNatureProgress();
}

function resetNatureProgress() {
    if (natureCompletedChallenges.size === 0) {
        return;
    }

    const userConfirmed = window.confirm(
        "Reset all Nature challenge progress?"
    );

    if (!userConfirmed) {
        return;
    }

    natureCompletedChallenges.clear();

    try {
        localStorage.removeItem(
            NATURE_STORAGE_KEY
        );
    } catch (error) {
        console.error(
            "Unable to reset Nature progres.",
            error
        );
    }

    updateNatureProgress();

    natureSaveMessage.textContent = 
        "Progress reset";
}

function registerNatureEvents() {
    if (
        !natureChallengeList ||
        !natureProgressBar ||
        !natureProgressTrack ||
        !natureProgressCount ||
        !natureProgressMessage ||
        !naturePoints ||
        !natureSaveMessage ||
        !resetNatureButton
    ) {
        console.error(
            "Nature initialization failed. Check the Commit 7 Nature HTML IDs."
        );

        return;
    }

    natureChallengeList.addEventListener(
        "click",
        (event) => {
            const toggleButton = 
                event.target.closest(
                    "[data-toggle-nature-challenge]"
                );

            if (!toggleButton) {
                return;
            }

            const challengeCard = 
                toggleButton.closest(
                    "[data-nature-challenge]"
                );

            if (!challengeCard) {
                return;
            }

            toggleNatureChallenge(
                challengeCard
            );
        }
    );

    resetNatureButton.addEventListener(
        "click",
        resetNatureProgress
    );
}

/* =========================================================
   Settings application
   ========================================================= */

function isValidWallpaper(wallpaper) {
    return [
        "forest",
        "sunset",
        "ocean"
    ].includes(wallpaper);
}

function isValidTheme(theme) {
    return [
        "light",
        "dark"
    ].includes(theme);
}

function updateWallpaperButtons() {
    wallpaperOptionButtons.forEach((button) => {
        const selected =
            button.dataset.wallpaperOption ===
            webOSSettings.wallpaper;

        button.classList.toggle(
            "selected",
            selected
        );

        button.setAttribute(
            "aria-checked",
            String(selected)
        );
    });
}

function updateThemeButtons() {
    themeOptionButtons.forEach((button) => {
        const selected =
            button.dataset.themeOption ===
            webOSSettings.theme;

        button.classList.toggle(
            "selected",
            selected
        );

        button.setAttribute(
            "aria-checked",
            String(selected)
        );
    });
}

function updateGridToggle() {
    desktopGridToggle.classList.toggle(
        "active",
        webOSSettings.showGrid
    );

    desktopGridToggle.setAttribute(
        "aria-checked",
        String(webOSSettings.showGrid)
    );
}

function applyWebOSSettings() {
    desktop.dataset.wallpaper =
        webOSSettings.wallpaper;

    document.body.classList.toggle(
        "dark-theme",
        webOSSettings.theme === "dark"
    );

    desktop.classList.toggle(
        "grid-hidden",
        !webOSSettings.showGrid
    );

    updateWallpaperButtons();
    updateThemeButtons();
    updateGridToggle();
}

function saveWebOSSettings() {
    try {
        localStorage.setItem(
            SETTINGS_STORAGE_KEY,
            JSON.stringify(webOSSettings)
        );

        settingsSaveMessage.textContent =
            "Appearance settings saved";
    } catch (error) {
        console.error(
            "Unable to save WebOS settings.",
            error
        );

        settingsSaveMessage.textContent =
            "Appearance settings could not be saved";
    }
}

function loadWebOSSettings() {
    let storedSettingsJson;

    try {
        storedSettingsJson = localStorage.getItem(
            SETTINGS_STORAGE_KEY
        );
    } catch (error) {
        console.error(
            "Unable to access WebOS settings.",
            error
        );

        applyWebOSSettings();
        return;
    }

    if (!storedSettingsJson) {
        applyWebOSSettings();
        return;
    }

    try {
        const storedSettings =
            JSON.parse(storedSettingsJson);

        webOSSettings = {
            wallpaper:
                isValidWallpaper(
                    storedSettings.wallpaper
                )
                    ? storedSettings.wallpaper
                    : DEFAULT_WEBOS_SETTINGS.wallpaper,

            theme:
                isValidTheme(
                    storedSettings.theme
                )
                    ? storedSettings.theme
                    : DEFAULT_WEBOS_SETTINGS.theme,

            showGrid:
                typeof storedSettings.showGrid ===
                "boolean"
                    ? storedSettings.showGrid
                    : DEFAULT_WEBOS_SETTINGS.showGrid
        };
    } catch (error) {
        console.error(
            "Unable to load WebOS settings.",
            error
        );

        webOSSettings = {
            ...DEFAULT_WEBOS_SETTINGS
        };

        try {
            localStorage.removeItem(
                SETTINGS_STORAGE_KEY
            );
        } catch (storageError) {
            console.error(
                "Unable to remove invalid settings.",
                storageError
            );
        }
    }

    applyWebOSSettings();
}

function selectWallpaper(wallpaper) {
    if (!isValidWallpaper(wallpaper)) {
        return;
    }

    webOSSettings.wallpaper = wallpaper;

    applyWebOSSettings();
    saveWebOSSettings();
}

function selectTheme(theme) {
    if (!isValidTheme(theme)) {
        return;
    }

    webOSSettings.theme = theme;

    applyWebOSSettings();
    saveWebOSSettings();
}

function toggleDesktopGrid() {
    webOSSettings.showGrid =
        !webOSSettings.showGrid;

    applyWebOSSettings();
    saveWebOSSettings();
}

function resetWebOSSettings() {
    const settingsAreAlreadyDefault =
        webOSSettings.wallpaper ===
            DEFAULT_WEBOS_SETTINGS.wallpaper &&
        webOSSettings.theme ===
            DEFAULT_WEBOS_SETTINGS.theme &&
        webOSSettings.showGrid ===
            DEFAULT_WEBOS_SETTINGS.showGrid;

    if (settingsAreAlreadyDefault) {
        settingsSaveMessage.textContent =
            "Default appearance is already active";

        return;
    }

    const userConfirmed = window.confirm(
        "Reset all appearance settings?"
    );

    if (!userConfirmed) {
        return;
    }

    webOSSettings = {
        ...DEFAULT_WEBOS_SETTINGS
    };

    try {
        localStorage.removeItem(
            SETTINGS_STORAGE_KEY
        );
    } catch (error) {
        console.error(
            "Unable to reset WebOS settings.",
            error
        );
    }

    applyWebOSSettings();

    settingsSaveMessage.textContent =
        "Appearance settings reset";
}

function registerSettingsEvents() {
    if (
        wallpaperOptionButtons.length === 0 ||
        themeOptionButtons.length === 0 ||
        !desktopGridToggle ||
        !settingsSaveMessage ||
        !resetSettingsButton
    ) {
        console.error(
            "Settings initialization failed. Check the Hour 8 Settings HTML."
        );

        return;
    }

    wallpaperOptionButtons.forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                selectWallpaper(
                    button.dataset.wallpaperOption
                );
            }
        );
    });

    themeOptionButtons.forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                selectTheme(
                    button.dataset.themeOption
                );
            }
        );
    });

    desktopGridToggle.addEventListener(
        "click",
        toggleDesktopGrid
    );

    resetSettingsButton.addEventListener(
        "click",
        resetWebOSSettings
    );

    if (resetDesktopButton) {
        resetDesktopButton.addEventListener(
            "click",
            resetDesktopState
        );
    }
}
/* =========================================================
   Calculator application
   ========================================================= */

function formatCalculatorNumber(value) {
    if (!Number.isFinite(value)) {
        return "Error";
    }

    const absoluteValue = Math.abs(value);

    if (
        absoluteValue !== 0 &&
        (
            absoluteValue >= 1e12 ||
            absoluteValue < 1e-8
        )
    ) {
        return value.toExponential(8);
    }

    return Number(
        value.toPrecision(12)
    ).toString();
}

function getCalculatorDisplayValue() {
    const numericValue = Number(
        calculatorCurrentInput
    );

    if (!Number.isFinite(numericValue)) {
        return calculatorCurrentInput;
    }

    return formatCalculatorNumber(
        numericValue
    );
}

function getCalculatorOperatorSymbol(operator) {
    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    };

    return symbols[operator] || operator;
}

function updateCalculatorDisplay() {
    calculatorResult.classList.remove("error");

    calculatorResult.textContent =
        getCalculatorDisplayValue();

    if (
        calculatorStoredValue !== null &&
        calculatorPendingOperator
    ) {
        calculatorExpression.textContent =
            `${formatCalculatorNumber(
                calculatorStoredValue
            )} ${getCalculatorOperatorSymbol(
                calculatorPendingOperator
            )}`;
    } else {
        calculatorExpression.innerHTML =
            "&nbsp;";
    }
}

function showCalculatorError(message) {
    calculatorExpression.textContent = "Calculation error";

    calculatorResult.textContent = message;
    calculatorResult.classList.add("error");

    calculatorCurrentInput = "0";
    calculatorStoredValue = null;
    calculatorPendingOperator = null;
    calculatorWaitingForOperand = false;
}

function inputCalculatorDigit(digit) {
    if (calculatorResult.classList.contains("error")) {
        calculatorResult.classList.remove("error");
        calculatorCurrentInput = "0";
    }

    if (calculatorWaitingForOperand) {
        calculatorCurrentInput = digit;
        calculatorWaitingForOperand = false;
    } else {
        calculatorCurrentInput =
            calculatorCurrentInput === "0"
                ? digit
                : calculatorCurrentInput + digit;
    }

    updateCalculatorDisplay();
}

function inputCalculatorDecimal() {
    if (calculatorResult.classList.contains("error")) {
        calculatorResult.classList.remove("error");
        calculatorCurrentInput = "0";
    }

    if (calculatorWaitingForOperand) {
        calculatorCurrentInput = "0.";
        calculatorWaitingForOperand = false;

        updateCalculatorDisplay();
        return;
    }

    if (!calculatorCurrentInput.includes(".")) {
        calculatorCurrentInput += ".";
    }

    updateCalculatorDisplay();
}

function performCalculatorOperation(
    firstValue,
    secondValue,
    operator
) {
    switch (operator) {
        case "+":
            return firstValue + secondValue;

        case "-":
            return firstValue - secondValue;

        case "*":
            return firstValue * secondValue;

        case "/":
            if (secondValue === 0) {
                throw new Error(
                    "Cannot divide by zero"
                );
            }

            return firstValue / secondValue;

        default:
            return secondValue;
    }
}

function addCalculatorHistoryItem(
    expression,
    result
) {
    calculatorHistory.unshift({
        expression,
        result
    });

    calculatorHistory =
        calculatorHistory.slice(
            0,
            MAX_CALCULATOR_HISTORY_ITEMS
        );

    saveCalculatorHistory();
    renderCalculatorHistory();
}

function selectCalculatorOperator(operator) {
    const inputValue = Number(
        calculatorCurrentInput
    );

    if (!Number.isFinite(inputValue)) {
        showCalculatorError("Invalid number");
        return;
    }

    if (
        calculatorPendingOperator &&
        !calculatorWaitingForOperand &&
        calculatorStoredValue !== null
    ) {
        try {
            const result = performCalculatorOperation(
                calculatorStoredValue,
                inputValue,
                calculatorPendingOperator
            );

            calculatorCurrentInput =
                formatCalculatorNumber(result);

            calculatorStoredValue = result;
        } catch (error) {
            showCalculatorError(error.message);
            return;
        }
    } else {
        calculatorStoredValue = inputValue;
    }

    calculatorPendingOperator = operator;
    calculatorWaitingForOperand = true;

    updateCalculatorDisplay();
}

function calculateCalculatorResult() {
    if (
        calculatorStoredValue === null ||
        !calculatorPendingOperator
    ) {
        return;
    }

    const secondValue = Number(
        calculatorCurrentInput
    );

    if (!Number.isFinite(secondValue)) {
        showCalculatorError("Invalid number");
        return;
    }

    const firstValue = calculatorStoredValue;
    const operator = calculatorPendingOperator;

    try {
        const result = performCalculatorOperation(
            firstValue,
            secondValue,
            operator
        );

        const formattedResult =
            formatCalculatorNumber(result);

        const expression =
            `${formatCalculatorNumber(
                firstValue
            )} ${getCalculatorOperatorSymbol(
                operator
            )} ${formatCalculatorNumber(
                secondValue
            )}`;

        addCalculatorHistoryItem(
            expression,
            formattedResult
        );

        calculatorCurrentInput =
            formattedResult;

        calculatorStoredValue = null;
        calculatorPendingOperator = null;
        calculatorWaitingForOperand = true;

        calculatorExpression.textContent =
            `${expression} =`;

        calculatorResult.textContent =
            formattedResult;

        calculatorResult.classList.remove("error");
    } catch (error) {
        showCalculatorError(error.message);
    }
}

function clearCalculator() {
    calculatorCurrentInput = "0";
    calculatorStoredValue = null;
    calculatorPendingOperator = null;
    calculatorWaitingForOperand = false;

    updateCalculatorDisplay();
}

function deleteCalculatorCharacter() {
    if (
        calculatorWaitingForOperand ||
        calculatorResult.classList.contains("error")
    ) {
        return;
    }

    if (
        calculatorCurrentInput.length === 1 ||
        (
            calculatorCurrentInput.length === 2 &&
            calculatorCurrentInput.startsWith("-")
        )
    ) {
        calculatorCurrentInput = "0";
    } else {
        calculatorCurrentInput =
            calculatorCurrentInput.slice(0, -1);
    }

    updateCalculatorDisplay();
}

function toggleCalculatorSign() {
    if (calculatorCurrentInput === "0") {
        return;
    }

    calculatorCurrentInput =
        calculatorCurrentInput.startsWith("-")
            ? calculatorCurrentInput.slice(1)
            : `-${calculatorCurrentInput}`;

    updateCalculatorDisplay();
}

function applyCalculatorPercentage() {
    const numericValue = Number(
        calculatorCurrentInput
    );

    if (!Number.isFinite(numericValue)) {
        showCalculatorError("Invalid number");
        return;
    }

    calculatorCurrentInput =
        formatCalculatorNumber(
            numericValue / 100
        );

    updateCalculatorDisplay();
}

function saveCalculatorHistory() {
    try {
        localStorage.setItem(
            CALCULATOR_HISTORY_STORAGE_KEY,
            JSON.stringify(calculatorHistory)
        );
    } catch (error) {
        console.error(
            "Unable to save calculator history.",
            error
        );
    }
}

function loadCalculatorHistory() {
    let storedHistoryJson;

    try {
        storedHistoryJson = localStorage.getItem(
            CALCULATOR_HISTORY_STORAGE_KEY
        );
    } catch (error) {
        console.error(
            "Unable to access calculator history.",
            error
        );

        renderCalculatorHistory();
        return;
    }

    if (!storedHistoryJson) {
        renderCalculatorHistory();
        return;
    }

    try {
        const storedHistory =
            JSON.parse(storedHistoryJson);

        calculatorHistory =
            Array.isArray(storedHistory)
                ? storedHistory
                    .filter(
                        (historyItem) =>
                            historyItem &&
                            typeof historyItem.expression ===
                                "string" &&
                            typeof historyItem.result ===
                                "string"
                    )
                    .slice(
                        0,
                        MAX_CALCULATOR_HISTORY_ITEMS
                    )
                : [];
    } catch (error) {
        console.error(
            "Unable to load calculator history.",
            error
        );

        calculatorHistory = [];

        try {
            localStorage.removeItem(
                CALCULATOR_HISTORY_STORAGE_KEY
            );
        } catch (storageError) {
            console.error(
                "Unable to remove invalid calculator history.",
                storageError
            );
        }
    }

    renderCalculatorHistory();
}

function renderCalculatorHistory() {
    calculatorHistoryList.replaceChildren();

    calculatorHistoryEmpty.classList.toggle(
        "hidden",
        calculatorHistory.length > 0
    );

    calculatorHistory.forEach(
        (historyItem) => {
            const historyButton =
                document.createElement("button");

            historyButton.type = "button";
            historyButton.className =
                "calculator-history-item";

            const expressionElement =
                document.createElement("span");

            expressionElement.className =
                "calculator-history-expression";

            expressionElement.textContent =
                historyItem.expression;

            const resultElement =
                document.createElement("span");

            resultElement.className =
                "calculator-history-result";

            resultElement.textContent =
                `= ${historyItem.result}`;

            historyButton.append(
                expressionElement,
                resultElement
            );

            historyButton.addEventListener(
                "click",
                () => {
                    calculatorCurrentInput =
                        historyItem.result;

                    calculatorStoredValue = null;
                    calculatorPendingOperator = null;
                    calculatorWaitingForOperand = true;

                    calculatorExpression.textContent =
                        historyItem.expression;

                    calculatorResult.textContent =
                        historyItem.result;

                    calculatorResult.classList.remove(
                        "error"
                    );
                }
            );

            calculatorHistoryList.appendChild(
                historyButton
            );
        }
    );
}

function clearCalculatorHistory() {
    if (calculatorHistory.length === 0) {
        return;
    }

    const userConfirmed = window.confirm(
        "Clear calculator history?"
    );

    if (!userConfirmed) {
        return;
    }

    calculatorHistory = [];

    try {
        localStorage.removeItem(
            CALCULATOR_HISTORY_STORAGE_KEY
        );
    } catch (error) {
        console.error(
            "Unable to clear calculator history.",
            error
        );
    }

    renderCalculatorHistory();
}

function handleCalculatorAction(action) {
    switch (action) {
        case "clear":
            clearCalculator();
            break;

        case "delete":
            deleteCalculatorCharacter();
            break;

        case "decimal":
            inputCalculatorDecimal();
            break;

        case "toggle-sign":
            toggleCalculatorSign();
            break;

        case "percent":
            applyCalculatorPercentage();
            break;

        case "equals":
            calculateCalculatorResult();
            break;

        default:
            break;
    }
}

function isCalculatorWindowVisible() {
    const calculatorWindow =
        getWindowById("calculator-window");

    return (
        calculatorWindow &&
        isWindowVisible(calculatorWindow)
    );
}

function flashCalculatorKey(selector) {
    const key = calculatorKeypad.querySelector(
        selector
    );

    if (!key) {
        return;
    }

    key.classList.add("key-pressed");

    window.setTimeout(
        () => {
            key.classList.remove("key-pressed");
        },
        100
    );
}

function handleCalculatorKeyboard(event) {
    if (!isCalculatorWindowVisible()) {
        return;
    }

    if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();

        inputCalculatorDigit(event.key);

        flashCalculatorKey(
            `[data-calculator-number="${event.key}"]`
        );

        return;
    }

    if (
        ["+", "-", "*", "/"].includes(
            event.key
        )
    ) {
        event.preventDefault();

        selectCalculatorOperator(event.key);

        flashCalculatorKey(
            `[data-calculator-operator="${event.key}"]`
        );

        return;
    }

    if (event.key === ".") {
        event.preventDefault();

        inputCalculatorDecimal();

        flashCalculatorKey(
            '[data-calculator-action="decimal"]'
        );

        return;
    }

    if (
        event.key === "Enter" ||
        event.key === "="
    ) {
        event.preventDefault();

        calculateCalculatorResult();

        flashCalculatorKey(
            '[data-calculator-action="equals"]'
        );

        return;
    }

    if (event.key === "Backspace") {
        event.preventDefault();

        deleteCalculatorCharacter();

        flashCalculatorKey(
            '[data-calculator-action="delete"]'
        );

        return;
    }

    if (
    event.key.toLowerCase() === "c"
) {
    event.preventDefault();

    clearCalculator();

    flashCalculatorKey(
        '[data-calculator-action="clear"]'
    );

    return;
}

    if (event.key === "%") {
        event.preventDefault();

        applyCalculatorPercentage();

        flashCalculatorKey(
            '[data-calculator-action="percent"]'
        );
    }
}

function registerCalculatorEvents() {
    if (
        !calculatorExpression ||
        !calculatorResult ||
        !calculatorKeypad ||
        !calculatorHistoryList ||
        !calculatorHistoryEmpty ||
        !clearCalculatorHistoryButton
    ) {
        console.error(
            "Calculator initialization failed. Check the Hour 9 Calculator HTML."
        );

        return;
    }

    calculatorKeypad.addEventListener(
        "click",
        (event) => {
            const calculatorKey =
                event.target.closest(
                    ".calculator-key"
                );

            if (!calculatorKey) {
                return;
            }

            const number =
                calculatorKey.dataset.calculatorNumber;

            const operator =
                calculatorKey.dataset.calculatorOperator;

            const action =
                calculatorKey.dataset.calculatorAction;

            if (number !== undefined) {
                inputCalculatorDigit(number);
                return;
            }

            if (operator) {
                selectCalculatorOperator(operator);
                return;
            }

            if (action) {
                handleCalculatorAction(action);
            }
        }
    );

    clearCalculatorHistoryButton.addEventListener(
        "click",
        clearCalculatorHistory
    );

    document.addEventListener(
        "keydown",
        handleCalculatorKeyboard
    );
}

/* =========================================================
   Desktop-state persistence
   ========================================================= */

/**
 * Returns a window's current saved state.
 * 
 * @param{HTMLElement} windowElement
 * @returns {object}
 */

function getWindowDesktopState(windowElement) {
    const computedStyle = window.getComputedStyle(
        windowElement
    );

    const maximized =
        isWindowMaximized(windowElement);

    const normalState =
        normalWindowStates.get(windowElement.id);

    return {
        id: windowElement.id,

        open: isWindowOpen(windowElement),

        minimized: isWindowMinimized(
            windowElement
        ),

        maximized,

        active: windowElement.classList.contains(
            "active-window"
        ),

        left:
            maximized && normalState
                ? normalState.left
                : parsePixelValue(
                    computedStyle.left
                ),

        top:
            maximized && normalState
                ? normalState.top
                : parsePixelValue(
                    computedStyle.top
                ),

        width:
            maximized && normalState
                ? normalState.width
                : windowElement.offsetWidth,

        height:
            maximized && normalState
                ? normalState.height
                : windowElement.offsetHeight,

        zIndex: Number(
            windowElement.style.zIndex || 0
        )
    };
}

/**
 * Builds the complete desktop layout object.
 * 
 * @returns {{windows: object[], savedAt: string}}
 */

function getCurrentDesktopState() {
    return {
        windows: applicationWindows.map(
            getWindowDesktopState
        ),

        savedAt: new Date().toISOString()
    };
}

/**
 * Saves the desktop layout immediatley.
 */

function saveDesktopState() {
    if (suppressDesktopStateSave) {
        return;
    }

    const desktopState =
        getCurrentDesktopState();

    try {
        localStorage.setItem(
            DESKTOP_STATE_STORAGE_KEY,
            JSON.stringify(desktopState)
        );
    } catch (error) {
        console.error(
            "Unable to save desktop state.",
            error
        );
    }
}

/**
 * Delays saving while the user is moving or changing windows.
 */

function scheduleDesktopStateSave() {
    if (desktopStateSaveTimeoutId !== null) {
        window.clearTimeout(
            desktopStateSaveTimeoutId
        );
    }

    desktopStateSaveTimeoutId = 
        window.setTimeout(
            () => {
                saveDesktopState();

                desktopStateSaveTimeoutId = null;
            },
            250
        );
}

/**
 * Returns true when a saved number can be used safely.
 * 
 * @param{*} value
 * @returns {boolean}
 */

function isValidSavedNumber(value) {
    return (
        typeof value === "number" &&
        Number.isFinite(value)
    );
}

/**
 * Applies saved position and size vues to one window.
 * 
 * @param {HTMLElement} windowElement
 * @param {object} savedWindowState
 */

function applySavedWindowGeometry(
    windowElement,
    savedWindowState
) {
    if (
        isValidSavedNumber(
            savedWindowState.left
        )
    ) {
        windowElement.style.left = 
            `${savedWindowState.left}px`;
    }

    if (
        isValidSavedNumber(
            savedWindowState.top
        )
    ) {
        windowElement.style.top =
            `${savedWindowState.top}px`;
    }

    if (
        isValidSavedNumber(
            savedWindowState.width
        ) &&
        savedWindowState.width >= 300
    ) {
        windowElement.style.width = 
            `${savedWindowState.width}px`;
    }

    if (
        isValidSavedNumber(
            savedWindowState.height
        ) &&
        savedWindowState.height >= 260
    ) {
        windowElement.style.height = 
            `${savedWindowState.height}px`;
    }

    if (
        isValidSavedNumber(
            savedWindowState.zIndex
        )
    ) {
        windowElement.style.zIndex = 
            String(savedWindowState.zIndex);

        highestWindowZIndex = Math.max(
            highestWindowZIndex,
            savedWindowState.zIndex
        );
    }
}

/**
 * Applies saved open, minimized, maximized, and active states.
 * 
 * @param {HTMLElement} widowElement
 * @param {object} savedWindowState
 */

function applySavedWindowVisibility(
    windowElement,
    savedWindowState
) {
    windowElement.classList.remove(
        "active-window",
        "dragging",
        "maximized"
    );

    windowElement.dataset.minimized = "false";
    windowElement.dataset.maximized = "false";

    const shouldBeOpen =
        savedWindowState.open === true;

    const shouldBeMinimized =
        savedWindowState.minimized === true;

    const shouldBeMaximized =
        savedWindowState.maximized === true;

    if (!shouldBeOpen) {
        windowElement.classList.add("hidden");

        updateMaximizeButton(
            windowElement,
            false
        );

        return;
    }

    if (shouldBeMinimized) {
        windowElement.classList.add("hidden");
        windowElement.dataset.minimized = "true";

        updateMaximizeButton(
            windowElement,
            false
        );

        return;
    }

    windowElement.classList.remove("hidden");

    if (shouldBeMaximized) {
        saveNormalWindowState(windowElement);

        windowElement.classList.add("maximized");
        windowElement.dataset.maximized = "true";

        updateMaximizeButton(
            windowElement,
            true
        );
    } else {
        updateMaximizeButton(
            windowElement,
            false
        );
    }

    if (savedWindowState.active === true) {
        windowElement.classList.add(
            "active-window"
        );
    }
}

/**
 * Applies one saved window-state object.
 *
 * @param {object} savedWindowState
 */
function restoreWindowDesktopState(
    savedWindowState
) {
    if (
        !savedWindowState ||
        typeof savedWindowState.id !== "string"
    ) {
        return;
    }

    const windowElement = getWindowById(
        savedWindowState.id
    );

    if (!windowElement) {
        return;
    }

    applySavedWindowGeometry(
        windowElement,
        savedWindowState
    );

    applySavedWindowVisibility(
        windowElement,
        savedWindowState
    );

    if (
        isWindowVisible(windowElement) &&
        !isWindowMaximized(windowElement)
    ) {
        keepWindowInsideDesktop(windowElement);
    }
}

/**
 * Recreates taskbar buttons after desktop restoration.
 */
function rebuildTaskbarFromDesktopState() {
    taskbarApplications.replaceChildren();

    applicationWindows.forEach(
        (windowElement) => {
            if (isWindowOpen(windowElement)) {
                createTaskbarButton(
                    windowElement
                );
            }
        }
    );

    updateTaskbarState();
}

/**
 * Ensures only one visible application is active.
 */
function repairActiveWindowState() {
    const activeVisibleWindows =
        applicationWindows.filter(
            (windowElement) =>
                isWindowVisible(windowElement) &&
                windowElement.classList.contains(
                    "active-window"
                )
        );

    if (activeVisibleWindows.length === 1) {
        focusWindow(
            activeVisibleWindows[0]
        );

        return;
    }

    if (activeVisibleWindows.length > 1) {
        const highestActiveWindow =
            activeVisibleWindows.reduce(
                (
                    currentHighest,
                    currentWindow
                ) => {
                    const highestZIndex =
                        Number(
                            currentHighest.style
                                .zIndex || 0
                        );

                    const currentZIndex =
                        Number(
                            currentWindow.style
                                .zIndex || 0
                        );

                    return currentZIndex >
                        highestZIndex
                        ? currentWindow
                        : currentHighest;
                }
            );

        clearActiveWindows();

        highestActiveWindow.classList.add(
            "active-window"
        );

        updateTaskbarState();
        return;
    }

    focusHighestVisibleWindow();
}

/**
 * Loads the previously saved desktop layout.
 *
 * @returns {boolean}
 */
function loadDesktopState() {
    let savedDesktopStateJson;

        try {
            savedDesktopStateJson =
                localStorage.getItem(
                    DESKTOP_STATE_STORAGE_KEY
                );
        } catch (error) {
            console.error(
                "Unable to access saved desktop state.",
                error
            );

            return false;
        }

        if (!savedDesktopStateJson) {
            return false;
        }

        try {
            const savedDesktopState =
                JSON.parse(
                    savedDesktopStateJson
                );

            if (
                !savedDesktopState ||
                !Array.isArray(
                    savedDesktopState.windows
                )
            ) {
                throw new Error(
                    "Invalid desktop-state structure"
                );
            }

            savedDesktopState.windows.forEach(
                restoreWindowDesktopState
            );

            rebuildTaskbarFromDesktopState();
            repairActiveWindowState();

            return true;
        } catch (error) {
            console.error(
                "Unable to restore desktop state.",
                error
            );

            try {
                localStorage.removeItem(
                    DESKTOP_STATE_STORAGE_KEY
                );
            } catch (storageError) {
                console.error(
                    "Unable to remove invalid desktop state.",
                    storageError
                );
            }

            return false;
        }
    }

    /**
    * Resets window positions and open states.
    */
    function resetDesktopState() {
    const userConfirmed = window.confirm(
        "Reset all window positions and desktop layout?"
    );

    if (!userConfirmed) {
        return;
    }

    suppressDesktopStateSave = true;

    if (desktopStateSaveTimeoutId !== null) {
        window.clearTimeout(
            desktopStateSaveTimeoutId
        );

        desktopStateSaveTimeoutId = null;
    }

    try {
        localStorage.removeItem(
            DESKTOP_STATE_STORAGE_KEY
        );
    } catch (error) {
        console.error(
            "Unable to reset desktop state.",
            error
        );
    }

    window.location.reload();
}

    /**
    * Saves state before the browser tab closes or refreshes.
    */
    function handlePageBeforeUnload() {
        if (!suppressDesktopStateSave) {
        saveDesktopState();
    }
}

/* =========================================================
   Global keyboard shortcuts
   ========================================================= */

   function openApplicationFromShortcut(key) {
    const normalizedKey =
        key.toLowerCase();

    const windowId =
        APPLICATION_SHORTCUTS[
            normalizedKey
        ];

    if (!windowId) {
        return false;
    }

    openWindow(windowId);

    return true;
   }

   function handleWebOSKeyboardShortcuts(event) {
    const activeElement = 
    document.activeElement;

    const typing = 
        isEditableElement(activeElement);

    const normalizedKey = 
        event.key.toLowerCase();
    
    if (
        event.ctrlKey &&
        event.altKey &&
        !event.shiftKey &&
        !event.metaKey
    ) {
        if (
            normalizedKey === "r" &&
            !typing
        ) {
            event.preventDefault();
            resetDesktopState();
            return;
        }

        if (
            openApplicationFromShortcut(
                normalizedKey
            )
        ) {
            event.preventDefault();
            return;
        }
    }

    if (
        !event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        typing
    ) {
        return;
    }

    const activeWindow =
        getActiveWindow();

    if (!activeWindow) {
        return;
    }

    if (
        event.key === "F4"
    ) {
        event.preventDefault();

        closeWindow(activeWindow);
        return;
    }

    if (
        normalizedKey === "m"
    ) {
        event.preventDefault();

        minimizeWindow(activeWindow);
        return;
    }

    if (
        normalizedKey === "x"
    ) {
        event.preventDefault();

        toggleMaximizeWindow(
            activeWindow
        );
    }
}

function registerGlobalKeyboardShortcuts() {
    document.addEventListener(
        "keydown",
        handleWebOSKeyboardShortcuts
    );
}

/* =========================================================
   Final project diagnostics
   ========================================================= */

function createDiagnosticResult(
    name,
    passed,
    details
) {
    return {
        name,
        passed,
        details
    };
}

function checkRequiredElements() {
    const missingElementIds =
        REQUIRED_ELEMENT_IDS.filter(
            (elementId) =>
                !document.getElementById(
                    elementId
                )
        );

    return createDiagnosticResult(
        "Required HTML elements",
        missingElementIds.length === 0,
        missingElementIds.length === 0
            ? "All required elements are present."
            : `Missing: ${
                missingElementIds.join(", ")
            }`
    );
}

function checkApplicationWindows() {
    const missingApplicationIds =
        EXPECTED_APPLICATION_IDS.filter(
            (windowId) =>
                !document.getElementById(
                    windowId
                )
        );

    return createDiagnosticResult(
        "Application windows",
        missingApplicationIds.length === 0 &&
            applicationWindows.length ===
                EXPECTED_APPLICATION_IDS.length,

        missingApplicationIds.length === 0
            ? `${applicationWindows.length} application windows detected.`
            : `Missing: ${
                missingApplicationIds.join(", ")
            }`
    );
}

function checkApplicationLaunchers() {
    const launcherCounts =
        EXPECTED_APPLICATION_IDS.map(
            (windowId) => ({
                windowId,

                count:
                    document.querySelectorAll(
                        `[data-open-window="${windowId}"]`
                    ).length
            })
        );

    const invalidLaunchers =
        launcherCounts.filter(
            (launcher) =>
                launcher.count !== 2
        );

    return createDiagnosticResult(
        "Application launchers",
        invalidLaunchers.length === 0,
        invalidLaunchers.length === 0
            ? "Every application has a desktop and Start-menu launcher."
            : invalidLaunchers
                .map(
                    (launcher) =>
                        `${launcher.windowId}: ${launcher.count}`
                )
                .join(", ")
    );
}

function checkDuplicateIds() {
    const duplicateIds =
        getDuplicateHtmlIds();

    return createDiagnosticResult(
        "Unique HTML IDs",
        duplicateIds.length === 0,
        duplicateIds.length === 0
            ? "No duplicate HTML IDs found."
            : `Duplicates: ${
                duplicateIds.join(", ")
            }`
    );
}

function checkWindowAccessibility() {
    const invalidTitleBars =
        applicationWindows.filter(
            (windowElement) => {
                const titleBar =
                    windowElement.querySelector(
                        ".window-header"
                    );

                return (
                    !titleBar ||
                    titleBar.tabIndex !== 0
                );
            }
        );

    return createDiagnosticResult(
        "Window accessibility",
        invalidTitleBars.length === 0,
        invalidTitleBars.length === 0
            ? "All title bars are keyboard-focusable."
            : `Invalid windows: ${
                invalidTitleBars
                    .map(
                        (windowElement) =>
                            windowElement.id
                    )
                    .join(", ")
            }`
    );
}

function checkWindowMetadata() {
    const invalidWindows =
        applicationWindows.filter(
            (windowElement) =>
                !windowElement.dataset.appTitle ||
                !windowElement.dataset.appIcon ||
                !windowElement.id
        );

    return createDiagnosticResult(
        "Window metadata",
        invalidWindows.length === 0,
        invalidWindows.length === 0
            ? "All applications have titles, icons, and IDs."
            : `Invalid windows: ${
                invalidWindows
                    .map(
                        (windowElement) =>
                            windowElement.id ||
                            "unnamed window"
                    )
                    .join(", ")
            }`
    );
}

function checkBrowserStorage() {
    const storageAvailable =
        isLocalStorageAvailable();

    return createDiagnosticResult(
        "Browser storage",
        storageAvailable,
        storageAvailable
            ? "Local storage is available."
            : "Local storage is unavailable."
    );
}

function checkStartMenuCount() {
    const startApplications =
        startAppList.querySelectorAll(
            ".start-app"
        );

    const countCorrect =
        startApplications.length ===
            EXPECTED_APPLICATION_IDS.length;

    return createDiagnosticResult(
        "Start-menu application count",
        countCorrect,
        `${startApplications.length} applications detected.`
    );
}

function checkNatureChallenges() {
    const challengeCount =
        natureChallengeCards.length;

    return createDiagnosticResult(
        "Nature challenges",
        challengeCount === 6,
        `${challengeCount} challenges detected.`
    );
}

function runWebOSDiagnostics() {
    return [
        checkRequiredElements(),
        checkApplicationWindows(),
        checkApplicationLaunchers(),
        checkDuplicateIds(),
        checkWindowAccessibility(),
        checkWindowMetadata(),
        checkBrowserStorage(),
        checkStartMenuCount(),
        checkNatureChallenges()
    ];
}

function renderDiagnosticResult(result) {
    const resultItem =
        document.createElement("li");

    resultItem.className =
        `diagnostics-result ${
            result.passed
                ? "passed"
                : "failed"
        }`;

    const icon =
        document.createElement("span");

    icon.className =
        "diagnostics-result-icon";

    icon.setAttribute(
        "aria-hidden",
        "true"
    );

    icon.textContent =
        result.passed ? "✓" : "!";

    const content =
        document.createElement("div");

    const title =
        document.createElement("strong");

    title.textContent = result.name;

    const details =
        document.createElement("div");

    details.textContent =
        result.details;

    content.append(
        title,
        details
    );

    resultItem.append(
        icon,
        content
    );

    return resultItem;
}

function updateSystemStatus(
    passedCount,
    totalCount
) {
    const allPassed =
        passedCount === totalCount;

    systemStatusCard.classList.toggle(
        "failed",
        !allPassed
    );

    systemStatusDot.classList.toggle(
        "failed",
        !allPassed
    );

    systemStatusText.textContent =
        allPassed
            ? "All diagnostics passed"
            : `${totalCount - passedCount} diagnostic checks need attention`;
}

function displayWebOSDiagnostics() {
    const diagnosticResults =
        runWebOSDiagnostics();

    const passedCount =
        diagnosticResults.filter(
            (result) => result.passed
        ).length;

    diagnosticsResults.replaceChildren(
        ...diagnosticResults.map(
            renderDiagnosticResult
        )
    );

    diagnosticsPanel.classList.remove(
        "hidden"
    );

    const allPassed =
        passedCount ===
        diagnosticResults.length;

    diagnosticsSummary.classList.remove(
        "passed",
        "failed"
    );

    diagnosticsSummary.classList.add(
        allPassed
            ? "passed"
            : "failed"
    );

    diagnosticsSummary.textContent =
        `${passedCount} of ${
            diagnosticResults.length
        } passed`;

    updateSystemStatus(
        passedCount,
        diagnosticResults.length
    );

    announceWebOS(
        allPassed
            ? "All WebOS diagnostics passed"
            : `${
                diagnosticResults.length -
                passedCount
            } WebOS diagnostics failed`
    );
}

function registerDiagnosticsEvents() {
    if (
        !runDiagnosticsButton ||
        !diagnosticsPanel ||
        !diagnosticsResults ||
        !diagnosticsSummary ||
        !systemStatusCard ||
        !systemStatusDot ||
        !systemStatusText
    ) {
        console.error(
            "Diagnostics initialization failed. Check the Hour 12 HTML."
        );

        return;
    }

    runDiagnosticsButton.addEventListener(
        "click",
        displayWebOSDiagnostics
    );
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

function registerNotesEvents() {
    notesTitle.addEventListener(
        "input",
        scheduleNoteAutoSave
    );

    notesEditor.addEventListener(
        "input",
        () => {
            updateNoteStatistics();
            scheduleNoteAutoSave();
        }
    );

    saveNoteButton.addEventListener(
        "click",
        saveNote
    );

    clearNoteButton.addEventListener(
        "click",
        clearNote
    );

    document.addEventListener(
        "keydown",
        handleNotesKeyboardShortcut
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

            dragHandle.addEventListener(
                "keydown",
                (event) => {
                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {
                        event.preventDefault();

                        toggleMaximizeWindow(
                            windowElement
                        );
                    }
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

function getDuplicateHtmlIds() {
    const idCounts = new Map();

    document.querySelectorAll("[id]").forEach(
        (element) => {
            const elementId = element.id;

            idCounts.set(
                elementId,
                (
                    idCounts.get(elementId) ||
                    0
                ) + 1
            );
        }
    );

    return Array.from(
        idCounts.entries()
    )
        .filter(
            ([, count]) => count > 1
        )
        .map(
            ([elementId]) => elementId
        );
}

function logStartupIntegrity() {
    const diagnostics =
        runWebOSDiagnostics();

    const failures =
        diagnostics.filter(
            (result) => !result.passed
        );

    if (failures.length === 0) {
        console.info(
            "GreenSpace WebOS startup checks passed."
        );

        return;
    }

    console.group(
        "GreenSpace WebOS startup issues"
    );

    failures.forEach((failure) => {
        console.error(
            `${failure.name}: ${failure.details}`
        );
    });

    console.groupEnd();
}

function initializeWebOS() {
    updateClock();

    window.setInterval(
        updateClock,
        1000
    );

    registerApplicationLaunchEvents();
    registerStartMenuEvents();
    registerWindowEvents();
    registerNotesEvents();
    registerNatureEvents();
    registerSettingsEvents();
    registerCalculatorEvents();
    registerGlobalKeyboardShortcuts();
    registerDiagnosticsEvents();

    updateStartApplicationCount();
    logStartupIntegrity();

    loadWebOSSettings();
    loadSavedNote();
    loadNatureProgress();
    loadCalculatorHistory();

    updateCalculatorDisplay();

    const desktopStateRestored =
        loadDesktopState();

    if (!desktopStateRestored) {
        initializeOpenWindows();
        saveDesktopState();
    }

    window.addEventListener(
        "resize",
        keepAllWindowsInsideDesktop
    );

    window.addEventListener(
        "beforeunload",
        handlePageBeforeUnload
    );

    announceWebOS(
        "GreenSpace WebOS is ready"
    );
}

initializeWebOS();