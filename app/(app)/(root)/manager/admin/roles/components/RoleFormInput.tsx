'use client';

import { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

import { featureService } from '@/services/feature-api';
import { Feature } from '@/types/feature';
import { Role } from '@/types/role';
import Switch from '@/components/form/switch/Switch';
import { useTranslations } from 'next-intl';
const formSchema = z.object({
  name: z.string().min(1, 'Tên vai trò không được để trống'),
  code: z.string().min(1, 'Mã vai trò không được để trống'),
  isActive: z.boolean(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
});

type RoleFormProps = {
  role?: Role | null;
  onCancel: () => void;
  onFormChange?: (values: z.infer<typeof formSchema>) => void;
  isView?: boolean;
};

export function RoleFormInput({ role, onFormChange, isView = false }: RoleFormProps) {
  const t = useTranslations('RolesPage');
  const tUtils = useTranslations('Utils');
  const [features, setFeatures] = useState<Feature[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role?.name || '',
      code: role?.code || '',
      isActive: role?.isActive || true,
      description: role?.description || '',
      features: role?.features!.map(p => p.id) || [],
    },
  });

  // Reset form when role changes
  useEffect(() => {
    if (role) {
      form.reset({
        name: role.name,
        code: role.code,
        isActive: role.isActive,
        description: role.description || '',
        features: role.features?.map(p => p.id) || [],
      });
    }
  }, [role, form]);

  // Gửi giá trị ban đầu của form
  useEffect(() => {
    const initialValues = form.getValues();
    onFormChange?.(initialValues);
  }, [role]);

  // Theo dõi sự thay đổi của form
  useEffect(() => {
    const subscription = form.watch((value) => {
      onFormChange?.(value as z.infer<typeof formSchema>);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onFormChange]);

  useEffect(() => {
    const fetchNavigators = async () => {
      try {
        const data = await featureService.getFeatures();
        setFeatures(data.data);
      } catch (error: any) {
        toast.error('Lỗi khi tải danh sách chức năng: ' + error.message);
      }
    };

    fetchNavigators();
  }, []);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name')}</FormLabel>
              <FormControl>
                <Input className='input-focus' placeholder={t('namePlaceholder')} {...field} disabled={isView} />
              </FormControl>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('code')}</FormLabel>
              <FormControl>
                <Input className='input-focus' disabled={role?.id != null || isView || role?.code == 'ADMIN'} placeholder={t('codePlaceholder')} {...field} />
              </FormControl>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <Switch
                label={t('status')}
                defaultChecked={field.value}
                {...field}
                disabled={isView || role?.code == 'ADMIN'}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('description')}</FormLabel>
              <FormControl>
                <Textarea className='input-focus'
                  placeholder={t('descriptionPlaceholder')}
                  {...field}
                  disabled={isView}
                />
              </FormControl>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}