'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { DiseaseForm } from '../../components/DiseaseForm';
import { DiseaseDto } from '@/types/dto/DiseaseDto';
import { Disease } from '@/types/disease';
import { getDiseaseById, updateDisease } from '@/services/disease-api';
import { useLoading } from '@/contexts/LoadingContext';

const UpdateDiseasePage: React.FC = () => {
  const t = useTranslations('DiseasesPage');
  const tUtils = useTranslations('Utils');
  const params = useParams();
  const { navigateTo } = useLoading();

  const diseaseId = params.id as string;

  const [initialData, setInitialData] = useState<Disease | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchDisease = async () => {
      try {
        const response = await getDiseaseById(diseaseId);
        setInitialData(response);
      } catch (error) {
        console.error(t('messages.loadError'), error);
        toast.error(t('messages.loadError'));
      } finally {
        setFetching(false);
      }
    };

    if (diseaseId) {
      fetchDisease();
    }
  }, [diseaseId, t]);

  const handleSubmit = async (values: DiseaseDto) => {
    setLoading(true);
    try {
      await updateDisease(diseaseId, values);
      toast.success(t('messages.updateSuccess'));
      navigateTo('/manager/diseases');
    } catch (error) {
      console.error(t('messages.updateError'), error);
      toast.error(t('messages.updateError'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-200"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{tUtils('loading')}</p>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300">{t('messages.notFound')}</p>
          <button
            className="mt-4 text-blue-500 hover:underline"
            onClick={() => navigateTo('/manager/diseases')}
          >
            {tUtils('back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb
        pageTitle={t('updateDisease')}
        items={[
          { title: t('title'), href: '/manager/diseases' },
          { title: t('updateDisease'), href: `/manager/diseases/update/${diseaseId}` },
        ]}
      />

      <div className="space-y-6">
        <ComponentCard title={t('basicInfo')}>
          <DiseaseForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => navigateTo('/manager/diseases')}
            loading={loading}
            submitLabel={loading ? tUtils('saving') : t('updateDisease')}
          />
        </ComponentCard>
      </div>
    </div>
  );
};

export default UpdateDiseasePage;

