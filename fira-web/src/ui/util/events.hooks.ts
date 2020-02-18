import { useLayoutEffect } from 'react';

export function useKeyupEvent(keyFunctionMap: { [P: string]: () => void }) {
  useLayoutEffect(() => {
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
