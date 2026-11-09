'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resendPin, verifyPin } from '@/services/auth-api';
import { AppRoutes } from '@/constants';

const PIN_LENGTH = 4;

function VerifyEmailContent() {
  const t = useTranslations('VerifyEmail');
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';

  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== PIN_LENGTH) {
      toast.error(t('messages.pinInvalidLength', { length: PIN_LENGTH }));
      return;
    }
    setIsVerifying(true);
    try {
      const res = await verifyPin(email, pin);
      toast.success(res?.message || t('messages.verifyEmailSuccess'));
      router.push(AppRoutes.Auth.Login);
    } catch (error: any) {
      toast.error(t('messages.verifyEmailError') + (error?.response?.data?.message ?? ''));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const res = await resendPin(email);
      setPin('');
      toast.success(res?.message || t('messages.resendSuccess', { email }));
    } catch (error: any) {
      toast.error(t('messages.resendError') + (error?.response?.data?.message ?? ''));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="p-3 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 shadow-sm dark:bg-white/[0.03]">
          <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>

          {!email ? (
            <>
              <p className="text-gray-600 mb-6">{t('missingEmail')}</p>
              <Link href={AppRoutes.Auth.Register} className="text-fuchsia-500 hover:text-fuchsia-600">
                {t('backToRegister')}
              </Link>
            </>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <p className="text-gray-600">
                {t('description', { email })}
              </p>
              <Input
                className="input-focus text-center text-2xl tracking-[0.5em]"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={PIN_LENGTH}
                placeholder={t('pinPlaceholder')}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH))}
              />
              <Button
                type="submit"
                disabled={isVerifying || pin.length !== PIN_LENGTH}
                className="w-full py-5 text-sm font-normal text-white transition-colors bg-fuchsia-700 rounded-lg hover:bg-fuchsia-600 dark:bg-fuchsia-400 dark:hover:bg-fuchsia-500"
              >
                {isVerifying ? t('verifying') : t('verifyEmailButton')}
              </Button>
              <p className="text-sm text-center text-gray-600">
                {t('notReceived')}{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-fuchsia-500 hover:text-fuchsia-600 disabled:opacity-50"
                >
                  {isResending ? t('resending') : t('resendButton')}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
