'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { LoadingProvider } from '@/contexts/LoadingContext';

export default function TemplateStudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LoadingProvider
        options={{
          variant: 'default',
          size: 'small',
          showProgress: false,
        }}
      >
        <main className="min-h-screen">{children}</main>
      </LoadingProvider>
    </AuthProvider>
  );
}
