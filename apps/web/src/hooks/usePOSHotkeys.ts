import { useEffect, useRef } from 'react';

interface UsePOSHotkeysOptions {
  onF2: () => void;
  onF8: () => void;
  onF9: () => void;
  onEscape: () => void;
  onArrowDown: () => void;
  onArrowUp: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onDelete: () => void;
  hasItems: boolean;
}

export function usePOSHotkeys(options: UsePOSHotkeysOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const opts = optionsRef.current;

      if (e.key === 'F2') {
        e.preventDefault();
        opts.onF2();
        return;
      }
      if (e.key === 'F8') {
        e.preventDefault();
        opts.onF8();
        return;
      }
      if (e.key === 'F9') {
        e.preventDefault();
        opts.onF9();
        return;
      }
      if (e.key === 'Escape') {
        opts.onEscape();
        return;
      }

      const activeElement = document.activeElement;
      const isTyping =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.tagName === 'TEXTAREA');

      if (!isTyping && opts.hasItems) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          opts.onArrowDown();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          opts.onArrowUp();
        } else if (e.key === 'ArrowRight' || e.key === '+') {
          e.preventDefault();
          opts.onIncrement();
        } else if (e.key === 'ArrowLeft' || e.key === '-') {
          e.preventDefault();
          opts.onDecrement();
        } else if (e.key === 'Delete') {
          e.preventDefault();
          opts.onDelete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
