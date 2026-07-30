# GreenSpace WebOS

GreenSpace WebOS is a browser-based desktop environment created for the Hack Club WebOS 1 mission.

The project was built in twelve focused development sessions. Each session introduced a working feature, refined earlier code, and moved the project toward a complete browser-based operating-system experience.

## Current status

**GreenSpace WebOS version 1.0 is complete.**

The planned 12-commit development cycle is finished.

## Project overview

GreenSpace WebOS recreates a small desktop operating system inside a web browser.

It includes:

- Five desktop applications
- Draggable application windows
- Minimize, maximize, restore, and close controls
- Dynamic taskbar application buttons
- A searchable Start menu
- Persistent browser storage
- Wallpaper and theme customization
- Desktop-wide keyboard shortcuts
- Responsive desktop and mobile layouts
- Accessibility improvements
- Built-in system diagnostics

## Applications

GreenSpace WebOS includes five applications:

1. Welcome
2. Notes
3. Nature
4. Settings
5. Calculator

## Current features

### Desktop

- Custom environmental desktop background
- Five desktop application icons
- Live clock and date
- Internet and sound indicators
- Version 1.0 build label
- Optional desktop alignment grid
- Responsive desktop layout
- Desktop layout restored after refresh

### Window management

- Reusable application-window behavior
- Working open and close controls
- Window focus and stacking
- Automatic `z-index` management
- Draggable application windows
- Mouse, touch, and pen support
- Safe window-position boundaries
- Browser-resize position correction
- Window minimization
- Taskbar restoration
- Maximize and restore behavior
- Double-click title-bar maximization
- Saved normal window positions and sizes
- Active taskbar-button minimization
- Persistent open and closed states
- Persistent minimized and maximized states
- Persistent active-window state
- Persistent window stacking order
- Reset Windows control

### Start menu

- Working Start button
- Searchable application list
- Welcome launcher
- Notes launcher
- Nature launcher
- Settings launcher
- Calculator launcher
- Dynamic application count
- No-results feedback
- Outside-click menu closing
- Escape-key menu closing
- Accessible Start-button state
- Responsive Start-menu layout
- Power-button placeholder

### Notes

- Working text editor
- Note title field
- Large content editor
- Automatic browser saving
- Manual Save button
- `Ctrl + S` keyboard shortcut
- Clear-note confirmation
- Word count
- Character count
- Saved-status indicator
- Notes restored after refresh
- Local Storage error handling

### Nature

- Interactive environmental challenge tracker
- Six environmental activities
- Complete and incomplete states
- Environmental points
- Live progress bar
- Completed-task counter
- Automatic progress saving
- Progress restored after refresh
- Reset-progress confirmation
- Accessible progress states
- Responsive challenge layout

### Settings

- Three selectable wallpapers
- Forest wallpaper
- Sunset wallpaper
- Ocean wallpaper
- Light application theme
- Dark application theme
- Desktop grid visibility control
- Automatic appearance preference saving
- Appearance preferences restored after refresh
- Reset Appearance control
- Reset Windows control

### Calculator

- Addition
- Subtraction
- Multiplication
- Division
- Decimal-number support
- Negative-number support
- Percentage conversion
- Mouse controls
- Keyboard controls
- Delete-last-character control
- Clear control
- Divide-by-zero error handling
- Calculation history
- Previous-result selection
- Persistent calculator history
- Clear-history confirmation

### Keyboard and accessibility

- Global application keyboard shortcuts
- `Alt + F4` active-window closing
- `Alt + M` active-window minimization
- `Alt + X` maximize and restore shortcut
- `Ctrl + Alt + R` desktop-layout reset
- Keyboard-focusable window title bars
- Enter and Space title-bar controls
- Screen-reader application announcements
- Dynamic taskbar ARIA labels
- Taskbar `aria-pressed` states
- Visible focus indicators
- Editable-field shortcut protection
- Accessible radio and switch states
- Reduced-motion support

### Diagnostics

- Built-in project diagnostics
- Required-element verification
- Application-window verification
- Desktop and Start-menu launcher verification
- Duplicate HTML ID detection
- Keyboard-accessibility verification
- Window-metadata verification
- Browser-storage verification
- Nature challenge-count verification
- Visible system-status reporting
- Console startup-integrity reporting

