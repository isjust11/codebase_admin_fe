'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { fetchPublicInvite, markInviteViewed, submitRsvp, fetchWishes, submitWish, PublicInvitePayload } from '@/services/public-invite-api';
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
  const [wishes, setWishes] = useState<Array<{ id?: string; name: string; message: string }>>([]);
  const [wishName, setWishName] = useState('');
  const [wishMessage, setWishMessage] = useState('');
  const [wishSubmitting, setWishSubmitting] = useState(false);

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
        fetchWishes(token).then(setWishes).catch(() => undefined);
      })
      .catch(() => setError(t('notFound')));
  }, [token, t]);

  const onWish = async () => {
    if (!wishMessage.trim()) return;
    setWishSubmitting(true);
    try {
      await submitWish(token, { name: wishName || payload?.guest?.name, message: wishMessage });
      setWishMessage('');
      toast.success(t('wishSuccess'));
    } catch (_err) {
      toast.error(t('wishError'));
    } finally {
      setWishSubmitting(false);
    }
  };

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
        <section id="rsvp-form" className="mt-6 bg-white rounded-xl p-5 shadow-sm space-y-4">
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
        <section className="mt-6 bg-white rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">{t('wishesTitle')}</h2>
          <div className="space-y-3">
            {wishes.map((wish) => (
              <div key={wish.id || wish.message} className="rounded-lg bg-stone-50 p-3">
                <p className="text-sm font-medium">{wish.name}</p>
                <p className="text-sm text-stone-600">{wish.message}</p>
              </div>
            ))}
          </div>
          <Input value={wishName} onChange={(e) => setWishName(e.target.value)} placeholder={t('wishName')} />
          <Textarea value={wishMessage} onChange={(e) => setWishMessage(e.target.value)} placeholder={t('wishMessage')} />
          <Button className="w-full" variant="outline" onClick={onWish} disabled={wishSubmitting}>
            {t('wishSubmit')}
          </Button>
        </section>
      </div>
    </div>
  );
}
