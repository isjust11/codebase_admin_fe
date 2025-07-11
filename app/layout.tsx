import {Inter} from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale} from 'next-intl/server';
import {ReactNode, Suspense} from 'react';
import { Metadata } from 'next';
import { SITE } from '../config/config';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { locales } from '@/i18n/config';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500','600', '700'],
  variable: '--font-inter',
});

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  title: {
    template: `%s — ${SITE.name}`,
    default: SITE.title,
  },
  description: SITE.description,
};

// Loading component cho Suspense
function LayoutLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Error component cho ErrorBoundary
function LayoutError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Không thể tải ứng dụng
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Vui lòng kiểm tra kết nối mạng và thử lại
        </p>
      </div>
    </div>
  );
}

// Component con xử lý locale - đảm bảo server và client đồng nhất
async function LocaleProvider({ children }: { children: ReactNode }) {
  let locale: string;
  
  try {
    locale = await getLocale();
    // Đảm bảo locale hợp lệ
    if (!locales.includes(locale as any)) {
      locale = 'vi';
    }
  } catch (error) {
    console.error('Failed to get locale:', error);
    locale = 'vi';
  }

  return (
    <NextIntlClientProvider locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}

export default function LocaleLayout({children}: Props) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <title>{SITE.title}</title>
      </head>
      <body 
        className={`${inter.variable} font-sans dark:bg-gray-900`}
        suppressHydrationWarning
      >
        <ErrorBoundary fallback={<LayoutError />}>
          <Suspense fallback={<LayoutLoading />}>
            <LocaleProvider>
              {children}
            </LocaleProvider>
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  );
}
