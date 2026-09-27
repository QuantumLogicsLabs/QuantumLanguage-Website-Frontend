# Terminal UI (Member 1)

This is my part of the terminal feature — everything under `src/components/terminal/`. It's a VS Code-style interactive terminal built with xterm.js, meant to sit inside the IDE's output panel.

## Files

Just one file for now — `QuantumTerminal.tsx`. Didn't feel the need to split it into multiple components yet, everything's still small enough to reason about in one place.

## Props

This is the shape Member 4 will consume, so I'm keeping it as-is from the task doc:

```ts
interface QuantumTerminalProps {
  files: Record<string, string>;   // open tabs -> content, used for Tab-completion
  activeFile?: string;             // shown in the prompt, e.g. "[hello.sa] $"
  onRun?: (file: string) => void;  // fired when user types `quantum <file>` or `qrun <file>`
  theme?: "dark" | "light";        // synced from the IDE's ThemeContext
}
```

If this needs to change for any reason, please talk to me first — Member 4 and probably Member 2/3 depend on it too.

### `onRun` — how it actually behaves

This is the hook Member 2/3/4 will build on, so spelling it out exactly:

- **Signature:** `(file: string) => void`
- **When it fires:** only when the user types `quantum <file>` or `qrun <file>` (as the first word of the command) and presses Enter. Anything else — `clear`, `help`, `history`, or any other typed text — does not call it.
- **What `file` actually is:** whatever the *second* whitespace-separated token in the command was, passed through as-is. So `quantum hello.sa` → `onRun("hello.sa")`. If there are extra args after that, e.g. `qrun hello.sa --debug`, only `"hello.sa"` gets passed — everything after the filename is currently ignored.
- **Not validated.** I don't check the string against `files` (the open tabs) before firing — if someone types `quantum doesnotexist.sa`, `onRun("doesnotexist.sa")` still fires. Whoever consumes it should validate/handle a filename that isn't actually open.
- **No filename → no call.** Typing just `quantum` or `qrun` with nothing after it does not fire `onRun` (there's no second token to pass).
- **Return value is ignored** — it's fire-and-forget, called synchronously right after the terminal prints its placeholder line (`(no backend wired yet) → ...`). The terminal doesn't wait for anything back from it and doesn't know if the "run" actually succeeded — that part is on whoever wires up the real execution.
- It's read through a ref internally (not the prop directly), so it's always the latest function passed in, even without remounting the terminal.

## What I built

**Terminal itself:**
- xterm.js + `@xterm/addon-fit` so it resizes properly
- Blinking cursor, colors that match dark/light theme, visible selection highlight
- Copy works normally (select text, Ctrl+C copies instead of interrupting)
- Paste works with Ctrl+V and right-click; if you paste multiple lines it runs them one after another like separate commands
- Resizes on window resize and also on panel resize (used a ResizeObserver so it'll still work once someone adds a draggable divider)
- 5000 lines of scrollback

**UX stuff:**
- Command history with ↑/↓, saved in localStorage so it survives refresh
- `clear` command and Ctrl+L
- Welcome message when it loads + a `help` command that lists shortcuts
- Small loading spinner for a moment when it mounts
- Theme follows the IDE's dark/light toggle automatically
- When the terminal is focused, there's a subtle animated glow around the box (fades in/out, doesn't shift the layout)

**Keyboard shortcuts:**

| Key | What it does |
|---|---|
| Enter | run the command |
| ↑ / ↓ | go through history |
| ← / → | move cursor (works even if the line wraps) |
| Ctrl+← / Ctrl+→ | jump by word |
| Home / End / Ctrl+A / Ctrl+E | jump to start/end |
| Delete | delete forward |
| Ctrl+Backspace | delete the word behind cursor |
| Ctrl+Z | undo last edit on the current line |
| Ctrl+C | copy if something's selected, otherwise interrupt |
| Ctrl+L | clear |
| Tab | autocomplete filenames from open tabs |
| `history` / `help` | typed commands |

Also listed in the main README and you can just type `help` in the terminal to see them.

## A few things that weren't obvious while building this

**Cursor movement across wrapped lines was the trickiest part.** Turns out the normal cursor-move escape codes just stop at the edge of whatever row you're on — they don't wrap to the row above/below on their own. So once a command gets long enough to wrap, arrow keys would just get stuck. Had to calculate the row/column myself based on `term.cols` and move the cursor with absolute positioning instead of relying on the simple left/right escapes.

**Redrawing the whole line on every keystroke looked bad** — noticeable flicker. So now it only does the full clear-and-redraw when it actually needs to (line wraps, or you're editing in the middle). If you're just typing normally at the end of a short line, it takes the cheap path and just writes the character directly.

**Ctrl+V needed a workaround.** By default xterm treats it as a control character and it blocks the browser's normal paste from happening. Had to intercept it manually and tell xterm to back off so the real paste event fires.

**Ctrl+W doesn't work in a browser, and there's nothing I can do about it** — that's the usual terminal shortcut for deleting a word, but Chrome (and every other browser) reserves it to close the tab, and web pages just can't get that key combo no matter what. Used Ctrl+Backspace instead.

**Undo** just keeps a small stack of `{text, cursor}` snapshots before every edit, and Ctrl+Z pops the last one. Gets cleared once you actually submit a command — it's only for undoing edits to what you're currently typing.

**Tab completion** checks the word right before your cursor against whatever files are open in the IDE tabs.

**One bug I almost shipped:** the terminal only remounts when the theme changes, so if I read `files`/`activeFile`/`onRun` directly from props inside the event handlers, they'd go stale — the handlers would keep using whatever those values were when the terminal first mounted. Fixed it by keeping them in refs that update separately.

## What's not done here (on purpose)

- Nothing actually executes yet — commands just print `(no backend wired yet) → ...`. That's Member 2 and Member 3's part.
- No special handling for mobile/touch — wasn't in the task brief.
- Run/Stop/Restart buttons aren't here, that's Member 4's IDE integration.

## Testing

Did all of this manually in the browser since there's no test setup for this yet:
- every shortcut above
- long output (spammed `help`/`history` to fill scrollback and check auto-scroll)
- resizing the window and zooming
- editing a wrapped multi-line command (cursor movement, mid-line edits, undo)
- copy/paste, including multi-line paste

Also ran `tsc --noEmit` and `vite build` — both pass clean.
