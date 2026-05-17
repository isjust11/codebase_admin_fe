import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import Switch from "@/components/form/switch/Switch";
import { z } from 'zod';
import { toast } from 'sonner';
import Select, { SelectOption } from '@/components/form/Select';
import { SubscriptionPlan, PlanCode } from '@/types/subscription-plan';
import { getSubscriptionPlansMetadata } from '@/services/subscription-plan-api';

interface PlanFormProps {
  initialData?: Partial<SubscriptionPlan>;
  isEditing?: boolean;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

const planFormSchema = (t: any) => z.object({
  code: z.string().min(1, t('validation.codeRequired')),
  name: z.string().min(1, t('validation.nameRequired')),
  description: z.string().optional(),
  nameEn: z.string().min(1, t('validation.nameEnRequired')),
  descriptionEn: z.string().optional(),
  storageLimitBytes: z.number().min(0).optional(),
  ttsLimitPerPeriod: z.number().min(0).optional(),
  convertLimitPerPeriod: z.number().min(0).optional(),
  periodType: z.string().optional(),
  price: z.number().min(0).optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

const storagePresets: SelectOption[] = [
  { value: '0', label: '0 (Không giới hạn)' },
  { value: '104857600', label: '100 MB' },
  { value: '524288000', label: '500 MB' },
  { value: '1073741824', label: '1 GB' },
  { value: '5368709120', label: '5 GB' },
  { value: '10737418240', label: '10 GB' },
  { value: '53687091200', label: '50 GB' },
];

const PlanForm: React.FC<PlanFormProps> = ({
  initialData,
  isEditing = false,
  onSubmit,
  loading = false,
}) => {
  const t = useTranslations('SubscriptionPlans');
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  const schema = planFormSchema(t);
  const [codes, setCodes] = useState<SelectOption[]>([]);
  const [periodTypes, setPeriodTypes] = useState<SelectOption[]>([]);

  const [formData, setFormData] = useState<Record<string, any>>({
    code: 'FREE',
    name: '',
    description: '',
    nameEn: '',
    descriptionEn: '',
    ttsLimitPerPeriod: 0,
    convertLimitPerPeriod: 0,
    periodType: 'MONTH',
    price: 0,
    sortOrder: 0,
    isActive: true,
    ...initialData,
    storageLimitBytes: initialData?.storageLimitBytes ? Number(initialData.storageLimitBytes) : 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        storageLimitBytes: initialData?.storageLimitBytes ? Number(initialData.storageLimitBytes) : 0,
      }));
    }
  }, [initialData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSubscriptionPlansMetadata();
        setCodes(response.codes.map(code => ({ value: code, label: code })));
        setPeriodTypes(response.periodTypes.map(periodType => ({ value: periodType, label: periodType })));
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (field: string, value: string | boolean | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const parsed = {
      ...formData,
      storageLimitBytes: Number(formData.storageLimitBytes) || 0,
      ttsLimitPerPeriod: Number(formData.ttsLimitPerPeriod) || 0,
      convertLimitPerPeriod: Number(formData.convertLimitPerPeriod) || 0,
      price: Number(formData.price) || 0,
      sortOrder: Number(formData.sortOrder) || 0,
    };

    const result = await schema.safeParseAsync(parsed);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const errors: Record<string, string | undefined> = {};
      Object.entries(fieldErrors).forEach(([key, val]) => { errors[key] = val?.[0]; });
      setFormErrors(errors);
      toast.error(t('validation.validationError'));
      return;
    }
    setFormErrors({});

    try {
      await onSubmit(parsed);
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).planFormSubmit = handleSubmit;
    }
  }, [formData]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('code')} <span className="text-red-500">(*)</span></Label>
          <Select
            options={codes}
            placeholder={t('selectCode')}
            value={formData.code}
            onChange={(value) => handleInputChange('code', value as string)}
            disabled={isEditing}
          />
          {formErrors.code && <div className="text-red-500 text-sm">{formErrors.code}</div>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">{t('name')} <span className="text-red-500">(*)</span></Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder={t('namePlaceholder')}
          />
          {formErrors.name && <div className="text-red-500 text-sm">{formErrors.name}</div>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('description')}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder={t('descriptionPlaceholder')}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nameEn">{t('nameEn')} <span className="text-red-500">(*)</span></Label>
          <Input
            id="nameEn"
            value={formData.nameEn}
            onChange={(e) => handleInputChange('nameEn', e.target.value)}
            placeholder={t('nameEnPlaceholder')}
          />
          {formErrors.nameEn && <div className="text-red-500 text-sm">{formErrors.nameEn}</div>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descriptionEn">{t('descriptionEn')}</Label>
        <Textarea
          id="descriptionEn"
          value={formData.descriptionEn}
          onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
          placeholder={t('descriptionEnPlaceholder')}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('price')} (VND)</Label>
          <Input
            type="number"
            value={formData.price || ''}
            onChange={(e) => handleInputChange('price', e.target.value ? Number(e.target.value) : 0)}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>{t('period')}</Label>
          <Select
            options={periodTypes}
            value={formData.periodType}
            onChange={(value) => handleInputChange('periodType', value as string)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>{t('storage')}</Label>
          <Select
            options={storagePresets}
            value={String(formData.storageLimitBytes)}
            onChange={(value) => handleInputChange('storageLimitBytes', Number(value))}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('ttsLimit')}</Label>
          <Input
            type="number"
            value={formData.ttsLimitPerPeriod || ''}
            onChange={(e) => handleInputChange('ttsLimitPerPeriod', e.target.value ? Number(e.target.value) : 0)}
            placeholder="0 = không giới hạn"
          />
        </div>
        <div className="space-y-2">
          <Label>{t('convertLimit')}</Label>
          <Input
            type="number"
            value={formData.convertLimitPerPeriod || ''}
            onChange={(e) => handleInputChange('convertLimitPerPeriod', e.target.value ? Number(e.target.value) : 0)}
            placeholder="0 = không giới hạn"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('sortOrder')}</Label>
          <Input
            type="number"
            value={formData.sortOrder || ''}
            onChange={(e) => handleInputChange('sortOrder', e.target.value ? Number(e.target.value) : 0)}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>{t('status')}</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Switch
              label={formData.isActive ? t('active') : t('inactive')}
              defaultChecked={formData.isActive}
              onChange={(checked: boolean) => handleInputChange('isActive', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanForm;
