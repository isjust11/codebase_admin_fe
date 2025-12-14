'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createNotificationConfig } from '@/services/notification-config-api';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useTranslations } from 'next-intl';
import { NotificationConfigDto } from '@/types/dto/NotificationConfigDto';
import Switch from '@/components/form/switch/Switch';

export default function CreateNotificationConfigPage() {
  const router = useRouter();
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
  const [useJson, setUseJson] = useState(false);

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
      }
      await createNotificationConfig(dataToSubmit);
      toast.success(t('messages.createSuccess'));
      router.push('/manager/notification-configs');
    } catch (error) {
      toast.error(t('messages.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={t('createConfig')} />
      <ComponentCard title={t('createConfig')}>
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
                onChange={(checked) => setFormData({ 
                  ...formData, 
                  isDefault: checked,
                  userId: checked ? undefined : formData.userId 
                })}
              />
              <div className="flex-1">
                <Label htmlFor="is-default" className="font-semibold text-blue-900">
                  {t('isDefault')}
                </Label>
                <p className="text-xs text-blue-700 mt-1">
                  {formData.isDefault 
                    ? "✅ Cấu hình này sẽ áp dụng cho tất cả người dùng (mặc định)"
                    : "⚠️ Cấu hình này chỉ áp dụng cho người dùng cụ thể"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              label="Sử dụng JSON Value"
              defaultChecked={useJson}
              onChange={(checked) => setUseJson(checked)}
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
              defaultChecked={formData.isActive ?? true}
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
              {loading ? tUtils('saving') : tUtils('save')}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}

