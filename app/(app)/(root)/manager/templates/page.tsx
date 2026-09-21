'use client';

import { Suspense } from 'react';
import TemplateList from './components/TemplateList';
import { useTranslations } from 'next-intl';

function TemplatesIntro() {
  const t = useTranslations('TemplatePage');
  return (
    <div className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
      <p className="font-medium text-stone-800">{t('title')}</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        <li>{t('steps.basicHint')}</li>
        <li>{t('steps.themeHint')}</li>
        <li>{t('steps.schemaHint')}</li>
        <li>{t('steps.reviewHint')}</li>
      </ol>
    </div>
  );
}

export default function TemplatesManagement() {
  return (
    <Suspense>
      <div>
        <TemplatesIntro />
        <TemplateList />
      </div>
    </Suspense>
  );
}
