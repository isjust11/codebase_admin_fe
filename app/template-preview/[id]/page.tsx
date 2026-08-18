'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import QRCode from 'react-qr-code';
import { toast, Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import PhoneFrame from '@/components/eventlab/PhoneFrame';
import { fetchPublicTemplatePreview, PublicTemplatePreview } from '@/services/public-template-api';

export default function PublicTemplatePreviewPage() {
  const params = useParams();
  const id = String(params.id || '');
  const t = useTranslations('PublicTemplatePreview');
  const [payload, setPayload] = useState<PublicTemplatePreview | null>(null);
  const [error, setError] = useState('');
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchPublicTemplatePreview(id)
      .then(setPayload)
      .catch(() => setError(t('notFound')));
  }, [id, t]);

  const useTemplate = async () => {
    const deepLink = `eventlab://template/${id}`;
    window.location.href = deepLink;
    window.setTimeout(async () => {
      try {
        await navigator.clipboard.writeText(pageUrl || window.location.href);
        toast.success(t('copiedLink'));
      } catch {
        toast.success(t('copiedLink'));
      }
    }, 1200);
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#efe6d9] p-6">
        <p className="text-stone-600">{error}</p>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#efe6d9] p-6">
        <p className="text-stone-600">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efe6d9]">
      <Toaster position="top-center" richColors />
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 lg:flex-row lg:items-start lg:justify-center">
        <PhoneFrame html={payload.html} title={payload.template?.name || 'EventLab'} />
        <aside className="w-full max-w-sm space-y-5 rounded-2xl bg-white/70 p-6 shadow-sm backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">EventLab</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-900">{payload.template?.name}</h1>
          </div>
          {payload.template?.description ? (
            <p className="text-sm leading-6 text-stone-600">{payload.template.description}</p>
          ) : null}
          <Button className="w-full" onClick={useTemplate}>
            {t('useTemplate')}
          </Button>
          <a href={`eventlab://template/${id}`} className="block text-center text-sm text-stone-500 underline">
            {t('openApp')}
          </a>
          {pageUrl ? (
            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="rounded-xl bg-white p-3">
                <QRCode value={pageUrl} size={140} />
              </div>
              <p className="text-center text-xs text-stone-500">{t('scanQr')}</p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
