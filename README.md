# GreenSpace WebOS

GreenSpace WebOS is a browser-based desktop environment created for the Hack Club WebOS 1 mission.

The project is being built in focused one-commit development sessions. Each session introduces a small set of working features and refines the code from earlier sessions.

## Current status

Commit 8 is complete.

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
- Working Start menu
- Start-menu application launcher
- Working Notes text editor
- Notes title field
- Automatic browser saving
- Manual Save button
- Clear-note confirmation
- Word count
- Character count
- Saved-status indicator
- Ctrl + S keyboard shortcut
- Saved notes restored after refresh
- Application search
- Outside-click menu closing
- Escape-key menu closing
- Accessible Start-button state
- Responsive Start-menu layout
- Dynamic taskbar application buttons
- Active-window taskbar highlighting
- A Start button placeholder
- A system tray
- A live clock and date
- Responsive behavior for smaller screens
- Interactive Nature challenge tracker
- Six environmental activities
- Completed-task states
- Environmental points
- Live prorgress bar
- Automatic Nature progress saving
- Nature progress restored after refresh
- Reset-progress confirmation
- Working Settings application
- Three selectable wallpapers
- Light and dark application themes
- Desktop grid visibility toggle
- Automatic appearance preference saving
- Appearance preferences restored after refresh
- Reset appearance confirmation

Application windows can now be moved by dragging their title bars.

The dragging system keeps enough of each title bar visible so windows remain recoverable. It also prevents title bars from being dragged behind the taskbar.

Minimize, maximize, and restore controls are now functional.

A minimized application remains open and keeps its taskbar button. A maximized application stores its earlier position and dimensions so it can return to its previous layout.

## Applications

### Welcome

The Welcome application introduces GreenSpace WebOS and explains the current state of the project.

### Notes

The Notes application is a working text editor.

Users can:

- Enter a note title
- Write note content
- Save manually
- Use Ctrl + S
- Clear the current note
- See word and character counts
- Refresh the browser without losing the note

Notes are stored using the browser Local Storage API.

### Nature

The Nature application is an interactive environmental challenge tracker.

Users can:

- Complete six environmental activities
- Earn green points
- View completed-task progress
- Mark tasks incomplete again
- Refresh without losing progress
- Reset all challenge progress

Nature progress is stored in browser local storage.

### Settings

The Settings application controls WebOS appearance preferences.

Users can:

- Select Forest, Sunset, or Ocean wallpaper
- Switch between light and dark application themes
- Show or hide desktop grid lines
- Reset appearance preferences
- Refresh the browser without losing their choices

Settings are stored using browser local storage.

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

## Start menu

The temporary Start notification was replaced with a complete appliction launcher.

The Start menu includes:

- User and system information
- Searchable application list
- Welcome launcher
- Notes launcher
- Nature launcher
- System-status indicator
- Power-button placeholder

Desktop icons and Start-menu buttons use the same attribute:

```html
data-open-window="notes-window"
```

Because they share this attribute, one JavaScript registration function can launch applications from either location.

The Start menu closes when:

1. An application is opened
2. The user clicks outside the menu
3. The user presses Escape
4. The Start button is pressed again

## Notes storage

The Notes application saves one note in browser local storage.

The storage key is:

```javascript
const NOTES_STORAGE_KEY = "greenspace-webos-note";
```

The stored value contains:

```javascript
{
    title: "Note title",
    content: "Note content",
    savedAt: "ISO date and time"
}
```

Automatic saving uses a short delay. The note is saved 700 milliseconds after the user stops typing. This avoids writing to local storage after every individual keystroke.

The application also supports manual saving through the Save button or Ctrl + S.

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

---

### Devlog 5 - Start menu and application launcher

#### Goal

Replace the temporary Start message with a functional application launcher.

#### Improvements to Commit 4

- Removed the temporary under-construction notification
- Added a complete Start-menu interface
- Reused the existing application-launch system
- Added keyboard and outside-click closing
- Added responsive mobile behavior
- Improved accessibility state reporting

#### Work completed

- Added a working Start button
- Added a searchable application list
- Added launchers for Welcome, Notes, and Nature
- Added dynamic search-result counting
- Added a no-results message
- Added Start-button active styling
- Added `aria-expanded` updates
- Added Escape-key menu closing
- Added outside-click menu closing
- Added a Power-button placeholder

#### Technical decsions

Desktop icons and Start-menu buttons both use `data-open-window`. This allows the project to register applications launch events with one reusable function.

The Start menu stops click-event propagation so clicking inside it does not trigger the document-level outside-click handler.

The application search compares normalized lowercase text against each application’s `data-search-name` value.

#### Challenges

The main challenge was distinguishing clicks inside the Start menu from clicks elsewhere on the desktop.

The solution was to stop propagation on the Start menu and register a document-level click handler that closes it.

#### Next development Commit

Commit 6 will convert Notes from a preview into a working text editor with browser storage.

---

### Devlog 6 - Working Notes editor

#### Goal

Convert the static Notes preview into a useful WebOS application.

#### Improvements to Commit 5

- Removed hte Notes preview cards
- Added a real editor interface
- Added persistent browser storage
- Added visible save feedback
- Added keyboard support
- Improved the Notes layout for mobile screens

#### Work completed

- Added a note title field
- Added a large text editor
- Added automatic saving
- Added manual saving
- Added Ctrl + S support
- Added clear confirmation
- Added word counting
- Added saved-state feedback
- Restored saved notes after refreshing the browser
- Added Local Storage error handling

#### Technical decisions

The Notes application uses browser local storage because it does not require a server or database.

Automatic saving is delaying by 700 milliseconds after typing stops. This technique is called debouncing. It reduces unnecessary storage writes.

The saved note is converted to JSON before storage and parsed back into a JavaScript object when the application loads.

#### Challenges

The main challenge was avoiding a save operation after every keystroke.

A timeout is cleared and restarted whenever the user types. The note is saved only when the user pauses.

Another challenge was distinguishing between Ready, Unsaved, Saving and Saved states. A status element and CSS state classes provide clear feedback.

#### Next development commit

Commit 7 will improve the Nature application with interactive environmental cards or create another original WebOS application.

---

### Devlog 7 - Interactive Nature challenge tracker

#### Goal

Convert the static Nature application into an interactive
environmental activity tracker.

#### Work completed

- Added six environmental challenges
- Added complete and incomplete states
- Added a live progress bar
- Added completed-task counting
- Added environmental points
- Added automatic browser saving
- Restored saved progress after refresh
- Added reset confirmation
- Added responsive Nature layouts
- Added accessible progress and button states

#### Technical decisions

Challenge identifiers and point values are stored in HTML data
attributes.

Javascript reads these values through each element's dataset.

Completed challenge IDs are stored as a JSON array in local storage.
A Javascript Set is used while the application is running because it
provides simple add, delete, and membership operations.

Event delegation is used on the challenge list. Instead of registering
six serparate button listeners, one listener determines which challenge 
button was clicked.

#### Next Development commit

Commit 8 will add a Settings application with wallpaper and interface preferences. 

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