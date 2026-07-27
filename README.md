# GreenSpace WebOS

GreenSpace WebOS is a browser-based desktop environment created for the Hack Club WebOS 1 mission.

The project is being built in focused one-commit development sessions. Each session introduces a small set of working features and refines the code from earlier sessions.

## Current status

Commit 4 is complete.

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
- Draggable application windows
- Mouse, touch, and pen dragging support
- Safe window-position boundaries
- Automatic position correct after browser resizing
- Window minimization
- Taskbar restoration
- Maximize and restore behavior
- Double-click title-bar maximization
- Saved normal window positions
- Active taskbar-button minimization
- Dynamic taskbar application buttons
- Active-window taskbar highlighting
- A Start button placeholder
- A system tray
- A live clock and date
- Responsive behavior for smaller screens

Application windows can now be moved by dragging their title bars.

The dragging system keeps enough of each title bar visible so windows remain recoverable. It also prevents title bars from being dragged behind the taskbar.

Minimize, maximize, and restore controls are now functional.

A minimized application remains open and keeps its taskbar button. A maximized application stores its earlier position and dimensions so it can return to its previous layout.

## Applications

### Welcome

The Welcome application introduces GreenSpace WebOS and explains the current state of the project.

### Notes

The Notes application currently displays the project’s development plan as preview cards.

Editable notes and browser storage will be added in a later development commit.

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

## Window dragging

Each application title bar contains a `data-drag-handle` attribute:

```html
<header
    class="window-header"
    data-drag-handle
>
```

JavaScript applies dragging behavior to every application window through:

```javascript
makeWindowDraggable(windowElement);
```

The project uses Pointer Events rather than separate mouse and touch event handlers. This provides one event model for:

- Mouse input
- Touchscreen input
- Pen input

During dragging, JavaScript records:

1. The pointer's starting coordinates
2. The window's starting position
3. The pointer's current movement
4. The proposed new window position
5. A corrected position that remains inside safe desktop boundaries

The browser's pointer-capture feature allows dragging to continue even when the pointer temporarily moves outside the title bar.

## Window states

Each application may be in one of several states:

- Closed
- Open and visible
- Open and minimized
- Open and maximized
- Active
- Inactive

Minimized and maximized states are recorded using HTML data attributes:

```html
data-minimized="false"
data-maximized="false"
```

Normal window positions and dimensions are stored in a JavaScript `Map` before maximization:

```javascript
const normalWindowStates = new Map();
```

This allows a maximized window to return to its earlier position, width, and height.

Taskbar buttons now have three behaviors:

1. Clicking a minimized application restores it.
2. Clicking an active application minimizes it.
3. Clicking an inactive visible application brings it to the front.

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
- Pointer Events API
- Pointer capture
- CSS `touch-action`
- Computed CSS styles
- Safe coordinate calculations
- JavaScript `Map`
- Window-state management
- CSS state classes
- Dynamic ARIA-label updates
- Reduced-motion media query

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

#### Improvements to Commit 1

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

#### Next development commit

Commit 3 will make application windows draggable.

The next version will:

- Use the title bar as a drag handle
- Track pointer movement
- Support mouse, pen, and touch input
- Prevent windows from becoming completely unreachable
- Improve focus behavior while dragging

---

### Devlog 3 — Draggable application windows

#### Goal

Make all application windows draggable while ensuring they remain reachable inside the desktop.

#### Improvements to Commit 2

- Converted static overlapping windows into movable windows
- Added a clear drag cursor to application title bars
- Added visual feedback while dragging
- Preserved the existing active-window and taskbar behavior
- Added browser-resize protection
- Prevented title bars from being moved behind the taskbar

#### Work completed

- Marked each application title bar as a drag handle
- Added reusable pointer-based dragging behavior
- Added mouse, touch, and pen support
- Added pointer capture during dragging
- Added safe horizontal and vertical boundaries
- Added active-window focus when dragging begins
- Added a raised shadow while a window is moving
- Added automatic window correction after browser resizing

#### Technical decisions

The dragging system uses Pointer Events instead of separate mouse and touch events. This avoids maintaining multiple versions of the same interaction code.

The application records the pointer's original position and the window's original position when dragging begins. During movement, it calculates the difference and applies that difference to the window.

A boundary function keeps part of the title bar visible. This is more flexible than forcing the entire window to remain inside the desktop, while still preventing the window from becoming permanently unreachable.

#### Challenges

The main challenge was preventing accidental dragging when the user clicks a window-control button.

The drag-start function checks whether the pointer started inside `.window-control`. When it does, dragging is not started.

Another challenge was ensuring windows remain accessible after the browser becomes smaller. A resize listener now checks and corrects every open window's position.

#### Next development commit

Commit 4 will add:

- Window minimization
- Taskbar restoration
- Maximize and restore behavior
- Saved normal window positions
- Improved taskbar interactions

---

### Devlog 4 — Window minimize, maximize, and restore

#### Goal

Complete the main application-window controls.

#### Improvements to Commit 3

- Enabled the previously disabled window controls
- Prevented maximized windows from being dragged
- Preserved normal window dimensions before maximizing
- Improved taskbar interactions
- Added minimized application indicators
- Added reduced-motion accessibility support

#### Work completed

- Added working minimize buttons
- Added taskbar restoration for minimized applications
- Added maximize controls
- Added restoration to the previous position and size
- Added double-click title-bar maximization
- Changed the maximize icon while a window is maximized
- Updated accessible labels dynamically
- Added active taskbar-button minimization
- Added minimized taskbar styling
- Reset window state when an application is closed

#### Technical decisions

A minimized application is hidden visually but remains open. Its taskbar button stays available so the application can be restored.

A closed application is different: its taskbar button is removed, and its saved maximized state is cleared.

Before maximizing, the application stores its current left position, top position, width, and height inside a JavaScript `Map`. Restoring the window retrieves these values.

#### Challenges

The main challenge was distinguishing between hidden because closed and hidden because minimized.

The solution was to add a separate `data-minimized` state. The `hidden` class controls visibility, while the data attribute explains why the window is hidden.

Another challenge was making taskbar buttons perform different actions depending on the current window state.

#### Next development Commit

Commit 5 will replace the temporary Start message with a complete Start menu and application launcher.

## Planned features

- Maximize and restore behavior
- Editable Notes application
- Browser note storage
- Theme selection
- Additional original features
- Accessibility refinement
- Deployment with GitHub Pages
- Start menu
- Start-menu application launcher