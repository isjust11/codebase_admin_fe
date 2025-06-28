'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';
import { register, resendEmail } from '@/services/auth-api';
import { RegisterCode, RegisterResultDto } from '@/types/dto/RegisterResultDto';
import { useTranslations } from 'next-intl';
import { SITE } from '@/config/config';

export default function RegisterPage() {
  const t = useTranslations("RegisterPage");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [isSendEmail, setIsSendEmail] = useState(false);

  // Schéma de validation với các key đa ngôn ngữ
  const formSchema = z.object({
    username: z.string().min(3, t('validation.usernameMin'))
      .max(20, t('validation.usernameMax')),
    password: z.string().min(6, t('validation.passwordMin')),
    confirmPassword: z.string(),
    fullName: z.string().optional(),
    email: z.string().email(t('validation.emailInvalid')).max(50, t('validation.emailMax')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordMismatch'),
    path: ['confirmPassword'],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const response: RegisterResultDto = await register({
        username: values.username,
        password: values.password,
        fullName: values.fullName || undefined,
        email: values.email || undefined
      });
      if (response.code === RegisterCode.Ok) {
        setIsSendEmail(true);
        toast.success(t('messages.emailSent', { email: values.email }));
      } else if (response.code === RegisterCode.AccountValidated) {
        toast.info(response.message);
        router.push('/login');
      } else if (response.code === RegisterCode.AccountIsExist) {
        toast.error(response.message);
        form.setError('username', { message: response.message });
      } else if (response.code === RegisterCode.ExistEmail) {
        toast.error(response.message);
        form.setError('email', { message: response.message });
      } else {
        toast.error(response.message);
      }

    } catch (error: any) {
      toast.error(t('messages.registerError', { message: error.response.data.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      await resendEmail(form.getValues('email') || '');
      setIsSendEmail(true);
      toast.success(t('messages.emailSent', { email: form.getValues('email') }));
    } catch (error: any) {
      toast.error(t('messages.resendEmailError', { message: error.response.data.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        {isSendEmail ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold">{t('emailSentTitle')}</h1>
            <p className="text-gray-500 mt-2">
              {t('emailSentDescription')}
            </p>
            <Button disabled={isLoading} onClick={handleResendEmail} className="mt-4 w-full bg-primary text-white">
              {isLoading ? t('sendingEmail') : t('resendEmailButton')}
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-fuchsia-800 text-title-sm dark:text-white/90 sm:text-title-md">{t('registerTitle')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('description', { siteName: SITE.name })}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('username')}<span className="text-error-500">*</span></FormLabel>
                      <FormControl>
                        <Input className='input-focus' placeholder={t('usernamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage className='text-red-500' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fullName')}</FormLabel>
                      <FormControl>
                        <Input className='input-focus' placeholder={t('fullNamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage className='text-red-500' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email')}<span className="text-error-500">*</span></FormLabel>
                      <FormControl>
                        <Input className='input-focus' placeholder={t('emailPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage className='text-red-500' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('password')}<span className="text-error-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          className='input-focus'
                          type="password"
                          placeholder={t('passwordPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='text-red-500' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('confirmPassword')}<span className="text-error-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          className='input-focus'
                          type="password"
                          placeholder={t('confirmPasswordPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='text-red-500' />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full py-5 text-sm font-normal text-white transition-colors bg-fuchsia-700 rounded-lg hover:bg-fuchsia-600 dark:bg-fuchsia-400 dark:hover:bg-fuchsia-500"
                  disabled={isLoading}
                >
                  {isLoading ? t('registering') : t('registerButton')}
                </Button>
              </form>
            </Form>

            <div className="text-center mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                {t('hasAccount')}{' '}
                <Link href="/login" className="text-fuchsia-500 hover:text-fuchsia-600 dark:text-fuchsia-400">
                  {t('login')}
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 