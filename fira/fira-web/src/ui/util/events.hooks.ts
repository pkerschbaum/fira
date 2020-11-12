import { useEffect } from 'react';

export function useKeyupEvent(keyFunctionMap: {
  [keyCode: string]:
    | (() => void)
    | {
        additionalKeys: Array<'ALT' | 'STRG'> | ReadonlyArray<'ALT' | 'STRG'>;
        handler: () => void;
      };
}) {
  useEffect(() => {
    const keyUpHandler = (e: KeyboardEvent) => {
      const keyCode = e.code;
      if (keyFunctionMap.hasOwnProperty(keyCode)) {
        const keyHandler = keyFunctionMap[keyCode];
        if (typeof keyHandler === 'function') {
          keyHandler();
        } else {
          const allAdditionalKeysPressed = keyHandler.additionalKeys.every((key) => {
            return (key !== 'ALT' || e.altKey) && (key !== 'STRG' || e.ctrlKey);
          });
          if (allAdditionalKeysPressed) {
            keyHandler.handler();
          }
        }
      }
    };

    document.addEventListener('keyup', keyUpHandler, { passive: true });
    return () => document.removeEventListener('keyup', keyUpHandler);
  });
}
