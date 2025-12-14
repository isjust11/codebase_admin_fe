'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getTopicSubscription } from '@/services/topic-subscription-api';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useTranslations } from 'next-intl';
import { TopicSubscription } from '@/types/topic-subscription';

export default function TopicSubscriptionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const t = useTranslations('TopicSubscriptionPage');
  const tUtils = useTranslations('Utils');

  const [subscription, setSubscription] = useState<TopicSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTopicSubscription(id);
        setSubscription(data);
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

  if (!subscription) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-gray-500">Không tìm thấy đăng ký</span>
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
              <label className="text-sm font-medium text-gray-700">{t('userId')}</label>
              <p className="mt-1 text-sm text-gray-900">{subscription.userId}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t('topic')}</label>
              <p className="mt-1 text-sm text-gray-900">{subscription.topic}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t('isActive')}</label>
              <p className="mt-1">
                <span className={`px-2 py-1 rounded-full text-xs ${subscription.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {subscription.isActive ? tUtils('active') : tUtils('inactive')}
                </span>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{t('createdAt')}</label>
              <p className="mt-1 text-sm text-gray-900">
                {subscription.createdAt ? new Date(subscription.createdAt).toLocaleString('vi-VN') : 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Cập nhật lần cuối</label>
              <p className="mt-1 text-sm text-gray-900">
                {subscription.updatedAt ? new Date(subscription.updatedAt).toLocaleString('vi-VN') : 'N/A'}
              </p>
            </div>
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