## Keyboard shortcuts

GreenSpace WebOS supports desktop-wide keyboard controls.

| Shortcut | Action |
|---|---|
| `Ctrl + Alt + W` | Open Welcome |
| `Ctrl + Alt + N` | Open Notes |
| `Ctrl + Alt + E` | Open Nature |
| `Ctrl + Alt + S` | Open Settings |
| `Ctrl + Alt + C` | Open Calculator |
| `Ctrl + Alt + R` | Reset window layout |
| `Alt + M` | Minimize the active window |
| `Alt + X` | Maximize or restore the active window |
| `Alt + F4` | Close the active WebOS window |
| `Enter` or `Space` | Maximize or restore a focused title bar |
| `Ctrl + S` | Save Notes |
| `Enter` | Calculate when Calculator is open |
| `C` | Clear Calculator |
| `Backspace` | Delete the last Calculator character |
| `Escape` | Close the Start menu |

## Application details

### Welcome

The Welcome application introduces GreenSpace WebOS and explains the current project features.

It includes:

- Project introduction
- Keyboard shortcut reference
- System-status card
- Run Diagnostics button
- Diagnostic-results panel

### Notes

The Notes application is a browser-based text editor.

Users can:

- Enter a note title
- Write note content
- Save manually
- Use `Ctrl + S`
- Clear the current note
- View word and character counts
- Refresh without losing the note

Notes are stored using the browser Local Storage API.

### Nature

The Nature application is an environmental challenge tracker.

Users can:

- Complete six environmental activities
- Earn green points
- View completed-task progress
- Mark completed tasks incomplete
- Refresh without losing progress
- Reset all challenge progress

The maximum available score is 120 points.

Nature progress is stored in browser local storage.

### Settings

The Settings application controls WebOS appearance preferences.

Users can:

- Select Forest, Sunset, or Ocean wallpaper
- Switch between light and dark application themes
- Show or hide desktop grid lines
- Reset appearance preferences
- Reset window positions and states
- Refresh without losing appearance choices

Settings are stored using browser local storage.

### Calculator

The Calculator supports standard arithmetic calculations.

Users can:

- Add, subtract, multiply, and divide
- Enter decimal and negative numbers
- Convert a number into a percentage
- Use the mouse or keyboard
- Delete the last entered character
- Review recent calculations
- Select a previous result
- Clear calculation history
- Refresh without losing history

Calculator history is stored using browser local storage.

## Window behavior

Each application window has an HTML ID and application metadata:

```html
<section
    id="notes-window"
    data-window
    data-app-title="Notes"
    data-app-icon="📝"
    data-minimized="false"
    data-maximized="false"
>
```

JavaScript uses this metadata to create the correct taskbar button and accessible labels.

The window system supports:

1. Opening a hidden window
2. Focusing an already-open window
3. Moving the selected window above other windows
4. Marking the selected window as active
5. Creating its taskbar button
6. Removing its taskbar button when closed
7. Focusing the highest remaining window after a close
8. Saving its position and dimensions
9. Restoring its previous state after a refresh

## Window dragging

Each application title bar contains a `data-drag-handle` attribute:

```html
<header
    class="window-header"
    data-drag-handle
    tabindex="0"
>
```

JavaScript applies dragging behavior through:

```javascript
makeWindowDraggable(windowElement);
```

The project uses Pointer Events rather than separate mouse and touch handlers.

This provides one event model for:

- Mouse input
- Touchscreen input
- Pen input

During dragging, JavaScript records:

1. The pointer's starting coordinates
2. The window's starting position
3. The pointer's current movement
4. The proposed new window position
5. A corrected position inside safe desktop boundaries

Pointer capture allows dragging to continue when the pointer temporarily leaves the title bar.

## Window states

Each application can be:

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

Taskbar buttons have three primary behaviors:

1. Clicking a minimized application restores it.
2. Clicking an active application minimizes it.
3. Clicking an inactive visible application brings it to the front.

## Desktop-state persistence

GreenSpace WebOS saves the complete desktop layout.

The saved desktop state includes:

- Window position
- Window width and height
- Open or closed state
- Minimized state
- Maximized state
- Active window
- Window stacking order

The storage key is:

