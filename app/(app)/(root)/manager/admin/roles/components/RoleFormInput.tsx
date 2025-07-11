'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
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

// Tạo schema validation với đa ngôn ngữ
const createFormSchema = (t: any) => z.object({
  name: z.string().min(6, t('validation.nameMinLength')),
  code: z.string().min(6, t('validation.codeMinLength')),
  isActive: z.boolean(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
});

type RoleFormProps = {
  role?: Role | null;
  onCancel: () => void;
  onFormChange?: (values: any) => void;
  isView?: boolean;
};

 export const RoleFormInput = forwardRef<{ validate: () => boolean }, RoleFormProps>(({ role, onFormChange, isView = false }, ref) => {
  const t = useTranslations('RolesPage');
  const [features, setFeatures] = useState<Feature[]>([]);

  // Tạo schema validation với đa ngôn ngữ
  const formSchema = createFormSchema(t);

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
    const subscription = form.watch((value: any) => {
      onFormChange?.(value as z.infer<typeof formSchema>);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onFormChange, formSchema]);

  useEffect(() => {
    const fetchNavigators = async () => {
      try {
        const data = await featureService.getFeatures();
        setFeatures(data.data);
      } catch (error: any) {
        toast.error(t('errorNotify') + error.message);
      }
    };

    fetchNavigators();
  }, []);

  useImperativeHandle(ref, () => ({
    validate: () => {
      form.trigger();
      return form.formState.isValid;
    }
  }));

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t('name')}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t('namePlaceholder')} 
                  {...field} 
                  disabled={isView}
                  className={fieldState.invalid ? 'input-error' : ''}
                  onBlur={() => form.trigger('name')}
                  onChange={(e) => {
                    field.onChange(e);
                    form.trigger('name');
                  }}
                />
              </FormControl>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t('code')}</FormLabel>
              <FormControl>
                <Input 
                  disabled={role?.id != null || isView || role?.code == 'ADMIN'} 
                  placeholder={t('codePlaceholder')} 
                  {...field} 
                  className={fieldState.invalid ? 'input-error' : ''}
                  onBlur={() => form.trigger('code')}
                  onChange={(e) => {
                    field.onChange(e);
                    form.trigger('code');
                  }}
                />
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
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t('description')}</FormLabel>
              <FormControl>
                <Textarea 
                  className={`input-focus ${fieldState.invalid ? 'input-error' : ''}`}
                  placeholder={t('descriptionPlaceholder')}
                  {...field}
                  disabled={isView}
                  onBlur={() => form.trigger('description')}
                  onChange={(e) => {
                    field.onChange(e);
                    form.trigger('description');
                  }}
                />
              </FormControl>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
});

RoleFormInput.displayName = 'RoleFormInput';