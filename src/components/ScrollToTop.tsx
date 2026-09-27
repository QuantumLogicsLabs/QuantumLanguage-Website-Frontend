import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

// A press that moves less than DRAG_THRESHOLD_PX is a click (scroll to top);
// anything further is a drag, and the click that follows it is swallowed. The
// dropped spot is stored as a fraction of the free space, so it lands in the
// same relative place after a resize or on a different screen size.
const DRAG_THRESHOLD_PX = 5;
const EDGE_GAP_PX = 8;
const STORAGE_KEY = 'quantum_scroll_to_top_position';

type Ratio = { rx: number; ry: number };
type Pos = { left: number; top: number };

const readSaved = (): Ratio | null => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && Number.isFinite(saved.rx) && Number.isFinite(saved.ry)) return saved;
  } catch {
    // Storage blocked or garbage — fall back to the default corner.
  }
  return null;
};

const writeSaved = (value: Ratio) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage blocked — the position still holds for this visit.
  }
};

const viewportSize = () => ({
  w: document.documentElement.clientWidth,
  h: document.documentElement.clientHeight,
});

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [viewport, setViewport] = React.useState(viewportSize);
  const [saved, setSaved] = React.useState<Ratio | null>(readSaved);
  const [dragPos, setDragPos] = React.useState<Pos | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dragRef = React.useRef<{ id: number; x: number; y: number; left: number; top: number; moved: boolean } | null>(null);
  const swallowClickRef = React.useRef(false);

  React.useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? (scrolled / height) * 100 : 0;

      setScrollProgress(progress);
      setIsVisible(scrolled > 300);
    };
    const onResize = () => setViewport(viewportSize());
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const size = buttonRef.current?.offsetWidth || 54;
  const maxLeft = viewport.w - size - EDGE_GAP_PX;
  const maxTop = viewport.h - size - EDGE_GAP_PX;

  const clampPos = (left: number, top: number): Pos => ({
    left: clamp(left, EDGE_GAP_PX, maxLeft),
    top: clamp(top, EDGE_GAP_PX, maxTop),
  });

  const toRatio = ({ left, top }: Pos): Ratio => ({
    rx: maxLeft > EDGE_GAP_PX ? (left - EDGE_GAP_PX) / (maxLeft - EDGE_GAP_PX) : 1,
    ry: maxTop > EDGE_GAP_PX ? (top - EDGE_GAP_PX) / (maxTop - EDGE_GAP_PX) : 1,
  });

  const fromRatio = ({ rx, ry }: Ratio): Pos => ({
    left: EDGE_GAP_PX + clamp(rx, 0, 1) * (maxLeft - EDGE_GAP_PX),
    top: EDGE_GAP_PX + clamp(ry, 0, 1) * (maxTop - EDGE_GAP_PX),
  });

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, left: rect.left, top: rect.top, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    drag.moved = true;
    setDragPos(clampPos(drag.left + dx, drag.top + dy));
  };

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>, commit: boolean) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    dragRef.current = null;
    if (!drag.moved) return;
    if (commit) {
      const next = toRatio(clampPos(drag.left + e.clientX - drag.x, drag.top + e.clientY - drag.y));
      setSaved(next);
      writeSaved(next);
      // The click fires right after pointerup — swallow that one only.
      swallowClickRef.current = true;
      setTimeout(() => {
        swallowClickRef.current = false;
      }, 0);
    }
    setDragPos(null);
  };

  const scrollToTop = () => {
    if (swallowClickRef.current) return;
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const placed = dragPos || (saved ? fromRatio(saved) : null);
  const positionStyle: React.CSSProperties = placed
    ? { left: placed.left, top: placed.top, right: 'auto', bottom: 'auto' }
    : {};

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          ref={buttonRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: dragPos ? 1.1 : 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e, true)}
          onPointerCancel={(e) => endDrag(e, false)}
          style={{ ...positionStyle, touchAction: 'none' }}
          aria-label="Back to top"
          title="Back to top · drag to move"
          className={`fixed bottom-8 right-8 z-[60] p-4 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-full shadow-2xl group select-none ${
            dragPos ? 'cursor-grabbing' : 'cursor-grab hover:scale-110 transition-transform'
          }`}
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className="fill-none stroke-black/5 dark:stroke-white/5 stroke-[4]"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className="fill-none stroke-cyan-500 stroke-[4] transition-all duration-300"
              style={{
                strokeDasharray: '283',
                strokeDashoffset: 283 - (283 * scrollProgress) / 100
              }}
            />
          </svg>
          <ArrowUp className="w-5 h-5 text-black dark:text-white group-hover:text-cyan-500 transition-colors pointer-events-none" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