```javascript
const DESKTOP_STATE_STORAGE_KEY =
    "greenspace-webos-desktop-state";
```

Window state is saved after:

- Opening a window
- Closing a window
- Moving a window
- Minimizing a window
- Maximizing a window
- Restoring a window
- Focusing a window
- Resizing the browser

A short delayed save avoids unnecessary Local Storage writes during frequent window changes.

The Settings application includes a **Reset windows** button that removes the saved desktop layout and reloads the default window arrangement.

## Start menu

The Start menu is a complete application launcher.

It includes:

- User and system information
- Searchable application list
- Welcome launcher
- Notes launcher
- Nature launcher
- Settings launcher
- Calculator launcher
- Dynamic application count
- System-status indicator
- Power-button placeholder

Desktop icons and Start-menu buttons use the same attribute:

```html
data-open-window="notes-window"
```

One JavaScript registration function can therefore launch applications from either location.

The Start menu closes when:

1. An application is opened
2. The user clicks outside the menu
3. The user presses Escape
4. The Start button is selected again

## Notes storage

The Notes application saves one note in browser local storage.

The storage key is:

```javascript
const NOTES_STORAGE_KEY =
    "greenspace-webos-note";
```

The stored object contains:

```javascript
{
    title: "Note title",
    content: "Note content",
    savedAt: "ISO date and time"
}
```

Automatic saving begins 700 milliseconds after the user stops typing.

This debouncing technique prevents a storage write after every keystroke.

The application also supports manual saving through:

- The Save button
- `Ctrl + S`

## Nature storage

Completed Nature challenge IDs are stored as a JSON array.

The storage key is:

```javascript
const NATURE_STORAGE_KEY =
    "greenspace-webos-nature-progress";
```

A JavaScript `Set` stores completed IDs while the application is running.

This provides simple:

- Add operations
- Delete operations
- Membership checks

## Settings storage

Appearance preferences are stored under:

```javascript
const SETTINGS_STORAGE_KEY =
    "greenspace-webos-settings";
```

The saved object contains:

```javascript
{
    wallpaper: "forest",
    theme: "light",
    showGrid: true
}
```

Invalid saved values are replaced with safe defaults.

## Calculator storage

Calculator history is stored under:

```javascript
const CALCULATOR_HISTORY_STORAGE_KEY =
    "greenspace-webos-calculator-history";
```

History is limited to the ten most recent completed calculations.

## System diagnostics

The Welcome application includes a **Run diagnostics** button.

The diagnostics system verifies:

- Required HTML elements
- All five application windows
- Desktop and Start-menu launchers
- Unique HTML IDs
- Keyboard-focusable window title bars
- Application titles and icons
- Browser Local Storage availability
- Start-menu application count
- Six Nature challenges

Each diagnostic displays:

- Check name
- Passed or failed status
- Explanatory details

Startup integrity is also reported in the browser Console.

A successful startup displays:

```text
GreenSpace WebOS startup checks passed.
```

The visible diagnostics panel should display:

```text
9 of 9 passed
```

## Browser-storage keys

```javascript
const NOTES_STORAGE_KEY =
    "greenspace-webos-note";

const NATURE_STORAGE_KEY =
    "greenspace-webos-nature-progress";

const SETTINGS_STORAGE_KEY =
    "greenspace-webos-settings";

const CALCULATOR_HISTORY_STORAGE_KEY =
    "greenspace-webos-calculator-history";

const DESKTOP_STATE_STORAGE_KEY =
    "greenspace-webos-desktop-state";
```

## Technologies used

- HTML5
- CSS3
- Vanilla JavaScript
- DOM API
- JavaScript Date API
- Browser Local Storage
- JSON
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
- JavaScript `Set`
- Window-state management
- CSS state classes
- Dynamic ARIA-label updates
- ARIA live regions
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

### Option 1 — Open directly

Open `index.html` in a modern browser.

### Option 2 — Use VS Code Live Server

1. Open the project folder in Visual Studio Code.
2. Install the Live Server extension.
3. Right-click `index.html`.
4. Select **Open with Live Server**.
5. Press `Ctrl + Shift + R` after replacing project files.

## Development logs

### Devlog 1 — Desktop foundation

#### Goal

Create the visual foundation for GreenSpace WebOS.

#### Work completed

