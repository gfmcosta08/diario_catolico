import { useCallback, useEffect, useRef } from 'react';

export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void | Promise<void>,
  delayMs: number
): (...args: A) => void {
  const fnRef = useRef(fn);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  fnRef.current = fn;

  useEffect(
    () => () => {
      if (tRef.current) clearTimeout(tRef.current);
    },
    []
  );

  return useCallback(
    (...args: A) => {
      if (tRef.current) clearTimeout(tRef.current);
      tRef.current = setTimeout(() => {
        void fnRef.current(...args);
      }, delayMs);
    },
    [delayMs]
  );
}
