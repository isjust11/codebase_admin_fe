'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getNotification } from '@/services/notification-api';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useTranslations } from 'next-intl';
import { Notification } from '@/types/notification';

export default function NotificationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const t = useTranslations('NotificationPage');
  const tUtils = useTranslations('Utils');

  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getNotification(id);
        setNotification(data);
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

  if (!notification) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-gray-500">Không tìm thấy thông báo</span>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={t('notificationDetails')} />
      <ComponentCard title={t('notificationDetails')}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">{t('notificationTitle')}</label>
              <p className="mt-1 text-sm text-gray-900">{notification.title}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t('type')}</label>
              <p className="mt-1 text-sm text-gray-900">{t(`types.${notification.type}`)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t('priority')}</label>
              <p className="mt-1 text-sm text-gray-900">{t(`priorities.${notification.priority}`)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t('status')}</label>
              <p className="mt-1 text-sm text-gray-900">{t(`statuses.${notification.status}`)}</p>
            </div>

            {notification.userId && (
              <div>
                <label className="text-sm font-medium text-gray-700">{t('userId')}</label>
                <p className="mt-1 text-sm text-gray-900">{notification.userId}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">{t('createdAt')}</label>
              <p className="mt-1 text-sm text-gray-900">
                {notification.createdAt ? new Date(notification.createdAt).toLocaleString('vi-VN') : 'N/A'}
              </p>
            </div>

            {notification.sentAt && (
              <div>
                <label className="text-sm font-medium text-gray-700">{t('sentAt')}</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(notification.sentAt).toLocaleString('vi-VN')}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">{t('content')}</label>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{notification.content}</p>
          </div>

          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">{t('metadata')}</label>
              <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-4 rounded-md overflow-auto">
                {JSON.stringify(notification.metadata, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => router.back()}>
              {tUtils('back')}
            </Button>
            <Button onClick={() => router.push(`/manager/notifications/update/${id}`)}>
              {tUtils('edit')}
            </Button>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}

