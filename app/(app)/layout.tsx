'use client'
// 
import { Provider } from 'react-redux';
import { store } from '@/store';
import '../globals.css';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'sonner';
import Loading from '@/components/ui/loading';
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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