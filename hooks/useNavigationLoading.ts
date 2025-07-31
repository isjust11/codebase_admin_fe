import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export const useNavigationLoading = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set());

  const navigateTo = useCallback((path: string) => {
    if (!path) return;
    
    // Thêm path vào loading state
    setLoadingPaths(prev => new Set(prev).add(path));
    
    startTransition(() => {
      router.push(path);
    });
  }, [router]);

  const clearLoading = useCallback((path?: string) => {
    if (path) {
      setLoadingPaths(prev => {
        const newSet = new Set(prev);
        newSet.delete(path);
        return newSet;
      });
    } else {
      setLoadingPaths(new Set());
    }
  }, []);

  const isLoading = useCallback((path: string) => {
    return loadingPaths.has(path);
  }, [loadingPaths]);

  return {
    navigateTo,
    clearLoading,
    isLoading,
    isPending,
    loadingPaths
  };
}; 