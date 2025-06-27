'use client'
// 
import { Inter } from 'next/font/google';
import { Provider } from 'react-redux';
import { store } from '@/store';
import '../globals.css';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'sonner';
import Loading from '@/components/ui/loading';
const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const locale = await getLocale();
  return (
    <div>
      <Provider store={store}>
        <ThemeProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
          <Toaster
            position="top-center"
            duration={4000}
            richColors
            theme="light"
            className="toast-wrapper"
            toastOptions={{
              className: 'toast',
            }}
          />
          <Loading />
        </ThemeProvider>
      </Provider>
    </div>
  );
}