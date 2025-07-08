'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { AppConstants } from '@/constants';
import { Suspense } from 'react';
import { getFeaturesByRole, getTokenInfo } from '@/services/auth-api';

function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      const tempToken = searchParams.get('token');
      if (tempToken) {
        try {
          // Lấy thông tin user và access token từ server
          const userInfo = await getTokenInfo(tempToken);

          if (!isMounted) return;

          // Lưu thông tin vào localStorage
          console.log('userInfo', userInfo);
          localStorage.setItem(AppConstants.AccessToken, userInfo.accessToken);
          localStorage.setItem(AppConstants.RefreshToken, userInfo.refreshToken);
          localStorage.setItem(AppConstants.User, JSON.stringify(userInfo.user));
          const roleId = userInfo.user.roles[0].id;
          const feature = await getFeaturesByRole(roleId);

          if (!isMounted) return;

          localStorage.setItem(AppConstants.Feature, JSON.stringify(feature));
          toast.success('Đăng nhập thành công');
          router.push('/');
        } catch (error) {
          if (!isMounted) return;

          console.error('Error fetching token info:', error);
          toast.error('Có lỗi xảy ra khi xử lý đăng nhập');
          router.push('/login');
        } finally {
          if (isMounted) {
            setIsProcessing(false);
          }
        }
      } else {
        if (!isMounted) return;

        toast.error('Không tìm thấy token đăng nhập');
        router.push('/login');
        setIsProcessing(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [searchParams, router]);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">

        {
          isProcessing ? (
            <>
              <h1 className="text-2xl font-bold text-blue-700 mb-4">Đang xử lý đăng nhập</h1>
              <p className="text-gray-600 mb-4">Đang xử lý thông tin đăng nhập...</p>
            </>

          ) : (
            <>
              <h1 className="text-2xl font-bold text-fuchsia-700 mb-4">Đăng nhập thành công!</h1>
              <p className="text-gray-600 mb-4">Đang điều hướng tới trang chủ...</p>
            </>
          )
        }
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-700 mx-auto"></div>
      </div>
    </div>
  );

}

export default function Success() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <AuthSuccessPage />
    </Suspense>
  );
}