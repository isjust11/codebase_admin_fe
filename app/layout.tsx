
import {Inter} from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale} from 'next-intl/server';
import {ReactNode} from 'react';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500','600', '700'],
  variable: '--font-inter',
});

type Props = {
  children: ReactNode;
};

export default async function LocaleLayout({children}: Props) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <head>
        <title>Base - Admin web system</title>
      </head>
      <body
         className={`${inter.variable} font-sans dark:bg-gray-900`}
      >
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