- Created the initial project structure
- Created a custom environmental desktop theme
- Added three initial desktop icons
- Created the Welcome application
- Added a taskbar and Start button
- Added internet and sound indicators
- Added a live clock and date
- Added responsive behavior
- Added initial placeholder feedback

#### Technical decisions

The desktop uses CSS gradients rather than an external wallpaper image. This keeps the project lightweight and independent of external image services.

CSS custom properties store shared colors and dimensions.

The clock logic is isolated inside `updateClock()` and updates every second.

---

### Devlog 2 — Reusable application windows

#### Goal

Convert the static desktop into a multi-application interface.

#### Work completed

- Added Notes and Nature windows
- Added reusable window-opening behavior
- Added reusable window-closing behavior
- Added active-window tracking
- Added automatic `z-index` management
- Added dynamic taskbar buttons
- Added taskbar highlighting
- Added focus selection after closing a window
- Improved responsive behavior

#### Technical decisions

Window behavior is handled by reusable functions:

```javascript
openWindow();
closeWindow();
focusWindow();
createTaskbarButton();
removeTaskbarButton();
```

Each window stores its title and icon in HTML data attributes.

---

### Devlog 3 — Draggable application windows

#### Goal

Make all application windows draggable while keeping them reachable.

#### Work completed

- Added reusable pointer-based dragging
- Added mouse, touch, and pen support
- Added pointer capture
- Added safe horizontal and vertical boundaries
- Added focus when dragging begins
- Added dragging visual feedback
- Added browser-resize correction
- Prevented title bars from moving behind the taskbar

#### Technical decisions

Pointer Events provide one interaction model for mouse, touch, and pen devices.

The drag system records starting pointer and window coordinates and calculates movement from their difference.

---

### Devlog 4 — Minimize, maximize, and restore

#### Goal

Complete the primary window controls.

#### Work completed

- Added working minimize buttons
- Added taskbar restoration
- Added maximize controls
- Added restoration to previous position and size
- Added double-click title-bar maximization
- Added dynamic maximize-button labels
- Added active taskbar-button minimization
- Added minimized taskbar styling
- Reset window state when closing
- Added reduced-motion support

#### Technical decisions

A minimized window remains open and keeps its taskbar button.

A closed window removes its taskbar button and clears its temporary maximized state.

---

### Devlog 5 — Start menu and application launcher

#### Goal

Replace the temporary Start message with a functional launcher.

#### Work completed

- Added a working Start button
- Added a searchable application list
- Added application launchers
- Added search-result counting
- Added a no-results message
- Added Start-button active styling
- Added `aria-expanded` updates
- Added Escape-key closing
- Added outside-click closing
- Added a Power-button placeholder
- Added responsive Start-menu behavior

#### Technical decisions

Desktop icons and Start-menu buttons both use `data-open-window`.

The Start menu stops click propagation so internal clicks do not trigger the outside-click handler.

---

### Devlog 6 — Working Notes editor

#### Goal

Convert Notes into a useful text editor.

#### Work completed

- Added a note title field
- Added a large editor
- Added automatic saving
- Added manual saving
- Added `Ctrl + S`
- Added clear confirmation
- Added word counting
- Added character counting
- Added saved-state feedback
- Restored notes after refresh
- Added Local Storage error handling

#### Technical decisions

Automatic saving uses a 700-millisecond debounce period.

The note is converted to JSON before storage and parsed when restored.

---

### Devlog 7 — Interactive Nature tracker

#### Goal

Convert Nature into an interactive environmental activity tracker.

#### Work completed

- Added six environmental challenges
- Added complete and incomplete states
- Added a live progress bar
- Added completed-task counting
- Added environmental points
- Added automatic browser saving
- Restored progress after refresh
- Added reset confirmation
- Added responsive Nature layouts
- Added accessible progress states

#### Technical decisions

Challenge IDs and point values are stored in HTML data attributes.

A JavaScript `Set` stores completed challenge IDs while the project is running.

Event delegation uses one listener for all challenge buttons.

---

### Devlog 8 — Appearance Settings

#### Goal

Add desktop and application appearance customization.

#### Work completed

- Added the Settings application
- Added Forest wallpaper
- Added Sunset wallpaper
- Added Ocean wallpaper
- Added light theme
- Added dark theme
- Added desktop-grid control
- Added automatic preference saving
- Restored preferences after refresh
- Added Reset Appearance
- Added responsive Settings layout

