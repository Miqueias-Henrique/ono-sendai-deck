import { useEffect } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal focus: moves focus inside the dialog on open, traps Tab /
 * Shift+Tab within it, and returns focus to the trigger element on close.
 */
export default function useModalFocus(open, containerRef) {
  useEffect(() => {
    if (!open) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    const previouslyFocused = document.activeElement;
    const focusables = () => Array.from(container.querySelectorAll(FOCUSABLE));

    if (!container.contains(document.activeElement)) {
      const first = container.querySelector('[autofocus], input') || focusables()[0];
      first?.focus();
    }

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [open, containerRef]);
}
