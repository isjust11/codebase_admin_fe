import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { User } from '@/services/user-api';
import { getRoles } from '@/services/auth-api';
import { Role } from '@/types/role';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import AssignRoleList from './AssignRoleList';

const formSchema = (t: (key: string) => string) => z.object({
  username: z.string().min(1, t('usernameRequired')),
  password: z.string().min(1, t('passwordRequired')),
  fullName: z.string().optional(),
  email: z.string().email(t('emailInvalid')).optional(),
  isAdmin: z.boolean(),
  roleIds: z.array(z.string()).optional(),
});

type UserFormProps = {
  user?: User | null;
  onCancel: () => void;
  onFormChange?: (values: z.infer<ReturnType<typeof formSchema>>) => void;
  isView?: boolean;
};

export function UserFormInput({ user, onFormChange, isView = false }: UserFormProps) {
  const t = useTranslations('UserForm');
  const [roles, setRoles] = useState<Role[]>([]);

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      username: user?.username || '',
      password: '',
      fullName: user?.fullName || '',
      email: user?.email || '',
      isAdmin: user?.isAdmin || false,
      roleIds: user?.roles?.map(role => role.id) || [],
    },
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        setRoles(response.data);
      } catch (_error) {
        // Handle error
      }
    };

    fetchRoles();
  }, []);

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        password: '',
        fullName: user.fullName || '',
        email: user.email || '',
        isAdmin: user.isAdmin,
        roleIds: user.roles?.map(role => role.id) || [],
      });
    }
  }, [user, form]);

  // Gửi giá trị ban đầu của form
  useEffect(() => {
    if (user) {
      const initialValues = form.getValues();
      onFormChange?.(initialValues);
    }
  }, [user, form]);

  // Theo dõi sự thay đổi của form
  useEffect(() => {
    const subscription = form.watch((value) => {
      onFormChange?.(value as z.infer<ReturnType<typeof formSchema>>);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onFormChange]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('username')}</FormLabel>
              <FormControl>
                <Input className='input-focus' placeholder={t('usernamePlaceholder')} {...field} disabled={isView || !!user} />
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
              <FormLabel>
                {user ? t('newPassword') : t('password')}
              </FormLabel>
              <FormControl>
                <Input
                  className='input-focus'
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  {...field}
                  disabled={isView}
                />
              </FormControl>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
        <div className='flex items-center space-x-2'>
          <div className='flex-1'>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fullName')}</FormLabel>
                  <FormControl>
                    <Input className='input-focus' placeholder={t('fullNamePlaceholder')} {...field} disabled={isView} />
                  </FormControl>
                  <FormMessage className='text-red-500' />
                </FormItem>
              )}
            />
          </div>
          <div className='flex-1'>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input className='input-focus' type="email" placeholder={t('emailPlaceholder')} {...field} disabled={isView} />
                  </FormControl>
                  <FormMessage className='text-red-500' />
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name="isAdmin"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  className='h-4 w-4'
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isView}
                />
              </FormControl>
              <FormLabel>{t('adminPermission')}</FormLabel>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="roleIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('roles')}</FormLabel>
              <AssignRoleList
                roles={roles}
                assignedRoleIds={field.value?.map(id => id.toString()) || []}
                onChange={field.onChange}
                isView={isView}
              />
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />

      </form>
    </Form>
  );
} 