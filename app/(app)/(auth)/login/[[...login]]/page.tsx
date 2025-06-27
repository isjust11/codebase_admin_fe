'use client';

import { useEffect, useState } from 'react';
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
import { forgotPassword, login } from '@/services/auth-api';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { decrypt, encrypt } from '@/lib/utils';
import { AppConstants } from '@/constants';

// Schéma de validation
const formSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  remember: z.boolean().optional(),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      remember: false,
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadData = async () => {
        const remember = localStorage.getItem(AppConstants.Remember);
        if (remember) {
          form.setValue('remember', remember === 'true');
          form.setValue('username', localStorage.getItem(AppConstants.Username) || '');
          const password = localStorage.getItem(AppConstants.Password);
          // form.setValue('password', decrypt(password || ''));
        }
      }
      loadData();
    }
  }, [form]);

  const handleForgotPassword = async () => {
    try {
      setIsLoading(true);
      const response = await forgotPassword(form.getValues('username'));
      toast.success(response.message);
    } catch (_error) {
      toast.error('Lỗi khi gửi email');
    } finally {
      setIsLoading(false);
    }
  }
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await login({
        username: values.username,
        password: values.password
      });
      if (values.remember) {
        localStorage.setItem(AppConstants.Remember, 'true');
        localStorage.setItem(AppConstants.Username, values.username);
        localStorage.setItem(AppConstants.Password, encrypt(values.password));
      } else {
        localStorage.removeItem(AppConstants.Remember);
        localStorage.removeItem(AppConstants.Username);
        localStorage.removeItem(AppConstants.Password);
      }
      toast.success('Đăng nhập thành công');
      router.push('/');
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error);
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // await loginWithGoogle();
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleFacebookLogin = async () => {
    // await loginWithFacebook();
    window.location.href = `${apiUrl}/auth/facebook`;
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Đăng nhập</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Đăng nhập vào tài khoản Easy Order của bạn
          </p>
        </div>
        <div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
            <Button
              type="button"
              variant="outline"
              className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              onClick={handleGoogleLogin}
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              Đăng nhập với Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              onClick={handleFacebookLogin}
            >
              <FaFacebook className="mr-2 h-4 w-4 text-blue-600" />
              Đăng nhập với Facebook
            </Button>
          </div>
          <div className="relative py-3 sm:py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                Hoặc
              </span>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập<span className="text-error-500">*</span></FormLabel>
                    <FormControl>
                      <Input className='input-focus' placeholder="Nhập tên đăng nhập" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu<span className="text-error-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        className='input-focus'
                        type="password"
                        placeholder="Nhập mật khẩu của bạn"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FormField
                    control={form.control}
                    name="remember"
                    render={({ field }) => (
                      <Checkbox id="remember" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="remember" className='block font-normal text-gray-700 text-theme-sm dark:text-gray-400'>Nhớ tài khoản</Label>
                </div>
                <p className={`text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 cursor-pointer ${isLoading ? 'pointer-events-none' : ''}`}
                  onClick={() => isForgotPasswordLoading ? null : handleForgotPassword()}>
                  {isForgotPasswordLoading ? 'Đang gửi email...' : 'Quên mật khẩu?'}
                </p>
              </div>
              <Button
                type="submit"
                className="w-full py-3 text-sm font-normal text-white transition-colors bg-brand-500 rounded-lg hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-500"
                disabled={isLoading}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>
          </Form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Bạn chưa có tài khoản?{' '}
              <Link href="/register" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 