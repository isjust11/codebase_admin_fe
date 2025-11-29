'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { DiseaseForm, DiseaseFormData } from '../components/DiseaseForm';
import { DiseaseDto } from '@/types/dto/DiseaseDto';
import { createDisease } from '@/services/disease-api';
import { useLoading } from '@/contexts/LoadingContext';

const CreateDiseasePage: React.FC = () => {
  const t = useTranslations('DiseasesPage');
  const tUtils = useTranslations('Utils');
  const { navigateTo } = useLoading();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DiseaseFormData>({
    name: '',
    slug: '',
    summary: '',
    description: '',
    symptoms: '',
    causes: '',
    prevention: '',
    treatment: '',
    authorId: '',
    categoryId: '',
    dataSourceId: '',
    videoUrl: '',
    isActive: true,
    imagePaths: [],
  });

  const handleInputChange = (field: string, value: string | boolean | string[] | File | File[] | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createDisease(formData as DiseaseDto);
      toast.success(t('messages.createSuccess'));
      navigateTo('/manager/diseases');
    } catch (error) {
      console.error(t('messages.createError'), error);
      toast.error(t('messages.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb
        pageTitle={t('createDisease')}
        items={[
          { title: t('title'), href: '/manager/diseases' },
          { title: t('createDisease'), href: '/manager/diseases/create' },
        ]}
      />

      <div className="space-y-6">
        <ComponentCard title={t('basicInfo')}>
          <DiseaseForm
          formData={formData}
            onSubmit={handleSubmit}
            onInputChange={handleInputChange}
            onCancel={() => navigateTo('/manager/diseases')}
            loading={loading}
            isEdit={false}
          />
        </ComponentCard>
      </div>
    </div>
  );
};

export default CreateDiseasePage;

