'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getNotificationConfig } from '@/services/notification-config-api';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useTranslations } from 'next-intl';
import { NotificationConfig } from '@/types/notification-config';

export default function NotificationConfigDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const t = useTranslations('NotificationConfigPage');
  const tUtils = useTranslations('Utils');

  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getNotificationConfig(id);
        setConfig(data);
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

  if (!config) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-gray-500">Không tìm thấy cấu hình</span>
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
              <label className="text-sm font-medium text-gray-700">{t('key')}</label>
              <p className="mt-1 text-sm text-gray-900">{config.key}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t('isDefault')}</label>
              <p className="mt-1">
                {config.isDefault ? (
                  <span className="px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800 font-medium">
                    ✅ Mặc định (Áp dụng cho tất cả người dùng)
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-full text-sm bg-orange-100 text-orange-800 font-medium">
                    👤 Người dùng cụ thể
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t('isActive')}</label>
              <p className="mt-1">
                <span className={`px-2 py-1 rounded-full text-xs ${config.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {config.isActive ? tUtils('active') : tUtils('inactive')}
                </span>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t('createdAt')}</label>
              <p className="mt-1 text-sm text-gray-900">
                {config.createdAt ? new Date(config.createdAt).toLocaleString('vi-VN') : 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Cập nhật lần cuối</label>
              <p className="mt-1 text-sm text-gray-900">
                {config.updatedAt ? new Date(config.updatedAt).toLocaleString('vi-VN') : 'N/A'}
              </p>
            </div>
          </div>

          {config.value && (
            <div>
              <label className="text-sm font-medium text-gray-700">{t('value')}</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-4 rounded-md">
                {config.value}
              </p>
            </div>
          )}

          {config.jsonValue && (
            <div>
              <label className="text-sm font-medium text-gray-700">{t('jsonValue')}</label>
              <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-4 rounded-md overflow-auto">
                {JSON.stringify(config.jsonValue, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => router.back()}>
              {tUtils('back')}
            </Button>
            <Button onClick={() => router.push(`/manager/notification-configs/update/${id}`)}>
              {tUtils('edit')}
            </Button>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}

