'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getNotificationConfig, updateNotificationConfig } from '@/services/notification-config-api';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useTranslations } from 'next-intl';
import { NotificationConfigDto } from '@/types/dto/NotificationConfigDto';
import Switch from '@/components/form/switch/Switch';

export default function UpdateNotificationConfigPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('NotificationConfigPage');
  const tUtils = useTranslations('Utils');

  const [formData, setFormData] = useState<NotificationConfigDto>({
    userId: undefined,
    key: '',
    value: '',
    jsonValue: undefined,
    isActive: true,
    isDefault: true
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [useJson, setUseJson] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = await getNotificationConfig(id);
        const hasJsonValue = config.jsonValue !== null && config.jsonValue !== undefined;
        setUseJson(hasJsonValue);
        setFormData({
          userId: config.userId,
          key: config.key,
          value: hasJsonValue ? JSON.stringify(config.jsonValue, null, 2) : (config.value || ''),
          jsonValue: config.jsonValue,
          isActive: config.isActive,
          isDefault: config.isDefault ?? true
        });
      } catch (error) {
        toast.error(t('messages.loadError'));
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSubmit = { ...formData };
      if (useJson && formData.value) {
        try {
          dataToSubmit.jsonValue = JSON.parse(formData.value);
          dataToSubmit.value = undefined;
        } catch (error) {
          toast.error('Invalid JSON format');
          setLoading(false);
          return;
        }
      } else {
        dataToSubmit.jsonValue = undefined;
      }
      await updateNotificationConfig(id, dataToSubmit);
      toast.success(t('messages.updateSuccess'));
      router.push('/manager/notification-configs');
    } catch (error) {
      toast.error(t('messages.updateError'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-gray-500">{tUtils('loading')}</span>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={t('updateConfig')} />
      <ComponentCard title={t('updateConfig')}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="key">{t('key')}</Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              placeholder={t('form.keyPlaceholder')}
              required
            />
          </div>

          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <Switch
                label={t('isDefault')}
                defaultChecked={formData.isDefault}
                onChange={(checked: boolean) => setFormData({ 
                  ...formData, 
                  isDefault: checked
                })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              label="Sử dụng JSON Value"
              defaultChecked={useJson}
              onChange={(checked: boolean) => setUseJson(checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">{useJson ? t('jsonValue') : t('value')}</Label>
            {useJson ? (
              <Textarea
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={t('form.jsonValuePlaceholder')}
                rows={8}
                className="font-mono"
              />
            ) : (
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={t('form.valuePlaceholder')}
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              label={t('isActive')}
              defaultChecked={formData.isActive}
              onChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
            />
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
              {loading ? tUtils('saving') : tUtils('update')}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}

