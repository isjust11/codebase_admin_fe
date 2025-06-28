'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { verifyResetPassword } from '@/services/auth-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useTranslations } from 'next-intl';

function ResetPasswordContent() {
    const t = useTranslations("ResetPasswordPage");
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [isLoading, setIsLoading] = useState(false);

    // Schéma de validation với các key đa ngôn ngữ
    const formSchema = z.object({
        password: z.string().min(6, t('validation.passwordMin')),
        confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: t('validation.passwordMismatch'),
        path: ['confirmPassword'],
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const handleResetPassword = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);
            await verifyResetPassword(token || '', values.password);
            toast.success(t('messages.updateSuccess'));
            router.push('/login');
        } catch (error: any) {
            toast.error(t('messages.updateError', { message: error.response.data.message }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('password')}</FormLabel>
                                    <FormControl>
                                        <Input className='input-focus' type="password" placeholder={t('passwordPlaceholder')} {...field} />
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
                                    <FormLabel>{t('confirmPassword')}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder={t('confirmPasswordPlaceholder')} {...field} />
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
                            {isLoading ? t('updating') : t('updateButton')}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
} 