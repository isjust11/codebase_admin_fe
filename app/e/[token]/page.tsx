'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { fetchPublicInvite, markInviteViewed, submitRsvp, PublicInvitePayload } from '@/services/public-invite-api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Toaster } from 'sonner';

export default function PublicInvitePage() {
  const params = useParams();
  const token = String(params.token || '');
  const t = useTranslations('PublicInvite');
  const [payload, setPayload] = useState<PublicInvitePayload | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('ATTENDING');
  const [note, setNote] = useState('');
  const [plusOnes, setPlusOnes] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchPublicInvite(token)
      .then((data) => {
        setPayload(data);
        if (data.guest?.rsvpStatus && data.guest.rsvpStatus !== 'PENDING') {
          setStatus(data.guest.rsvpStatus);
          setNote(data.guest.rsvpNote || '');
          setPlusOnes(data.guest.plusOnes || 0);
        }
        markInviteViewed(token).catch(() => undefined);
      })
      .catch(() => setError(t('notFound')));
  }, [token, t]);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      await submitRsvp(token, { status, note, plusOnes: Number(plusOnes) || 0 });
      toast.success(t('success'));
    } catch (_err) {
      toast.error(t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50">
        <p className="text-stone-600">{error}</p>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50">
        <p className="text-stone-600">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <Toaster position="top-center" richColors />
      <div className="max-w-xl mx-auto px-4 py-6">
        {payload.html ? (
          <iframe
            title={payload.event?.title || 'EventLab'}
            className="w-full min-h-[70vh] bg-white rounded-xl shadow-sm border-0"
            srcDoc={payload.html}
          />
        ) : null}
        <section className="mt-6 bg-white rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">{t('rsvpTitle')}</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'ATTENDING', label: t('attending') },
              { id: 'DECLINED', label: t('declined') },
              { id: 'MAYBE', label: t('maybe') },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setStatus(option.id)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  status === option.id ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div>
            <label className="text-sm text-stone-600">{t('plusOnes')}</label>
            <Input type="number" min={0} value={plusOnes} onChange={(e) => setPlusOnes(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm text-stone-600">{t('note')}</label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button className="w-full" onClick={onSubmit} disabled={submitting}>
            {t('submit')}
          </Button>
        </section>
      </div>
    </div>
  );
}
