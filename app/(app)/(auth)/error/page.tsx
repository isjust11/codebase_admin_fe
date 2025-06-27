'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message') || 'Đăng nhập thất bại';
    toast.error(message);
    
    // Chuyển hướng về trang đăng nhập sau 2 giây
    const timeout = setTimeout(() => {
      router.push('/login');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [searchParams, router]);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Đăng nhập thất bại</h1>
        <p className="text-gray-600 mb-4">Đang chuyển hướng về trang đăng nhập...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
      </div>
    </div>
  );
} 
export default function Error(){
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <AuthError />
    </Suspense>
  )
}
