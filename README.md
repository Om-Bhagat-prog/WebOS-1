# GreenSpace WebOS

GreenSpace WebOS is a browser-based desktop environment created for the Hack Club WebOS 1 mission.

The project is being built in focused one-hour development sessions. Each session introduces a small set of working features and refines the code from earlier sessions.

## Current status

Hour 2 is complete.

The project currently provides:

- A custom desktop background
- Three desktop application icons
- A Welcome application
- A Notes preview application
- A Nature application
- Reusable application-window behavior
- Working open controls
- Working close controls
- Window focus and stacking
- Dynamic taskbar application buttons
- Active-window taskbar highlighting
- A Start button placeholder
- A system tray
- A live clock and date
- Responsive behavior for smaller screens

Application windows are not draggable yet. Dragging will be implemented during Hour 3.

Minimize and maximize controls remain disabled. Those controls will be implemented after dragging and window positioning are stable.

## Applications

### Welcome

The Welcome application introduces GreenSpace WebOS and explains the current state of the project.

### Notes

The Notes application currently displays the project’s development plan as preview cards.

Editable notes and browser storage will be added in a later development hour.

### Nature

The Nature application presents environmental ideas related to planting, conserving water, and reusing materials.

## Window behavior

Each application window has an HTML id and application metadata:

```html
<section
    id="notes-window"
    data-window
    data-app-title="Notes"
    data-app-icon="📝"
>
```

The JavaScript uses this metadata to create the correct taskbar button.

The window system supports:

1. Opening a hidden window
2. Focusing an already-open window
3. Moving the selected window above other windows
4. Marking the selected window as active
5. Creating its taskbar button
6. Removing its taskbar button when closed
7. Focusing the highest remaining window after a close

## Technologies used

- HTML5
- CSS3
- JavaScript
- DOM API
- JavaScript Date API
- CSS custom properties
- CSS Grid
- CSS Flexbox
- Responsive media queries
- HTML data attributes
- Dynamic DOM element creation
- Event propagation control
- Layer management with `z-index`

## Project structure

```text
webos-1/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Running the project

### Option 1: Open the file directly

Open `index.html` in a web browser.

### Option 2: Use VS Code Live Server

1. Open the project folder in Visual Studio Code.
2. Install the Live Server extension.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

## Development logs

### Devlog 1 — Desktop foundation

#### Goal

Create the visual foundation for the WebOS project.

#### Work completed

- Created the initial project structure
- Created a custom environmental desktop theme
- Added three desktop application icons
- Created the first application window
- Added a taskbar and Start button
- Added a running application indicator
- Added internet and sound indicators
- Added a live clock and date
- Added responsive behavior for smaller screens
- Added placeholder feedback for future features

#### Technical decisions

The desktop uses CSS gradients rather than an external wallpaper image. This keeps the project lightweight and prevents the interface from depending on an external image service.

CSS custom properties store shared colors and dimensions so later theme changes can be made in one place.

The clock logic is isolated inside an `updateClock` function. It runs when the page loads and updates every second.

#### Challenges

The main challenge was keeping the desktop usable on both large and small screens. Media queries change the desktop icon arrangement, application position, and taskbar labels on smaller displays.

---

### Devlog 2 — Reusable application windows

#### Goal

Convert the static desktop into a multi-application interface.

#### Improvements to Hour 1

- Removed unnecessary scrolling from the Welcome window
- Reduced excess content spacing
- Replaced application placeholder alerts with real windows
- Enabled the close buttons
- Improved active and inactive window styling
- Changed the desktop icons to open applications with one click
- Replaced the Start button alert with an in-desktop status message

#### Work completed

- Added a Notes preview application
- Added a Nature application
- Added reusable window opening behavior
- Added reusable window closing behavior
- Added active-window tracking
- Added automatic `z-index` management
- Added dynamic taskbar buttons
- Added active taskbar highlighting
- Added automatic focus selection after closing a window
- Improved responsive behavior for multiple windows

#### Technical decisions

Window behavior is handled by reusable functions rather than separate code for each application.

The important functions are:

```javascript
openWindow();
closeWindow();
focusWindow();
createTaskbarButton();
removeTaskbarButton();
```

Each window stores its application name and icon in `data-*` attributes. This allows JavaScript to build the correct taskbar button without duplicating application configuration in multiple places.

A single `highestWindowZIndex` variable controls stacking. Whenever a window receives focus, the number increases and is assigned to that window.

#### Challenges

The main challenge was synchronizing three different pieces of interface state:

- Window visibility
- Active-window highlighting
- Taskbar buttons

The solution was to keep these operations inside a small group of window-management functions instead of changing classes independently throughout the code.

#### Next development hour

Hour 3 will make application windows draggable.

The next version will:

- Use the title bar as a drag handle
- Track pointer movement
- Support mouse, pen, and touch input
- Prevent windows from becoming completely unreachable
- Improve focus behavior while dragging

## Planned features

- Draggable windows
- Window position boundaries
- Minimize and restore behavior
- Maximize and restore behavior
- Start menu
- Editable Notes application
- Browser note storage
- Theme selection
- Additional original features
- Accessibility refinement
- Deployment with GitHub Pages