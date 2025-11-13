'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Badge from '@/components/ui/badge/Badge';
import { Disease } from '@/types/disease';
import { getDiseaseById } from '@/services/disease-api';
import { useLoading } from '@/contexts/LoadingContext';
import { Action } from '@/types/actions';

const DiseaseDetailPage: React.FC = () => {
  const t = useTranslations('DiseasesPage');
  const tUtils = useTranslations('Utils');
  const params = useParams();
  const { navigateTo } = useLoading();

  const diseaseId = params.id as string;

  const [disease, setDisease] = useState<Disease | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisease = async () => {
      try {
        const response = await getDiseaseById(diseaseId);
        setDisease(response);
      } catch (error) {
        console.error(t('messages.loadError'), error);
        toast.error(t('messages.loadError'));
      } finally {
        setLoading(false);
      }
    };

    if (diseaseId) {
      fetchDisease();
    }
  }, [diseaseId, t]);

  const actions: Action[] = [
    {
      icon: <ArrowLeft className="w-4 h-4 mr-2" />,
      onClick: () => navigateTo('/manager/diseases'),
      title: tUtils('back'),
      className: 'text-gray-600 hover:bg-gray-100',
    },
    {
      icon: <Pencil className="w-4 h-4 mr-2" />,
      onClick: () => navigateTo(`/manager/diseases/update/${diseaseId}`),
      title: tUtils('edit'),
      className: 'text-blue-500 hover:bg-blue-100',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-200"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{tUtils('loading')}</p>
        </div>
      </div>
    );
  }

  if (!disease) {
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
        pageTitle={t('detailDisease')}
        items={[
          { title: t('title'), href: '/manager/diseases' },
          { title: disease.name, href: `/manager/diseases/${diseaseId}` },
        ]}
      />

      <div className="space-y-6">
        <ComponentCard title={t('basicInfo')} listAction={actions}>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{disease.name}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('slug')}: <span className="font-mono">{disease.slug || tUtils('noData')}</span>
                </p>
              </div>
              <Badge
                className={disease.isActive ? 'ring-green-400' : 'ring-red-400'}
                variant="light"
                color={disease.isActive ? 'success' : 'error'}
              >
                {disease.isActive ? tUtils('active') : tUtils('inactive')}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <span className="font-medium text-gray-800 dark:text-gray-200">{t('createdAt')}:</span>{' '}
                {disease.createdAt ? new Date(disease.createdAt).toLocaleDateString('vi-VN') : tUtils('noData')}
              </div>
              <div>
                <span className="font-medium text-gray-800 dark:text-gray-200">{t('updatedAt')}:</span>{' '}
                {disease.updatedAt ? new Date(disease.updatedAt).toLocaleDateString('vi-VN') : tUtils('noData')}
              </div>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title={t('detailInformation')}>
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('description')}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {disease.description || tUtils('noData')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('symptoms')}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {disease.symptoms || tUtils('noData')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('causes')}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {disease.causes || tUtils('noData')}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('prevention')}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {disease.prevention || tUtils('noData')}
              </p>
            </section>
          </div>
        </ComponentCard>

        <ComponentCard title={t('relatedFolkMedicines')}>
          {disease.folkMedicines && disease.folkMedicines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {disease.folkMedicines.map((item) => (
                <div key={item.id} className="border border-gray-200 dark:border-white/10 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">{item.title}</h4>
                  {item.slug && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('slug')}: <span className="font-mono">{item.slug}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('noRelatedFolkMedicines')}</p>
          )}
        </ComponentCard>
      </div>
    </div>
  );
};

export default DiseaseDetailPage;

