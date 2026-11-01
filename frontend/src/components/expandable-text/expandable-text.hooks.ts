import { useCallback, useLayoutEffect, useRef, useState } from 'react';

/** Whether the clamped text is cut off (so «Читать дальше» is needed), and the expand toggle. */
export const useExpandableText = (text: string) => {
  const ref = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    if (expanded) return;
    const measure = () => {
      const el = ref.current;
      if (el) setOverflowing(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    // The web font and the width change where the text wraps.
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [text, expanded]);

  const toggle = useCallback(() => setExpanded((prev) => !prev), []);

  return { ref, expanded, overflowing, toggle };
};
