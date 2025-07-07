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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Permission } from '@/types/permission';
import { 
  getPermissionResources, 
  getPermissionActions, 
  getPermissionTemplates 
} from '@/services/auth-api';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  name: z.string().min(1, 'Tên quyền không được để trống'),
  description: z.string().optional(),
  code: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  featureId: z.number().optional(),
  isActive: z.boolean().default(true),
});

type PermissionFormInputProps = {
  permission?: Permission;
  onCancel: () => void;
  onFormChange: (values: z.infer<typeof formSchema>) => void;
  isView?: boolean;
};

interface Resource {
  [key: string]: string;
}

interface Action {
  [key: string]: string;
}

interface PermissionTemplate {
  name: string;
  permissions: {
    action: string;
    name: string;
    code: string;
  }[];
}

export function PermissionFormInput({ permission, onCancel, onFormChange, isView = false }: PermissionFormInputProps) {
  const t = useTranslations('PermissionsPage');
  const [resources, setResources] = useState<Resource>({});
  const [actions, setActions] = useState<Action>({});
  const [templates, setTemplates] = useState<{ [key: string]: PermissionTemplate }>({});
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [isTemplateMode, setIsTemplateMode] = useState(false);
  console.log(permission);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: permission?.name || '',
      code: permission?.code || '',
      description: permission?.description || '',
      action: permission?.action || '',
      resource: permission?.resource || '',
      featureId: permission?.featureId || undefined,
      isActive: permission?.isActive ?? false,
    },
  });

  // Fetch constants khi component mount
  useEffect(() => {
    fetchConstants();
  }, []);

  // Set selected resource và actions khi có permission data
  useEffect(() => {
    if (permission?.resource) {
      setSelectedResource(permission.resource);
    }
    if (permission?.action) {
      setSelectedActions([permission.action]);
    }
  }, [permission]);

  // Watch form changes and notify parent
  useEffect(() => {
    const subscription = form.watch((value) => {
      onFormChange(value as z.infer<typeof formSchema>);
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

  useEffect(() => {
    if (permission) {
      form.reset({
        name: permission.name || '',
        code: permission.code || '',
        description: permission.description || '',
        action: permission.action || '',
        resource: permission.resource || '',
        featureId: permission.featureId || undefined,
        isActive: permission.isActive ?? false,
      });
    }
  }, [permission]);

  const fetchConstants = async () => {
    try {
      // Fetch resources
      const resourcesData = await getPermissionResources();
      setResources(resourcesData.resources);

      // Fetch actions
      const actionsData = await getPermissionActions();
      setActions(actionsData.actions);

      // Fetch templates
      const templatesData = await getPermissionTemplates();
      setTemplates(templatesData.templates);
    } catch (error) {
      console.error('Error fetching constants:', error);
      toast.error('Lỗi khi tải dữ liệu resources và actions');
    }
  };

  const handleResourceChange = (resource: string) => {
    setSelectedResource(resource);
    setSelectedActions([]);
    form.setValue('resource', resource);
    
    // Auto-generate code if using template
    if (isTemplateMode && templates[resource]) {
      const template = templates[resource];
      const action = selectedActions[0];
      if (action) {
        const permissionData = template.permissions.find(p => p.action === action);
        if (permissionData) {
          form.setValue('name', permissionData.name);
          form.setValue('code', permissionData.code);
        }
      }
    }
  };

  const handleActionToggle = (action: string) => {
    const newActions = selectedActions.includes(action) 
      ? selectedActions.filter(a => a !== action)
      : [...selectedActions, action];
    
    setSelectedActions(newActions);
    form.setValue('action', newActions[0] || '');

    // Auto-generate code if using template
    if (isTemplateMode && selectedResource && templates[selectedResource]) {
      const template = templates[selectedResource];
      const permissionData = template.permissions.find(p => p.action === action);
      if (permissionData) {
        form.setValue('name', permissionData.name);
        form.setValue('code', permissionData.code);
      }
    }
  };

  const getResourceDisplayName = (resourceKey: string) => {
    const resourceNames: { [key: string]: string } = {
      user: 'Người dùng',
      role: 'Vai trò',
      permission: 'Quyền',
      feature: 'Tính năng',
      article: 'Bài viết',
      category: 'Danh mục',
      order: 'Đơn hàng',
      payment: 'Thanh toán',
      reservation: 'Đặt bàn',
      table: 'Bàn',
      exam: 'Bài thi',
      question: 'Câu hỏi',
      media: 'Media',
      notification: 'Thông báo',
      history: 'Lịch sử',
      food_item: 'Món ăn',
    };
    return resourceNames[resourceKey] || resourceKey;
  };

  const getActionDisplayName = (actionKey: string) => {
    const actionNames: { [key: string]: string } = {
      CREATE: 'Tạo mới',
      READ: 'Xem',
      UPDATE: 'Cập nhật',
      DELETE: 'Xóa',
      EXPORT: 'Xuất',
      IMPORT: 'Nhập',
      APPROVE: 'Phê duyệt',
      REJECT: 'Từ chối',
      PUBLISH: 'Xuất bản',
      BLOCK: 'Khóa',
      UNBLOCK: 'Mở khóa',
      ASSIGN: 'Phân quyền',
      UPLOAD: 'Tải lên',
      DOWNLOAD: 'Tải xuống',
    };
    return actionNames[actionKey] || actionKey;
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tên quyền */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('permissionName')}</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder={t('enterPermissionName')}
                    disabled={isView}
                  />
                </FormControl>
                <FormMessage className='text-red-500'/>
              </FormItem>
            )}
          />

          {/* Mã quyền */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã quyền</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Nhập mã quyền"
                    disabled={isView}
                  />
                </FormControl>
                <FormMessage className='text-red-500'/>
              </FormItem>
            )}
          />

          {/* Resource */}
          <FormField
            control={form.control}
            name="resource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource</FormLabel>
                <Select 
                  onValueChange={handleResourceChange} 
                  defaultValue={field.value}
                  disabled={isView}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn resource" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className='bg-white dark:bg-gray-800'>
                    {Object.entries(resources).map(([key, value]) => (
                      <SelectItem key={key} value={key} className='hover:bg-gray-100 dark:hover:bg-gray-700' >
                        {getResourceDisplayName(key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className='text-red-500'/>
              </FormItem>
            )}
          />

          {/* Action */}
          <FormField
            control={form.control}
            name="action"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Action</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleActionToggle(value);
                  }} 
                  defaultValue={field.value}
                  disabled={isView}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn action" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className='bg-white dark:bg-gray-800'>
                    {Object.entries(actions).map(([key, value]) => (
                      <SelectItem key={key} value={key} className='hover:bg-gray-100 dark:hover:bg-gray-700'>
                        {getActionDisplayName(key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className='text-red-500'/>
              </FormItem>
            )}
          />

          {/* Trạng thái */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isView}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Kích hoạt</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Mô tả */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('description')}</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder={t('enterDescription')}
                  disabled={isView}
                  rows={4}
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