#### Technical decisions

Appearance settings are stored in one object:

```javascript
{
    wallpaper: "forest",
    theme: "light",
    showGrid: true
}
```

CSS custom properties allow the theme to update without rebuilding application markup.

---

### Devlog 9 — Calculator

#### Goal

Add a complete original Calculator application.

#### Work completed

- Added Calculator desktop and Start-menu launchers
- Added arithmetic operations
- Added decimal input
- Added negative-number input
- Added percentages
- Added delete and clear controls
- Added mouse and keyboard support
- Added error handling
- Added calculation history
- Added persistent history
- Added clear-history confirmation
- Added responsive Calculator layout

#### Technical decisions

The Calculator tracks:

- Current input
- Stored first value
- Pending operator
- Operand-waiting state
- Calculation history

History is limited to ten entries.

---

### Devlog 10 — Persistent desktop layout

#### Goal

Make GreenSpace WebOS remember the complete window layout.

#### Work completed

- Saved window positions
- Saved window dimensions
- Saved open and closed states
- Saved minimized states
- Saved maximized states
- Saved the active window
- Saved window stacking order
- Rebuilt taskbar buttons after refresh
- Added delayed saving after dragging
- Added Reset Windows
- Added invalid-storage recovery

#### Technical decisions

Each application is matched to its saved state through its HTML ID.

The complete desktop layout is serialized as JSON and stored in Local Storage.

A delayed save prevents unnecessary writes while windows are moving.

---

### Devlog 11 — Keyboard shortcuts and accessibility

#### Goal

Improve keyboard navigation, screen-reader communication, and usability.

#### Work completed

- Added global application shortcuts
- Added active-window keyboard controls
- Added keyboard-focusable title bars
- Added screen-reader status announcements
- Added dynamic taskbar labels
- Added taskbar pressed states
- Added visible focus indicators
- Protected shortcuts while users type
- Removed the Calculator Escape-key conflict
- Added a dynamic Start-menu count
- Added keyboard documentation to Welcome

#### Technical decisions

Keyboard shortcuts use one global `keydown` listener.

Shortcut handling checks whether the user is typing in an input, textarea, select, or editable element.

The screen-reader announcer uses an ARIA live region.

Application shortcuts are stored in an object mapping keys to window IDs.

---

### Devlog 12 — Final diagnostics and release preparation

#### Goal

Complete the project with built-in verification, final documentation, responsive testing, and deployment preparation.

#### Work completed

- Added built-in system diagnostics
- Added required-element validation
- Added application and launcher validation
- Added duplicate-ID detection
- Added accessibility validation
- Added window-metadata validation
- Added browser-storage validation
- Added Nature challenge validation
- Added system-status reporting
- Added startup-integrity logging
- Added a version 1.0 taskbar label
- Added final page metadata
- Added an embedded favicon
- Completed final documentation
- Prepared the project for deployment

#### Technical decisions

Diagnostics use small functions that return consistent result objects.

Each result includes:

- Name
- Pass status
- Explanatory details

Diagnostic output is constructed with DOM methods and `textContent`.

Startup checks report failures in the browser Console without interrupting the interface.

The visible diagnostics panel opens only when the user selects **Run diagnostics**.

#### Project status

GreenSpace WebOS version 1.0 is complete.

The project includes five applications, persistent browser data, desktop window management, appearance customization, keyboard shortcuts, accessibility features, responsive layouts, and built-in diagnostics.

## Testing

### Basic startup

1. Open the project with Live Server.
2. Press `Ctrl + Shift + R`.
3. Open browser developer tools.
4. Select Console.
5. Confirm there are no red errors.

Expected startup message:

```text
GreenSpace WebOS startup checks passed.
```

### Diagnostics

1. Open Welcome.
2. Select **Run diagnostics**.
3. Confirm all checks pass.

Expected:

```text
9 of 9 passed
```

### Window testing

Verify:

- All applications open
- Windows drag correctly
- Minimize works
- Taskbar restoration works
- Maximize and restore work
- Double-click title-bar behavior works
- Close and reopen work
- Window positions remain reachable

### Persistence testing

Verify after refreshing:

