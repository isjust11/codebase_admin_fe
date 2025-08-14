"use client"
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductComplaint } from '@/types/productComplaint';
import { useTranslations } from 'next-intl';
import { useLoading } from '@/contexts/LoadingContext';

interface ProductComplaintFormProps {
  initialData?: Partial<ProductComplaint>;
  isEditing?: boolean;
  onSubmit: (data: ProductComplaint) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const ProductComplaintForm: React.FC<ProductComplaintFormProps> = ({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { navigateTo, back } = useLoading();
  const t = useTranslations('ProductComplaints');
  const tUtils = useTranslations('Utils');
  const [formData, setFormData] = useState<ProductComplaint>({
    title: '',
    description: '',
    status: 'pending',
    id: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...initialData
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Lỗi khi submit form:', error);
      throw error;
    }
  };

  // Expose submit function to parent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).productComplaintFormSubmit = handleSubmit;
    }
  }, [formData]);

  return (
    <div className="w-full">
      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('title')} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={t('title')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t('status')}</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('status')} />
              </SelectTrigger>
              <SelectContent className='bg-white dark:bg-gray-900'>
                <SelectItem className='bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800' value="pending">
                  {t('pending')}
                </SelectItem>
                <SelectItem className='bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800' value="in_progress">
                  {t('inProgress')}
                </SelectItem>
                <SelectItem className='bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800' value="resolved">
                  {t('resolved')}
                </SelectItem>
                <SelectItem className='bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800' value="closed">
                  {t('closed')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('description')} *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder={t('description')}
            rows={10}
            required
          />
        </div>
      </form>
    </div>
  );
};

export default ProductComplaintForm;

