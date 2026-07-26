"use strict";

const clockTime = document.getElementById("clock-time");
const clockDate = document.getElementById("clock-date");
const startButton = document.getElementById("start-button");

const desktopIcons = document.querySelectorAll(".desktop-icon");

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
        daya: "numeric"
    });
}

/**
 * Shows which applications are planned for later development.
 *
 * During Hour 1, only the Welcome window exists. The remaining
 * applications will become functional in later hours.
 */
function showPlannedApplication(appName) {
    if (appName === "Welcome") {
        return;
    }

    window.alert(
        `${appName} will be added during a future development hour.`
    );
}

/**
 * Gives temporary feedback when the Start button is clicked.
 *
 * A complete Start menu will be created in a later hour.
 */
function handleStartButtonClick() {
    window.alert(
        "The Start menu will be added in a future development hour."
    );
}

desktopIcons.forEach((desktopIcon) => {
    desktopIcon.addEventListener("dblclick", () => {
        const appName = desktopIcon.dataset.appName;

        showPlannedApplication(appName);
    });
});

startButton.addEventListener("click", handleStartButtonClick);

updateClock();

window.setInterval(updateClock, 1000);