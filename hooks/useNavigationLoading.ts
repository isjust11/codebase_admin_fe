import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export const useNavigationLoading = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set());
  const [showFullScreenLoading, setShowFullScreenLoading] = useState(false);

  const navigateTo = useCallback((path: string) => {
    if (!path) return;
    
    // Thêm path vào loading state
    setLoadingPaths(prev => new Set(prev).add(path));
    
    // Hiển thị loading full màn hình
    setShowFullScreenLoading(true);
    
    startTransition(() => {
      router.push(path);
    });
  }, [router]);

  const back = useCallback(() => {
    router.back();
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
    
    // Ẩn loading full màn hình khi không còn path nào đang loading
    if (loadingPaths.size === 0 || (path && loadingPaths.size === 1)) {
      setShowFullScreenLoading(false);
    }
  }, [loadingPaths]);

  const isLoading = useCallback((path: string) => {
    return loadingPaths.has(path);
  }, [loadingPaths]);

  // Tự động ẩn loading khi navigation hoàn thành
  useEffect(() => {
    if (!isPending && loadingPaths.size > 0) {
      // Delay một chút để đảm bảo UI đã render xong
      const timer = setTimeout(() => {
        setShowFullScreenLoading(false);
        setLoadingPaths(new Set());
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isPending, loadingPaths]);

  return {
    navigateTo,
    clearLoading,
    isLoading,
    isPending,
    loadingPaths,
    showFullScreenLoading,
    back
  };
}; 