# Bug Report — QuantumLogics IDE UI Scrolling Issues

**Project:** QuantumLogics Compiler — Website Frontend  
**Module:** Quantum Interactive IDE  
**Reported By:** Internship Team  
**Date:** 2026-07-17  
**Status:** ✅ Resolved  
**Severity:** High — Directly impacts developer workflow and code editing experience

---

## 1. Executive Summary

Three interconnected UI bugs were identified and resolved in the QuantumLogics Interactive IDE. These bugs caused the code editor's syntax highlighting to become misaligned with the actual text during scrolling, the line numbers to drift out of sync, text selection to behave incorrectly, and trackpad-based scrolling to inadvertently scroll the entire webpage instead of the terminal output. All issues have been diagnosed to their root causes and fixed with targeted, minimal code changes.

---

## 2. Issues Identified

### Issue 1 — Code Text Appeared Frozen While Scrolling (Critical)

**Symptom:**  
When a user scrolled through code in the editor (via trackpad, mouse wheel, or keyboard), the line numbers on the left and the scrollbar moved correctly, but the coloured, syntax-highlighted code text appeared visually frozen and did not move.

**Root Cause:**  
The IDE editor uses three layered elements stacked on top of each other:
- A **line number gutter** on the left
- An **invisible `<textarea>`** where the user actually types (the text is transparent so only the cursor is visible)
- A **syntax-highlighted overlay** (`<SyntaxHighlighter>`) that renders the same code with colours and is what the user visually reads

When the user scrolls, all three layers must scroll together in sync. The scroll synchronisation code was responsible for reading the textarea's scroll position and applying it to the other two layers. However, the inner `<pre>` element rendered by `SyntaxHighlighter` has the CSS property `overflow-y: hidden` set on it. In HTML and CSS, setting `element.scrollTop` on an `overflow: hidden` element via JavaScript has **zero visual effect** — the element refuses to scroll.

The synchronisation code was incorrectly targeting this inner `<pre>` element for vertical scroll. As a result, the syntax highlight layer never moved, even though the scrollbar and line numbers were updating correctly.

**Impact:**  
Users could not read their code while scrolling. The text appeared locked while everything around it moved, creating a completely broken editing experience.

---

### Issue 2 — Text Selection and Copy Was Offset (High)

**Symptom:**  
When selecting code with a mouse click or drag, the selection appeared to highlight lines that were above the actual pointer position. Copying would then copy incorrect lines of code.

**Root Cause:**  
This was a direct consequence of Issue 1. Because the syntax-highlighted overlay (which represents what the user sees) was scrolled to a different position than the transparent textarea (which handles all user input), there was a permanent visual offset between what the user saw and where their cursor actually was. The user would click on what appeared to be line 20, but the textarea received the click at line 15 (the actual unscrolled position), causing selection and copy to operate on the wrong lines.

**Impact:**  
Developers could not reliably select, copy, or paste code, directly breaking productivity.

---

### Issue 3 — Trackpad Scroll Scrolled the Page Instead of the Terminal (High)

**Symptom:**  
When using a two-finger trackpad gesture over the Output Terminal panel at the bottom of the IDE, the entire webpage scrolled up and down instead of scrolling through the terminal's output history.

**Root Cause:**  
The terminal is powered by `@xterm/xterm`, which renders onto an HTML `<canvas>` element. A canvas is not a native scrollable DOM element — xterm manages its own internal scroll state in JavaScript. When the browser receives a scroll (wheel) event on the canvas, it finds no scrollable ancestor immediately available and **bubbles the event upward** until it reaches the page's `<html>` element, causing the entire page to scroll.

Additionally, no CSS `touch-action` or `overscroll-behavior` properties were set on the terminal container, so the browser had no boundary to prevent this scroll chaining behaviour.

**Impact:**  
Users could not scroll through terminal output at all using a trackpad, which is the primary input device for many developers.

---

## 3. Files Modified

| File | Lines Changed | Purpose |
|---|---|---|
| `src/components/QuantumIDE.tsx` | ~30 lines across 3 functions | Fixed all scroll synchronisation logic |
| `src/components/terminal/QuantumTerminal.tsx` | ~25 lines | Added trackpad wheel interception for terminal |

---

## 4. Fixes Applied

### Fix 1 — Corrected Scroll Sync Target (Issues 1 & 2)

The scroll synchronisation logic was corrected in all three places where it runs:
- `handleScroll` — fires when the user scrolls the textarea
- `useLayoutEffect` — fires after every keystroke to reposition after a value update
- `handleSelectionChange` — fires after every mouse click or keyboard navigation

In all three, the fix changes the vertical scroll target from the inner `<pre>` element (which ignores `scrollTop`) to the **wrapper `<div>`** (`preRef.current`). An `overflow: hidden` wrapper element can be scrolled programmatically via JavaScript, correctly clipping and shifting its child content into view.

Horizontal scroll continues to target the inner `<pre>` element, which correctly has `overflow-x: auto` and does respond to `scrollLeft` changes.

```
Before:  pre.scrollTop = scrollTop            ← no visual effect (pre has overflow-y:hidden)
After:   preRef.current.scrollTop = scrollTop ← correctly shifts the overlay vertically
```

### Fix 2 — Terminal Trackpad Scroll Interception (Issue 3)

Three defensive measures were applied to the terminal container:

1. **`wheel` Event Listener** (with `passive: false`): A JavaScript event listener was attached directly to the terminal container. When a trackpad gesture fires a scroll event, this listener intercepts it, prevents it from reaching the page (`preventDefault()`, `stopPropagation()`), and manually drives the xterm buffer using `term.scrollLines()`, translating the raw pixel delta into a natural line count.

2. **CSS `touch-action: none`**: Added to the terminal container. This instructs the browser at the CSS level not to apply its native touch/pointer scroll handling on this element.

3. **CSS `overscroll-behavior: contain`**: Added to both the terminal container and the terminal wrapper in the IDE. This creates an explicit scroll boundary — any scroll energy that reaches this element is absorbed and not forwarded to a parent.

---

## 5. Testing Checklist

| Test Case | Expected Result | Status |
|---|---|---|
| Trackpad two-finger scroll over code editor | Code text, line numbers, and highlight overlay scroll in sync | ✅ Fixed |
| Trackpad two-finger scroll over terminal | Terminal buffer scrolls; page remains static | ✅ Fixed |
| Click to place cursor in code | Cursor lands exactly where clicked, no offset | ✅ Fixed |
| Click and drag to select code | Selection covers exactly the lines under the pointer | ✅ Fixed |
| Ctrl+C to copy selected code | Correct lines are copied | ✅ Fixed |
| Arrow key navigation in editor | Overlay and gutter stay in sync after key movement | ✅ Fixed |
| Typing new lines (Enter key) | Editor scrolls to new line; all layers in sync | ✅ Fixed |
| Mouse wheel scroll (regression) | Scroll behaviour unchanged and correct | ✅ Verified |

---

## 6. Conclusion

All three issues shared a common theme: the scroll state of the visible layers (syntax highlight overlay, line number gutter, terminal buffer) was not being correctly driven from the authoritative source (the textarea scroll position). The fixes are minimal, targeted, and do not affect any other functionality of the IDE. The editor and terminal now behave consistently and professionally across both mouse and trackpad input methods.

---

*Report prepared during internship at QuantumLogics — Frontend IDE module.*
