'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getFcmToken } from '@/services/fcm-token-api';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useTranslations } from 'next-intl';
import { FcmToken } from '@/types/fcm-token';

export default function FcmTokenDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const t = useTranslations('FcmTokenPage');
  const tUtils = useTranslations('Utils');

  const [token, setToken] = useState<FcmToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFcmToken(id);
        setToken(data);
      } catch (error) {
        toast.error(t('messages.loadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-gray-500">{tUtils('loading')}</span>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-gray-500">Không tìm thấy FCM token</span>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={t('viewDetails')} />
      <ComponentCard title={t('viewDetails')}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">{t('platform')}</label>
              <p className="mt-1 text-sm text-gray-900">
                {token.platform ? t(`platforms.${token.platform}`) : 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t('isActive')}</label>
              <p className="mt-1">
                <span className={`px-2 py-1 rounded-full text-xs ${token.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {token.isActive ? tUtils('active') : tUtils('inactive')}
                </span>
              </p>
            </div>

            {token.userId && (
              <div>
                <label className="text-sm font-medium text-gray-700">{t('userId')}</label>
                <p className="mt-1 text-sm text-gray-900">{token.userId}</p>
              </div>
            )}

            {token.deviceId && (
              <div>
                <label className="text-sm font-medium text-gray-700">{t('deviceId')}</label>
                <p className="mt-1 text-sm text-gray-900">{token.deviceId}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">{t('createdAt')}</label>
              <p className="mt-1 text-sm text-gray-900">
                {token.createdAt ? new Date(token.createdAt).toLocaleString('vi-VN') : 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Cập nhật lần cuối</label>
              <p className="mt-1 text-sm text-gray-900">
                {token.updatedAt ? new Date(token.updatedAt).toLocaleString('vi-VN') : 'N/A'}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">{t('token')}</label>
            <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-4 rounded-md break-all">
              {token.token}
            </p>
          </div>

          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => router.back()}>
              {tUtils('back')}
            </Button>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}

