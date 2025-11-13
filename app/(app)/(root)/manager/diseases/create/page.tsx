'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { DiseaseForm } from '../components/DiseaseForm';
import { DiseaseDto } from '@/types/dto/DiseaseDto';
import { createDisease } from '@/services/disease-api';
import { useLoading } from '@/contexts/LoadingContext';

const CreateDiseasePage: React.FC = () => {
  const t = useTranslations('DiseasesPage');
  const tUtils = useTranslations('Utils');
  const { navigateTo } = useLoading();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: DiseaseDto) => {
    setLoading(true);
    try {
      await createDisease(values);
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
            onSubmit={handleSubmit}
            onCancel={() => navigateTo('/manager/diseases')}
            loading={loading}
            submitLabel={loading ? tUtils('saving') : t('createDisease')}
          />
        </ComponentCard>
      </div>
    </div>
  );
};

export default CreateDiseasePage;

