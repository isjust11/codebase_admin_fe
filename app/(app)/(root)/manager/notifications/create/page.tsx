'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createNotification } from '@/services/notification-api';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useTranslations } from 'next-intl';
import { NotificationType, NotificationPriority, NotificationStatus } from '@/types/notification';
import { NotificationDto } from '@/types/dto/NotificationDto';

export default function CreateNotificationPage() {
  const router = useRouter();
  const t = useTranslations('NotificationPage');
  const tUtils = useTranslations('Utils');

  const [formData, setFormData] = useState<NotificationDto>({
    title: '',
    content: '',
    type: NotificationType.SYSTEM,
    priority: NotificationPriority.MEDIUM,
    status: NotificationStatus.UNREAD,
    userId: undefined,
    metadata: {}
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createNotification(formData);
      toast.success(t('messages.createSuccess'));
      router.push('/manager/notifications');
    } catch (error) {
      toast.error(t('messages.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={t('createNotification')} />
      <ComponentCard title={t('createNotification')}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">{t('notificationTitle')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('form.titlePlaceholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{t('content')}</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={t('form.contentPlaceholder')}
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">{t('type')}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as NotificationType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('form.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(NotificationType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`types.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">{t('priority')}</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as NotificationPriority })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('form.selectPriority')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(NotificationPriority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {t(`priorities.${priority}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">{t('status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as NotificationStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('form.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(NotificationStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`statuses.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">{t('userId')}</Label>
              <Input
                id="userId"
                type="number"
                value={formData.userId || ''}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value ? Number(e.target.value) : undefined })}
                placeholder={t('form.userIdPlaceholder')}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              {tUtils('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? tUtils('saving') : tUtils('save')}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}

