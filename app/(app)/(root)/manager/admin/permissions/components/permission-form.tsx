'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Permission } from '@/types/permission';
import { createPermission, updatePermission } from '@/services/auth-api';
const formSchema = z.object({
  name: z.string().min(1, 'Tên quyền không được để trống'),
  description: z.string().optional(),
  code: z.string().optional(),
});

type PermissionFormProps = {
  permission?: Permission | null;
  onSuccess: () => void;
};

export function PermissionForm({ permission, onSuccess }: PermissionFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: permission?.name || '',
      code: permission?.code || '',
      description: permission?.description || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (permission) {
        await updatePermission(permission.id, values);
        toast.success('Cập nhật quyền thành công');
      } else {
        await createPermission(values);
        toast.success('Tạo quyền thành công');
      }
      onSuccess();
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên quyền</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên quyền" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã quyền</FormLabel>
              <FormControl>
                <Input placeholder="Nhập mã quyền" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập mô tả cho quyền này"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="submit">
            {permission ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 