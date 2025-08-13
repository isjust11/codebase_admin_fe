import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { ReactNode, Suspense } from 'react';
import { Metadata } from 'next';
import { SITE } from '../config/config';
import { locales } from '@/i18n/config';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
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


async function LocaleProvider({ children }: { children: ReactNode }) {
  let locale: string;

  try {
    locale = await getLocale();
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

export default function LocaleLayout({ children }: Props) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <title>{SITE.title}</title>
      </head>
      <body
        className={`${inter.variable} font-sans dark:bg-gray-900`}
        suppressHydrationWarning
      >
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
