import { useEffect } from 'react';

export function useKeyupEvent(keyFunctionMap: { [P: string]: () => void }) {
  useEffect(() => {
    const keyUpHandler = (e: KeyboardEvent) => {
      const key = e.code;
      if (keyFunctionMap.hasOwnProperty(key)) {
        keyFunctionMap[key]();
      }
    };
    document.addEventListener('keyup', keyUpHandler, { passive: true });
    return () => document.removeEventListener('keyup', keyUpHandler);
  });
}

export function useOnViewportClick(onViewportClick: () => void) {
  useEffect(() => {
    const viewportClickHandler = () => onViewportClick();
    document.addEventListener('click', viewportClickHandler, { passive: true });
    return () => document.removeEventListener('click', viewportClickHandler);
  });
}
