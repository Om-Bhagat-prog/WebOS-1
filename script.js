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
   Application state
   ========================================================= */

let highestWindowZIndex = 20;
let notesAutoSaveTimeoutId = null;

const normalWindowStates = new Map();

const NOTES_STORAGE_KEY = "greenspace-webos-note";

const NATURE_STORAGE_KEY = 
    "greenspace-webos-nature-progress";

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

    loadSavedNote();
    loadNatureProgress();
    initializeOpenWindows();

    window.addEventListener(
        "resize",
        keepAllWindowsInsideDesktop
    );
}

initializeWebOS();