import React from 'react';

// Makes a floating, position: fixed element draggable and remembers where it
// was dropped (per browser, in localStorage).
//
// The spot is stored as { rx, ry }: how far across the free space the element
// sits, measured from the right/bottom edges. Anchoring on right/bottom means a
// wrapper whose handle is its bottom-right corner (the chat launcher, with the
// panel opening above it) moves as a unit. Ratios keep the relative spot after
// a resize or on another screen size.
//
// A press that moves less than DRAG_THRESHOLD_PX is a click; anything further
// is a drag, and the click that follows it is swallowed (see consumeClick).
const DRAG_THRESHOLD_PX = 5;
const EDGE_GAP_PX = 8;

type Ratio = { rx: number; ry: number };
type Offset = { right: number; bottom: number };

const readSaved = (key: string): Ratio | null => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) || 'null');
    if (saved && Number.isFinite(saved.rx) && Number.isFinite(saved.ry)) return saved;
  } catch {
    // Storage blocked or garbage — fall back to the default spot.
  }
  return null;
};

const writeSaved = (key: string, value: Ratio) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked — the position still holds for this visit.
  }
};

const viewportSize = () => ({
  w: document.documentElement.clientWidth,
  h: document.documentElement.clientHeight,
});

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

export function useDraggablePosition<T extends HTMLElement>(storageKey: string) {
  const handleRef = React.useRef<T>(null);
  const [viewport, setViewport] = React.useState(viewportSize);
  const [saved, setSaved] = React.useState<Ratio | null>(() => readSaved(storageKey));
  const [dragOffset, setDragOffset] = React.useState<Offset | null>(null);
  const dragRef = React.useRef<{ id: number; x: number; y: number; rect: DOMRect; moved: boolean } | null>(null);
  const swallowClickRef = React.useRef(false);

  React.useEffect(() => {
    const onResize = () => setViewport(viewportSize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const w = handleRef.current?.offsetWidth || 56;
  const h = handleRef.current?.offsetHeight || 56;
  const maxRight = viewport.w - w - EDGE_GAP_PX;
  const maxBottom = viewport.h - h - EDGE_GAP_PX;

  const clampOffset = (right: number, bottom: number): Offset => ({
    right: clamp(right, EDGE_GAP_PX, maxRight),
    bottom: clamp(bottom, EDGE_GAP_PX, maxBottom),
  });

  const toRatio = ({ right, bottom }: Offset): Ratio => ({
    rx: maxRight > EDGE_GAP_PX ? (right - EDGE_GAP_PX) / (maxRight - EDGE_GAP_PX) : 0,
    ry: maxBottom > EDGE_GAP_PX ? (bottom - EDGE_GAP_PX) / (maxBottom - EDGE_GAP_PX) : 0,
  });

  const fromRatio = ({ rx, ry }: Ratio): Offset => ({
    right: EDGE_GAP_PX + clamp(rx, 0, 1) * (maxRight - EDGE_GAP_PX),
    bottom: EDGE_GAP_PX + clamp(ry, 0, 1) * (maxBottom - EDGE_GAP_PX),
  });

  const offsetFor = (e: React.PointerEvent, drag: NonNullable<typeof dragRef.current>) =>
    clampOffset(
      viewport.w - (drag.rect.right + e.clientX - drag.x),
      viewport.h - (drag.rect.bottom + e.clientY - drag.y),
    );

  const onPointerDown = (e: React.PointerEvent<T>) => {
    if (e.button !== 0) return;
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, rect: e.currentTarget.getBoundingClientRect(), moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<T>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < DRAG_THRESHOLD_PX) return;
    drag.moved = true;
    setDragOffset(offsetFor(e, drag));
  };

  const endDrag = (e: React.PointerEvent<T>, commit: boolean) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    dragRef.current = null;
    if (!drag.moved) return;
    if (commit) {
      const next = toRatio(offsetFor(e, drag));
      setSaved(next);
      writeSaved(storageKey, next);
      // The click fires right after pointerup — swallow that one only.
      swallowClickRef.current = true;
      setTimeout(() => {
        swallowClickRef.current = false;
      }, 0);
    }
    setDragOffset(null);
  };

  const placed = dragOffset || (saved ? fromRatio(saved) : null);

  return {
    handleRef,
    dragging: dragOffset !== null,
    /** Apply to the fixed element; undefined keeps its default (class-based) spot. */
    positionStyle: placed ? ({ right: placed.right, bottom: placed.bottom } as React.CSSProperties) : undefined,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (e: React.PointerEvent<T>) => endDrag(e, true),
      onPointerCancel: (e: React.PointerEvent<T>) => endDrag(e, false),
      style: { touchAction: 'none' } as React.CSSProperties,
    },
    /** True (once) if this click is the tail end of a drag and should be ignored. */
    consumeClick: () => swallowClickRef.current,
  };
}
