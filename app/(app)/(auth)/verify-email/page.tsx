'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { verifyEmail } from '@/services/auth-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const handleVerifyEmail = async () => {
    try {
      await verifyEmail(token || '');
      toast.success('Xác thực email thành công');
      router.push('/login');
    } catch (error: any) {
      toast.error('Xác thực email thất bại: ' + error.response.data.message);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
      <div className='p-3 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 shadow-sm dark:bg-white/[0.03]'>
      <h1 className="text-2xl font-bold mb-4">Xác thực Email</h1>
        <p className="text-gray-600 mb-6">
          Vui lòng nhấn nút bên dưới để xác thực email của bạn
        </p>
        <Button className='w-full py-3 text-sm font-normal text-white transition-colors bg-brand-500 rounded-lg hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-500' onClick={handleVerifyEmail}>Xác thực Email</Button>
      </div>
       
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 