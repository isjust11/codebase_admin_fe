import { useEffect, useRef } from 'react';

export function useAsyncEffect(
  effect: () => Promise<void | (() => void)>,
  deps?: React.DependencyList
) {
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const executeEffect = async () => {
      try {
        const cleanup = await effect();
        return cleanup;
      } catch (error) {
        console.error('Error in async effect:', error);
      }
    };

    const cleanupPromise = executeEffect();

    return () => {
      isMounted.current = false;
      cleanupPromise.then(cleanup => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      });
    };
  }, deps);

  return isMounted.current;
} 