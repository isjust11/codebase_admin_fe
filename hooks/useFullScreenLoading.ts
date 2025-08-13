import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import { FullScreenLoading } from '@/components/ui/FullScreenLoading';
import React from 'react';
import { useTranslations } from 'next-intl';

interface UseFullScreenLoadingOptions {
  message?: string;
  variant?: 'default' | 'minimal' | 'fancy';
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  className?: string;
}

export const useFullScreenLoading = (options: UseFullScreenLoadingOptions = {}) => {
  const navigationLoading = useNavigationLoading();
  const tUtils = useTranslations('Utils');
  const {
    message = tUtils('loading'),
    variant = 'default',
    size = 'medium',
    showProgress = false,
    className = ""
  } = options;
  
  const FullScreenLoadingComponent = () => {
    return React.createElement(FullScreenLoading, {
      isVisible: navigationLoading.showFullScreenLoading,
      message: message,
      variant: variant,
      size: size,
      showProgress: showProgress,
      className: className
    });
  };
  
  return {
    navigateTo: navigationLoading.navigateTo,
    clearLoading: navigationLoading.clearLoading,
    isLoading: navigationLoading.isLoading,
    isPending: navigationLoading.isPending,
    loadingPaths: navigationLoading.loadingPaths,
    showFullScreenLoading: navigationLoading.showFullScreenLoading,
    back: navigationLoading.back,
    FullScreenLoadingComponent
  };
};