- Notes content remains
- Nature progress remains
- Appearance settings remain
- Calculator history remains
- Window positions remain
- Minimized states remain
- Maximized states remain
- Closed windows remain closed

### Keyboard testing

Verify:

- `Ctrl + Alt + W` opens Welcome
- `Ctrl + Alt + N` opens Notes
- `Ctrl + Alt + E` opens Nature
- `Ctrl + Alt + S` opens Settings
- `Ctrl + Alt + C` opens Calculator
- `Alt + M` minimizes
- `Alt + X` maximizes and restores
- `Alt + F4` closes the active WebOS window
- `Ctrl + Alt + R` displays Reset Windows confirmation
- Enter and Space control a focused title bar
- Typing inside Notes does not activate window shortcuts

### Responsive testing

Test at:

- 1440 pixels
- 1024 pixels
- 850 pixels
- 760 pixels
- 375 pixels

Verify:

- Desktop icons remain visible
- Windows remain usable
- Taskbar remains accessible
- Start menu fits the viewport
- Notes controls remain usable
- Nature cards do not overflow
- Settings controls stack correctly
- Calculator changes to a single-column layout
- Diagnostics remain readable

## Final release checklist

| Test | Status |
|---|---|
| Page loads without Console errors | ☐ |
| Five desktop launchers work | ☐ |
| Five Start-menu launchers work | ☐ |
| Window dragging works | ☐ |
| Minimize and taskbar restore work | ☐ |
| Maximize and restore work | ☐ |
| Close and reopen work | ☐ |
| Notes persistence works | ☐ |
| Nature persistence works | ☐ |
| Settings persistence works | ☐ |
| Calculator and history work | ☐ |
| Window-layout persistence works | ☐ |
| Keyboard shortcuts work | ☐ |
| Responsive layouts work | ☐ |
| All system diagnostics pass | ☐ |
| GitHub Pages deployment works | ☐ |

Replace `☐` with `☑` after each test passes.

## Git workflow

Check the working tree:

```bash
git status
```

Stage the final files:

```bash
git add index.html style.css script.js README.md
```

Commit the final release:

```bash
git commit -m "release: complete GreenSpace WebOS version 1.0"
```

Review recent commits:

```bash
git log --oneline -5
```

Push the project:

```bash
git push origin main
```

Use the repository’s actual branch name when it is not `main`.

## GitHub Pages deployment

The repository root should contain:

```text
index.html
style.css
script.js
README.md
```

Deployment steps:

1. Open the GitHub repository.
2. Open repository Settings.
3. Select Pages.
4. Choose deployment from a branch.
5. Select the branch containing the project.
6. Select the repository root directory.
7. Save the configuration.
8. Wait for deployment to complete.
9. Open the published site.
10. Perform a hard refresh.
11. Run the built-in diagnostics.

The deployed site should not depend on local file paths or VS Code Live Server.

## Published-site testing

Verify on the deployed site:

- Wallpaper appears
- CSS loads
- Clock runs
- Start menu works
- All five applications open
- Local Storage works
- Refresh restores saved data
- Refresh restores window state
- Keyboard shortcuts work
- Diagnostics show `9 of 9 passed`
- No Console errors appear

Test in:

- Desktop Chrome
- A narrow mobile browser view

## Suggested screenshots

### Screenshot 1 — Main desktop

Include:

- Wallpaper
- Desktop icons
- Welcome window
- Taskbar

### Screenshot 2 — Applications

Include:

- Notes or Nature
- Calculator
- Multiple taskbar buttons

### Screenshot 3 — Customization and diagnostics

Include:

- Dark theme or alternate wallpaper
- Diagnostics showing all checks passed

## Project description

GreenSpace WebOS is a browser-based desktop environment built with HTML, CSS, and vanilla JavaScript. It includes draggable, minimizable, maximizable, and persistent application windows; a searchable Start menu; Notes, Nature, Settings, and Calculator applications; theme and wallpaper customization; keyboard shortcuts; responsive layouts; accessibility improvements; browser-storage persistence; and built-in system diagnostics.

## Final release

**Version:** 1.0  
**Development sessions:** 12  
**Applications:** 5  
**Primary technologies:** HTML, CSS, and vanilla JavaScript  
**Project status:** Complete